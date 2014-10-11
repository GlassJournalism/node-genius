/**
 * CardController
 *
 * @module      :: Controller
 * @description    :: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

var handlebars = require('handlebars');

module.exports = {

    preview: function (req, res) {
        compileCard(req.params.id, function (html) {
            return res.send(html);
        });
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to CardController)
     */
    _config: {}


};

function compileCard(cardId, callback) {
    Card.findOne({id: cardId}).exec(function (err, card) {
        Template.findOne({id: card.templateId}).exec(function (err, template) {
            callback(handlebars.compile(template.handlebarsTemplate)(card.variables));
        });
    });
}