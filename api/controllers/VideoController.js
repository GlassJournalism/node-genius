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
     * `VideoController.edit()`
     */
    edit: function (req, res) {
        Video.findOne({id: req.params.id}).exec(function (err, video) {
            return res.view('video/create_edit', {
                videoEditing: video
            });
        });
    }
};

