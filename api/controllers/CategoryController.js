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
    },

    edit: function (req, res) {
        Category.findOne({id: req.params.id}).exec(function (err, category) {
            return res.view('category/edit', {
                categoryEditing: category
            });
        });
    },

    dashboard: function (req, res) {
        Category.find(function (err, categories) {
            Card.find(function (err, cards) {
                Video.find(function (err, videos) {
                    Photo.find(function (err, photos) {
                        return res.view('dashboard', {
                            categories: categories,
                            cards: cards,
                            videos: videos,
                            photos: photos
                        });
                    });
                });
            });
        });
    },

    mediabucket: function (req, res) {
        Video.find(function (err, videos) {
            Photo.find(function (err, photos) {
                return res.view('mediabucket', {
                    videos: videos,
                    photos: photos
                });
            });
        });
    }

};

