module.exports.http = {
    middleware: {

        // Define another couple of custom HTTP middleware fns with keys `passportInit` and `passportSession`
        // (notice that this time we're using an existing middleware library from npm)
        passportInit: require('passport').initialize(),
        passportSession: require('passport').session(),

        // Now configure the order/arrangement of our HTTP middleware
        order: [
            'startRequestTimer',
            'cookieParser',
            'session',
            'passportInit',            // <==== passport HTTP middleware should run after "session"
            'passportSession',         // <==== (see https://github.com/jaredhanson/passport#middleware)
            'bodyParser',
            'compress',
            'methodOverride',
            'poweredBy',
            '$custom',
            'router',
            'www',
            'favicon',
            '404',
            '500'
        ]
    }
};