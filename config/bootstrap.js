/**
 * Bootstrap
 *
 * An asynchronous boostrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#documentation
 */

module.exports.bootstrap = function (cb) {

    var passport = require('passport')
        , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

    passport.use(new GoogleStrategy({
            clientID: '738583448835-4nm3p36amf1k1qq2gb6p0k87o8hit5uo.apps.googleusercontent.com',
            clientSecret: '89LUjNAecgO0tvgzmAaA-a6g',
            callbackURL: 'http://localhost:1337/auth/google/return',
            scope: 'https://www.googleapis.com/auth/glass.timeline https://www.googleapis.com/auth/userinfo.profile email'
        },
        function (accessToken, refreshToken, profile, done) {
            User.findOrCreate({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value
            }, function(err, user) {
                done(err, user);
            });
        }
    ));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        User.findOne({id: id}, function (err, user) {
            done(err, user);
        });
    });

    // It's very important to trigger this callack method when you are finished
    // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
    cb();
};