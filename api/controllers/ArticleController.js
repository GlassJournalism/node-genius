/**
 * ArticleController
 *
 * @description :: Server-side logic for managing articles
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {

    /**
     * `ArticleController.index()`
     */
    index: function (req, res) {
        Article.find(function (err, articles) {

            if (req.wantsJSON || req.isSocket) {
                return res.json(articles);
            } else {
                return res.view('article/index',
                    {
                        articles: articles
                    });
            }
        });
    },

    /**
     * `ArticleController.edit()`
     */
    edit: function (req, res) {
        Article.findOne({id: req.params.id}).exec(function (err, article) {
            return res.view('article/create_edit', {
                articleEditing: article
            });
        });
    }

};

