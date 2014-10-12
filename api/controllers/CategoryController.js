/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    index: function (req, res) {
        Category.find(function (err, categories) {
            if (req.wantsJSON || req.isSocket) {
                return res.json(categories);
            } else {
                return res.view('category/index',
                    {
                        categories: categories
                    });
            }
        });
    },

    addCategory: function (req, res) {
        Category.find(function (err) {
            return res.view('category/add');
        });
    }

};

