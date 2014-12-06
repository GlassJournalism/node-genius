/**
 * isAuthenticated
 *
 * @module      :: Policy
 * @description :: Simple policy to allow any authenticated user
 *                 Assumes that your login action in one of your controllers sets `req.session.authenticated = true;`
 * @docs        :: http://sailsjs.org/#!documentation/policies
 *
 */
module.exports = function (req, res, next) {


    // allow API requests
    if (req.method === 'GET' && req.wantsJSON) {
        return next();
    }

    // User is allowed, proceed to the next policy,
    // or if this is the last policy, the controller
    if (req.user) {
        if (allowedUsers.indexOf(req.user.email) != -1) {
            return next();
        } else {
            return sails.config[403]('Not on whitelist', req, res);
        }
    }

    // User is not allowed
    // (default res.forbidden() behavior can be overridden in `config/403.js`)
    req.session.returnTo = req.path;
    return res.redirect('/auth/google')
};
