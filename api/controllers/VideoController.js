/**
 * VideoController
 *
 * @description :: Server-side logic for managing videos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {



    /**
     * `VideoController.index()`
     */
    index: function (req, res) {
        Video.find(function (err, videos) {

            if (req.wantsJSON || req.isSocket) {
                return res.json(videos);
            } else {
                return res.view('video/index',
                    {
                        videos: videos
                    });
            }
        });
    },

    /**
     * `VideoController.show()`
     */
    show: function (req, res) {
        return res.json({
            todo: 'show() is not implemented yet!'
        });
    },


    /**
     * `VideoController.edit()`
     */
    edit: function (req, res) {
        return res.json({
            todo: 'edit() is not implemented yet!'
        });
    },


    /**
     * `VideoController.delete()`
     */
    delete: function (req, res) {
        return res.json({
            todo: 'delete() is not implemented yet!'
        });
    }
};

