/**
 * CategoryController
 *
 * @description :: Server-side logic for managing categories
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    index: function (req, res) {
        Category.find(function (err, categories) {
            return res.view('category/index',
                {
                    categories: categories
                });
        });
    },

    add: function (req, res) {
        Category.find(function (err) {
            return res.view('category/add');
        });
    }
	
};

