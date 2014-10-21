/**
 * InfoController
 *
 * @description :: Server-side logic for managing infoes
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    config: function (req, res) {
        return res.json(sails.config);
    }

};

