/**
 * Routes
 *
 * Sails uses a number of different strategies to route requests.
 * Here they are top-to-bottom, in order of precedence.
 *
 * For more information on routes, check out:
 * http://sailsjs.org/#documentation
 */



/**
 * (1) Core middleware
 *
 * Middleware included with `app.use` is run first, before the router
 */


/**
 * (2) Static routes
 *
 * This object routes static URLs to handler functions--
 * In most cases, these functions are actions inside of your controllers.
 * For convenience, you can also connect routes directly to views or external URLs.
 *
 */

var passport = require('passport');

module.exports.routes = {

    // By default, your root route (aka home page) points to a view
    // located at `views/home/index.ejs`
    //
    // (This would also work if you had a file at: `/views/home.ejs`)
    '/': {
        view: 'home/index'
    },

    '/mediabucket': {
        view: 'mediabucket'
    },

    '/dashboard': {
        view: 'dashboard'
    },

    '/speechDemo': {
        view: 'speechDemo'
    },

    '/photo/upload': {
        view: 'photo/upload'
    },

    'get /template/create': {
        view: 'template/create_edit'
    },

    'post /template/create': 'TemplateController.create',

    'get /card/create': {
        view: 'card/create_edit'
    },

    'get /card/find': 'CardController.find',

    'get /category/add': 'CategoryController.addCategory',

    'get /category/edit': {
        view: 'category/edit'
    },

    // Redirect the user to Google for authentication.  When complete, Google
    // will redirect the user back to the application at
    //     /auth/google/return
    'get /auth/google': passport.authenticate('google'),

    // Google will redirect the user to this URL after authentication.  Finish
    // the process by verifying the assertion.  If valid, the user will be
    // logged in.  Otherwise, authentication has failed.
    'get /auth/google/return': passport.authenticate('google', { successRedirect: '/loginRedirect',
        failureRedirect: '/auth/google' }),

    'get /loginRedirect': function (req, res) {
        res.redirect(req.session.returnTo || '/');
    }

};


/**
 * (3) Action blueprints
 * These routes can be disabled by setting (in `config/controllers.js`):
 * `module.exports.controllers.blueprints.actions = false`
 *
 * All of your controllers ' actions are automatically bound to a route.  For example:
 *   + If you have a controller, `FooController`:
 *     + its action `bar` is accessible at `/foo/bar`
 *     + its action `index` is accessible at `/foo/index`, and also `/foo`
 */


/**
 * (4) Shortcut CRUD blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js)
 *            `module.exports.controllers.blueprints.shortcuts = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`,
 * you can access CRUD operations for that model at:
 *        /foo/find/:id?    ->    search lampshades using specified criteria or with id=:id
 *
 *        /foo/create        ->    create a lampshade using specified values
 *
 *        /foo/update/:id    ->    update the lampshade with id=:id
 *
 *        /foo/destroy/:id    ->    delete lampshade with id=:id
 *
 */

/**
 * (5) REST blueprints
 *
 * These routes can be disabled by setting (in config/controllers.js)
 *        `module.exports.controllers.blueprints.rest = false`
 *
 * If you have a model, `Foo`, and a controller, `FooController`,
 * you can access CRUD operations for that model at:
 *
 *        get /foo/:id?    ->    search lampshades using specified criteria or with id=:id
 *
 *        post /foo        -> create a lampshade using specified values
 *
 *        put /foo/:id    ->    update the lampshade with id=:id
 *
 *        delete /foo/:id    ->    delete lampshade with id=:id
 *
 */

/**
 * (6) Static assets
 *
 * Flat files in your `assets` directory- (these are sometimes referred to as 'public')
 * If you have an image file at `/assets/images/foo.jpg`, it will be made available
 * automatically via the route:  `/images/foo.jpg`
 *
 */



/**
 * (7) 404 (not found) handler
 *
 * Finally, if nothing else matched, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 */
