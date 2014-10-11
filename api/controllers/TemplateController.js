/**
 * TemplateController
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

module.exports = {

    /**
     * /template/index
     * Show a list of all the defined templates
     * @param req
     * @param res
     * @returns {*}
     */
    index: function (req, res) {
        Template.find(function (err, templates) {
            return res.view('template/index',
                {
                    templates: templates
                });
        });
    },

    preview: function (req, res) {
        Template.findOne({id: req.params.id}).exec(function (err, template) {
            console.log(template);
            return res.view('template/preview', {
                rendered: template.handlebarsTemplate
            })
        });
    },


    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to TemplateController)
     */
    _config: {}


};
