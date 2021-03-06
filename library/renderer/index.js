/**
 * package: nodakwaeri
 * sub-package: renderer
 * author:  Richard B. Winters <a href='mailto:rik@mmogp.com'>Rik At MMOGP</a>
 * copyright: 2011-2015 Massively Modified, Inc.
 * license: Apache, Version 2.0 <http://www.apache.org/licenses/LICENSE-2.0>
 */


// Deps;
var fs = require( 'fs' );


/**
 * Entry point for the application renderer
 *
 * @param rtools    Rendering tools
 * @param dpath     Derived path to application views
 *
 * @since 0.2.4
 */
function renderer( rtools, dpath )
{
    this.nk = rtools;
    this.rtools = new this.nk.html( this.nk );
    this.dpath = dpath;
    this.date = new Date();
};


/**
 * Fetches the layout content so it can be parsed
 *
 * @param request
 * @param response
 * @param klay
 *
 * @since 0.2.5
 */
renderer.prototype.turn = function( request, response, klay )
{
    // We would normally invoke the nodaklay module, and use the Pottr to construct our layout.  For now we will use a JS
    // version in order to help spur on development.
    var vpath = this.dpath;
    var processor = this;

    // Construct will check if there is a layout specified, and invoke parse accordingly.
    if( klay.layout )
    {
        fs.readFile
        (
            vpath + '/' + klay.layout + '.kml',
            'utf8',
            function( error, ldata )
            {
                var buffer;

                // If there is an error
                if( error )
                {
                    // Log it
                    console.log( 'Error reading layout: ' + vpath + '/' + klay.layout + '.kml' );

                    // And set content to contain an error message
                    buffer = "<html><head><title>Failure</title></head><body><h1>Too Bad...</h1><p>There was an issue loading the requested layout!</p></body></html>";

                    response.statusCode = 200;
                    response.setHeader( 'Content-Type', 'text/html' );
                    //response.writeHead( 200, { 'Content-Type': 'text/html' } );
                    response.write( buffer );
                    response.end();
                }
                else
                {
                    // Success
                    // There should always be a body
                    fs.readFile
                    (
                        vpath + '/' + klay.controller + '/' + klay.view + '.kml',
                        'utf8',
                        function( error, vdata )
                        {
                            var buffer;

                            if( error )
                            {
                                // Log it
                                console.log( 'Error reading view, ' + vpath + '/' + klay.controller + '/' + klay.view + '.kml' );

                                // And set content to contain an error message
                                buffer = "<html><head><title>Failure</title></head><body><h1>Too Bad???...</h1><p>There was an issue loading the requested view!</p></body></html>";

                                response.statusCode = 200;
                                response.setHeader( 'Content-Type', 'text/html' );
                                //response.writeHead();
                                response.write ( buffer );
                                response.end();
                            }
                            else
                            {
                                //var pottr = nodakwaeri.klay();
                                //pottr.turn( request, response, klay );
                                klay.layout = ldata;
                                klay.view = vdata;

                                processor.shape( request, response, klay );
                            }
                        }
                    );
                }
            }
        );
    }else
    {
        // There should always be a body
        fs.readFile
        (
            view_path + '/' + klay.controller + '/' + klay.view + '.kml',
            'utf8',
            function( error, vdata )
            {
                var buffer;

                if( error )
                {
                    // Log it
                    console.log( 'Error reading view, ' + vpath + '/' + klay.controller + '/' + klay.view + '.kml' );

                    // And set content to contain an error message
                    buffer = "<html><head><title>Failure</title></head><body><h1>Too Bad???...</h1><p>There was an issue loading the requested view!</p></body></html>";

                    response.statusCode = 200;
                    response.setHeader( 'Content-Type', 'text/html' );
                    //response.writeHead();
                    response.write ( buffer );
                    response.end();
                }
                else
                {
                    //var pottr = nodakwaeri.klay();
                    //pottr.turn( request, response, klay );
                    klay.layout = false;
                    klay.view = vdata;

                    processor.shape( request, response, klay );
                }
            }
        );
    }
};


/**
 * Fetches a partial view so it can be parsed
 *
 * @param piece
 *
 * @since 2.5
 */
renderer.prototype.partial = function( piece )
{
    var processor = this;
    if( piece )
    {
        fs.readFile
        (
            this.dpath + '/' + piece + '.kml',
            'utf8',
            function( error, pdata )
            {
                var buffer;

                // If there is an error
                if( error )
                {
                    // Log it
                    console.log( 'Error reading partial: ' + klay.partial[p] + '.kml' );

                    // And set content to contain an error message
                    buffer = "<html><head><title>Failure</title></head><body><h1>Too Bad...</h1><p>There was an issue loading the requested layout!</p></body></html>";

                    response.statusCode = 200;
                    response.setHeader( 'Content-Type', 'text/html' );
                    //response.writeHead( 200, { 'Content-Type': 'text/html' } );
                    response.write( buffer );
                    response.end();
                }
                else
                {
                    // Success
                    return pdata;
                }
            }
        );
    }
    return false;
};


/**
 * Pieces together - and sends - the response
 *
 * @param request
 * @param response
 * @param klay
 *
 * @since 0.0.1
 */
renderer.prototype.shape = function( request, response, klay )
{
    var processor = this;
    if( klay )
    {
        klay.authenticated = request.isAuthenticated;
    }

    // Now let's prepare the body content; there may not be a layout, but if there is we need the body first.
    var body = klay.view;
    body = this.parse( body, klay );

    // If a layout was requested, let's prep it
    if( klay.layout )
    {
        klay.view = body;
        var view = klay.layout;
        view = this.parse( view, klay );

        response.statusCode = 200;
        response.setSession();
        response.setHeader( 'Content-Type', 'text/html' );
        response.write( view );
        response.end();
    }
    else
    {
        response.statusCode = 200;
        response.setSession();
        response.setHeader( 'Content-Type', 'text/html' );
        response.write( body );
        response.end();
    }
};


/**
 * Parses kwaeri script
 *
 * @param content
 * @param klay
 * @param iteration
 * @param identification
 *
 * @since 0.0.5
 */
renderer.prototype.parse = function( content, klay, iteration, identification )
{
    // Shedding some light on syntax:
    // If you have a predeclared variable in question, you can use the ol' fashioned if( !var )
    // this will check against undefined, null, and false.
    // If you're not sure the variable exists, use if( var == null ), the two equal-sign characters
    // check var against both null and undefined, since undefined evaluates to null.
    if( !iteration )
    {
        //console.log( 'parse not iterated: ' + iteration );
        iteration = false;
    }

    if( !identification )
    {
        //console.log( 'parse not identified: ' + identification );
        identification = false;
    }

    var processor = this,
    o = content
    .replace // First strip all comments
    (   /[^:"](\/\/[^\r\n]*)[\r\n]|(\/\*(.*)\*\/)*/mg,
        function( match, singline, multiline, extra )
        {
            return "";
        }
    )
    .replace // Now we parse through the subscript blocks and invoke any members and replace any variables
    (   /(\[\[[\s]*?(([\w_]*)((\.([\w_]*))*(\((.*)\))*([\s]*\{([^]*)\}[\s]*)?([\s]*(else\{(.*)\})[\s]*)?)*)[\s]*?\]\])/mg,
        function( match, subscript, codeflow, fof, memflow, memstring, member, argflow, args, ssflow, superscript, esflow, extrascript )
        {
            if( fof === 'partial' )
            {
                if( args )
                {
                    var pdata = args;
                    pdata = pdata.replace( /^[\s\r\n]*|[\s\r\n]*$/g, '' );

                    return processor.parse( processor.partial( pdata ), klay );
                }
                return "";
            }

            if( fof === 'if' )
            {
                //console.log( codeflow );
                //console.log( 'ARGS: \n\n');
                var argument = args.replace( /[\s\r\n]*/g, '' );
                //console.log( args );
                //console.log( '\n\n ENDSSFLOW');

                var pieces = ssflow.split( "else" );
                if( pieces.length > 1 )
                {
                    if( klay.viewbag.hasOwnProperty( argument ) || klay.hasOwnProperty( argument ) )
                    {
                        var status;
                        if( argument === 'authenticated' )
                        {
                            if( klay[argument] )
                            {
                                status = true;
                            }
                        }
                        else
                        {
                            if( klay.viewbag[argument] )
                            {
                                status = true;
                            }
                        }

                        if( status )
                        {
                            if( !pieces[0] )
                            {
                                return '';
                            }

                            //console.log( 'PIECE1: \n\n' );
                            pieces[0] = pieces[0].replace( /^[\s\r\n]*\{|\}?[\s\r\n]*$/g, '' );
                            //console.log( pieces[0] );

                            return processor.parse( pieces[0], klay );
                        }
                        else
                        {
                            if( !pieces[1] )
                            {
                                return '';
                            }

                            //console.log( '\n\n PIECE2: \n\n');
                            pieces[1] = pieces[1].replace( /^[\s\r\n]*\{|\}?[\s\r\n]*$/g, '' );
                            //console.log( pieces[1] );

                            return processor.parse( pieces[1], klay );
                        }
                    }
                    else
                    {
                        if( !pieces[1] )
                        {
                            return '';
                        }

                        //console.log( '\n\n PIECE2: \n\n');
                        pieces[1] = pieces[1].replace( /^[\s\r\n]*\{|\}?[\s\r\n]*$/g, '' );
                        //console.log( pieces[1] );

                        return processor.parse( pieces[1], klay );
                    }
                }
                else
                {
                    if( klay.viewbag.hasOwnProperty( argument ) || klay.hasOwnProperty( argument ) )
                    {
                        if( !pieces[0] )
                        {
                            return '';
                        }

                        var status;
                        if( argument === 'authenticated' )
                        {
                            if( klay[argument] )
                            {
                                status = true;
                            }
                        }
                        else
                        {
                            if( klay.viewbag[argument] )
                            {
                                status = true;
                            }
                        }

                        if( !status )
                        {
                            return '';
                        }

                        //console.log( 'PIECE1: \n\n' );
                        pieces[0] = pieces[0].replace( /^[\s\r\n]*\{|\}?[\s\r\n]*$/g,'' );
                        //console.log( pieces[0] );

                        return processor.parse( pieces[0], klay );
                    }
                    else
                    {
                        return '';
                    }

                }

                return 'NoGottedIt';
            }

            if( fof === 'foreach' )
            {
                var found = false,
                pieces = false,
                iterator = false,
                identifier = false,
                subscript = superscript,
                ncf = codeflow;

                // For some reason we cannot single out the arguments when there are curly brackets following
                // so let's parse it out from a smaller piece of data
                found = ncf.replace
                (   /\([\s]*([_\w\s]*)[\s]*\)/g,
                    function( match, match1 )
                    {
                        pieces = match1;
                        return;
                    }
                );

                if( found )
                {
                    found = true;
                }

                if( pieces )
                {
                    pieces = pieces.split( " as " );

                    if( pieces.length > 1 )
                    {
                        // User has specified '..as <identifier>'
                        iterator = pieces[0];
                        identifier = pieces[1];
                    }
                    else
                    {
                        iterator = pieces[0];
                    }

                }

                // Strip all white space
                identifier = identifier.replace( /^[\s\r\n]*|[\s\r\n]*$/g, '' );
                //console.log( 'iterator:' + iterator );
                //console.log( 'identifier:' + identifier );
                //console.log( ssflow );
                //console.log( superscript );

                // Now, for each member of our array or object, we want to recursively run some scripts.  There could
                // also be plain html, which should be copied and values parsed for each iteration.  Everything within
                // superscript should be run/copied for each iteration, and should be passed only the member/record that
                // the iteration pertains to.
                var so = "";
                if( klay.viewbag.hasOwnProperty( iterator ) )
                {
                    for( var record in klay.viewbag[iterator] )
                    {
                        // We pass the individual record as well as the entire contents of the foreach call, to be parsed
                        // by the processor.  By passing the individual record, our processor will know to use the passed
                        // record for values within
                        //console.log( record );
                        //console.log( superscript );
                        if( identifier )
                        {
                            so += processor.parse( superscript, klay, klay.viewbag[iterator][record], identifier );
                        }
                        else
                        {
                            so += processor.parse( superscript, klay, klay.viewbag[iterator][record], false );
                        }
                    }

                    return so;
                }

                return so;
            }

            if( fof === 'html' )
            {
                // Here we need to apply logic for filtering iterated parses
                if( iteration  )
                {
                    if( identification )
                    {
                        return processor.decorate( fof, args, klay, memstring, iteration, identification );
                    }
                    else
                    {
                        return processor.decorate( fof, args, klay, memstring, iteration, false );
                    }
                }
                else
                {
                    return processor.decorate( fof, args, klay, memstring, false, false );
                }
            }

            if( iteration )
            {
                if( identification )
                {
                    //console.log( 'this one id: ' + iteration + ' id: ' + identification );
                    return processor.decorate( codeflow, codeflow, klay, "", iteration, identification );
                }
                else
                {
                    //console.log( 'this one noid: ' + iteration + ' id: ' + identification );
                    return processor.decorate( codeflow, codeflow, klay, "", iteration, false );
                }
            }
            else
            {
                //console.log( 'this one noiterator: ' + iteration + ' id: ' + identification  );
                return processor.decorate( codeflow, codeflow, klay, "", false, false );
            }
        }
    );

    return o;
};


/**
 * Returns the result of a subscript
 *
 * @param fof
 * @param args
 * @param klay
 * @param memstring
 * @param iteration
 * @param identification
 *
 * @since 0.2.4
 */
renderer.prototype.decorate = function( fof, args, klay, memstring, iteration, identification )
{
    var processor = this;

    if( !iteration )
    {
        iteration = false;
        //console.log( 'decor not iterated - ' + iteration );
    }

    if( !identification )
    {
        identification = false;
        //console.log( 'decor not identified - ' + identification );
    }

    // Returns the output of the subscript
    switch( fof )
    {
        case 'test':
        {
            return 'Test replacement worked!';
        }break;

        case 'title':
        {
            return klay.viewbag.title;
        }break;

        case 'pagetitle':
        {
            return klay.viewbag.pagetitle;
        }break;

        case 'body':
        {
            return klay.view;
        }break;

        case 'date.year':
        {
            return this.date.getFullYear();
        }break;

        case 'model':
        {
            return 'model';
        }break;

        case 'html':
        {
            var rtools = processor.rtools,
            subscript = args,
            rargs = [],
            control = 0;

            // Strip our arguments
            subscript = subscript
            .replace    //(((([a-zA-Z0-9_]*)(\.([a-zA-Z0-9_]*))*(\((.*)\))?[\}]?)|([\{](.*)\}))[\,]?)*/mg,
            (   /(((([a-zA-Z0-9_]*)(\.([a-zA-Z0-9_]*))*(\((.*)\))?[\}]?)|([\{](.*)\}))[\,]?)*/mg,
                function( match, match2, match3, noobjarg, method, memflow, member, argflow, argstring, objarg, objcontents  )
                {
                    if( match3 )
                    {
                        rargs[control] = match3;
                        control++;
                    }
                    return "";
                }
            );

            // The memstring contained .<whatever members were present after html>, let's split it
            var members = memstring.split( '.' );
            //console.log( members[0] + ' - ' + members[1] );

            // Make sure the rendering tools support the requested method
            if( rtools._classmap.hasOwnProperty( members[1] ) )
            {
                var memberparts = rargs[0].split( '.' );
                if( memberparts[0] === 'model' )
                {   // We'll grab the display text value from the model's schema
                    if( memberparts[1] )
                    {
                        if( klay.model.schema.hasOwnProperty( memberparts[1] ) )
                        {
                            rargs[0] = [ memberparts[1], klay.model ];
                        }
                        else
                        {
                            console.log( 'Error: Unknown member: `[Model].' + memberparts[1] + '`.' );
                            rargs[0] = [ false, 'Unknown member:  `[Model].' + memberparts[1] + '`.' ];
                        }
                    }
                    else
                    {
                        rargs[0] = [ false, 'Unknown member:  `[Model].' + memberparts[1] + '`.' ];
                    }
                }
                else
                {   // We'll literally pass what is requested from the viewbag
                    if( klay.viewbag )
                    {
                        var pcnt = 0,
                            cnt;
                        if( this.nk.type( memberparts ) === 'array' )
                        {
                            pcnt = memberparts.length;
                        }

                        // We only support 3 deep here
                        switch( pcnt )
                        {
                            case 0:
                            case 1:
                            {
                                if( pcnt == 0 )
                                {
                                    if( klay.viewbag.hasOwnProperty( memberparts ) )
                                    {
                                        rargs[0] = [ memberparts, klay.viewbag[memberparts] ];
                                    }
                                    else
                                    {
                                        if( memberparts )
                                        {
                                            console.log( 'Error: Unknown member: `[' + memberparts + ']`.' );
                                            rargs[0] = [ memberparts, memberparts ];
                                        }
                                        else
                                        {
                                            console.log( 'Error: Invalid member: `[' + memberparts + ']`.' );
                                            rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts + ']`.' ];
                                        }
                                    }
                                }
                                else
                                {   // pcnt MUST be 1
                                    if( klay.viewbag.hasOwnProperty( memberparts[0] ) )
                                    {
                                        rargs[0] = [ memberparts[0], klay.viewbag[memberparts[0]] ];
                                    }
                                    else
                                    {
                                        if( memberparts[0] )
                                        {
                                            console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.' );
                                            rargs[0] = [ memberparts[0], memberparts[0] ];
                                        }
                                        else
                                        {
                                            console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.' );
                                            rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.' ];
                                        }
                                    }
                                }
                            }break;

                            case 2:
                            {
                                if( klay.viewbag.hasOwnProperty( memberparts[0] ) )
                                {
                                    if( klay.viewbag[memberparts[0]].hasOwnProperty( memberparts[1] ) )
                                    {
                                        rargs[0] = [ memberparts.join( '' ), klay.viewbag[memberparts[0]][memberparts[1]] ];
                                    }
                                    else
                                    {
                                        if( memberparts[1] )
                                        {
                                            console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                            rargs[0] = [ memberparts[1], memberparts.join( '' ) ];
                                        }
                                        else
                                        {
                                            console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                            rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' ];
                                        }
                                    }
                                }
                                else
                                {
                                    if( memberparts[0] )
                                    {
                                        console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.' );
                                        if( memberparts[1] )
                                        {
                                            console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                            rargs[0] = [ memberparts[1], memberparts.join( '' ) ];
                                        }
                                        else
                                        {
                                            console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                            rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' ];
                                        }
                                    }
                                    else
                                    {
                                        console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                        rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' ];
                                    }
                                }
                            }break;

                            case 3:
                            {
                                if( klay.viewbag.hasOwnProperty( memberparts[0] ) )
                                {
                                    if( klay.viewbag[memberparts[0]].hasOwnProperty( memberparts[1] ) )
                                    {
                                        if( klay.viewbag[memberparts[0]][memberparts[1]].hasOwnProperty( memberparts[2] ) )
                                        {
                                            rargs[0] = [ memberparts.join( '' ), klay.viewbag[memberparts[0]][memberparts[1]][memberparts[2]] ];
                                        }
                                        else
                                        {
                                            console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.' );
                                            rargs[0] = [ false, 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.' ];
                                        }
                                    }
                                    else
                                    {
                                        console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                        rargs[0] = [ false, 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' ];
                                    }
                                }
                                else
                                {
                                    if( memberparts[0] )
                                    {
                                        console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.' );
                                        if( memberparts[1] )
                                        {
                                            console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' );
                                            if( memberparts[2] )
                                            {
                                                console.log( 'Error: Unknown member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.' );
                                                rargs[0] = [ memberparts.join( '' ), memberparts.join( '' ) ]
                                            }
                                            else
                                            {
                                                console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.');
                                                rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.' ];
                                            }
                                        }
                                        else
                                        {
                                            console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.' );
                                            rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.' ];
                                        }
                                    }
                                    else
                                    {
                                        console.log( 'Error: Invalid member: `[' + memberparts[0] + ']`.`[' + memberparts[1] + ']`.`[' + memberparts[2] + ']`.' );
                                        rargs[0] = [ false, 'Error: Invalid member: `[' + memberparts[0] + ']`.' ];
                                    }
                                }
                            }break;

                            default:
                            {
                                // pcnt is >= 4
                                console.log( 'Error: Only 3 chain links are allowed: `' + memberparts.join( '.' ) + '`.' );
                                rargs[0] = [ false, 'Only 3 chain links are allowed: `' + memberparts.join( '.' ) + '`.' ];
                            }break;
                        }

                        // Get length of memberparts and iterate over and send proper value
                        if( klay.viewbag.hasOwnProperty( memberparts[0] ) )
                        {
                            if( memberparts[1] )
                            {
                                if( klay.viewbag[memberparts[0]].hasOwnProperty( memberparts[1] ) )
                                {
                                    rargs[0] = [ memberparts[1], klay.viewbag[memberparts[0]][memberparts[1]] ];
                                }
                                else
                                {
                                    console.log( 'Error: Unknown member: `[' + memberparts[0] + '].' + memberparts[1] + '`.' );
                                    rargs[0] = [ false, 'Unknown member: `[' + memberparts[0] + '].' + memberparts[1] + '`.' ];
                                }
                            }
                            else
                            {
                                if( memberparts)
                                rargs[0] = [ memberparts[0], klay.viewbag[memberparts[0]] ];
                            }
                        }
                        else
                        {
                            if( memberparts[0] )
                            {
                                rargs[0] = [ memberparts[0], memberparts[0] ];
                            }
                            else
                            {
                                rargs[0] = [ false, 'whoops' ];
                            }
                        }
                    }
                    else
                    {
                        // Text value
                        if( memberparts[0] )
                        {
                            rargs[0] = [ memberparts[0], memberparts[0] ];
                        }
                        else
                        {
                            rargs[0] = [ false, 'whoops' ];
                        }
                    }
                }

                // And finally we invoke the requested method and pass it any arguments that it needs to return a string
                if( rargs[0] && rargs[1] )
                {   // Two args provided, parse second argument as a JSON string representation of an object
                    rargs[1] = JSON.parse( rargs[1] );
                    subscript = rtools.generate( members[1], rargs[0], rargs[1] );
                }
                else if( rargs[0] )
                {   // One arg provided
                    subscript = rtools.generate( members[1], rargs[0] );
                }
                else
                {   // No args provided
                    //console.log( '1: ' + rargs[0] + ', 2: ' + rargs[1] );
                    subscript = rtools.generate( members[1] );
                }
            }
            else
            {
                // There just weren't any members which matched
                console.log( 'Error: Invalid script `html.' + members[1] + '`.' );
                subscript = "";
            }

            return String( subscript );
        }break;

        default:
        {
            if( iteration )
            {
                if( identification )
                {
                    if( fof )
                    {
                        // We're already iterating over a viewbag item, the identification let's us know what word was used to signify the current iteration.
                        var vbag = fof.split( "." );
                        //console.log( 'First is: ' + vbag[0] + ', and second is: ' + vbag[1] + ', and Identification is: ' + identification );
                        if( vbag[0].toString == identification.toString )
                        {
                            //console.log( 'Were in here' );
                            if( iteration.hasOwnProperty( vbag[1] ) )
                            {
                                return iteration[vbag[1]];
                            }
                            else
                            {
                                return 'Does not exist: ' + iteration + '[' + vbag[1] + ']';
                            }
                        }
                    }

                    return '';
                }
                else
                {
                    return 'Bad';
                }
            }
            else
            {
                if( fof )
                {
                    return klay.viewbag[fof];
                }

                return '';
            }
        }break;
    }

    return 'Too bad...';
};


//Export
module.exports = exports = renderer;