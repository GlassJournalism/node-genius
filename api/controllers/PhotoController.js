/**
 * PhotoController
 *
 * @description :: Server-side logic for managing photos
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

//var AWS = require('aws-sdk');
//AWS.config.loadFromPath('config/aws.json');
//var s3 = new AWS.S3();
//var s3Bucket = new AWS.S3( { params: {Bucket: 'glassgenius'} } )

module.exports = {

    index: function (req, res) {
        Photo.find(function (err, photos) {
            return res.view('photo/index',
                {
                    photos: photos
                });
        });
    }
	
};

