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
var async = require('async');
var _ = require('underscore');
var webshot = require('webshot');
var hash = require('object-hash');
var AWS = require('aws-sdk');
var s3Stream = require('s3-upload-stream')(new AWS.S3());

var Mixpanel = require('mixpanel');


module.exports = {

    index: function (req, res) {
        Card.find().populate('template').exec(function (err, cards) {
            if (req.wantsJSON || req.isSocket) {
                //if the requester only wants certain fields, filter out to only use those
                var fields = req.param('fields');
                if (fields) {
                    fields = fields.split(',');
                }
                async.map(cards, function (card, callback) {
                    if (fields) {
                        var cardFields = {};
                        _.forEach(fields, function (field) {
                            cardFields[field] = card[field];
                        });
                        callback(null, cardFields);
                    } else {
                        callback(null, card);
                    }
                }, function (err, cards) {
                    return res.json(cards);
                });
            } else {
                return res.view('card/index',
                    {
                        cards: cards
                    });
            }
        });
    },

    create: function (req, res) {
        Card.create(req.body).exec(function (err, card) {
            if (err) {
                res.status(500);
                return res.end();
            }
            cacheCard(req.baseUrl, card.id);
            return res.end();
        });
    },

    update: function (req, res) {
        Card.update({id: req.params.id}, req.body, function (err, card) {
            card = card[0];
            if (err) {
                res.status(404);
                return res.end();
            }
            cacheCard(req.baseUrl, req.params.id);

            res.status(200);
            return res.json(card);
        });
    },

    render: function (req, res) {
        return res.redirect(301, 'https://s3-us-west-1.amazonaws.com/glass-genius/' + req.params.id + '.jpg');
    },

    cache: function (req, res) {
        cacheCard(req.baseUrl, req.params.id);
        res.status(200);
        return res.end();
    },

    preview: function (req, res) {
        if (!req.params.id) {
            res.status(404);
            return res.end();
        }
        Card.findOne({id: req.params.id}).populate('template').exec(function (err, card) {
            if (err) {
                res.status(404);
                return res.end();
            }
            compileCard(card, function (err, html) {
                if (err) {
                    res.status(500);
                    return res.end();
                }
                res.write('<html><head><link rel="stylesheet" href="/styles/glass-preview.css"></head><body>');
                res.write(html + '</body></html>');
                return res.end();
            });
        });

//        cacheCard(req.baseUrl, req.params.id);
    },

    edit: function (req, res) {
        Card.findOne({id: req.params.id}).populate('template').exec(function (err, card) {
            return res.view('card/create_edit', {
                cardEditing: card
            });
        });
    },

    /**
     * Find the most relevant card or get a card by ID.
     * Given a list of words, find all the card matches for each word, join all of the results
     * and find which card has the most total matches for all of the provided words.
     * @param req
     * @param res
     */
    find: function (req, res) {
        if (req.params.id) {
            Card.findOne({id: req.params.id}).populate('template').exec(function (err, card) {
                return res.json(card);
            });
        } else {
            var transcription = req.param('text').toLowerCase();
            Card.find({}, function (err, cards) {
                async.map(cards, function (card, callback) {
                    //count the number of matches for each card
                    async.reduce(card.triggerWords, {numMatches: 0, matchedTriggers: []}, function (memo, item, callback) {
                        if (item.length != 0 && transcription.indexOf(item.toLowerCase()) != -1) {
                            memo.matchedTriggers.push(item);
                            memo.numMatches++;
                        }
                        callback(null, memo); //want to do this either way
                    }, function (err, result) {
                        card.numMatches = result.numMatches;
                        card.matchedTriggers = result.matchedTriggers;
                        callback(null, card);
                    });
                }, function (err, matches) {
                    //sort by the most frequently occurring matches descending
                    matches = _.sortBy(matches, function (match) {
                        return match.numMatches;
                    }).reverse();

                    //filter out cards that don't actually have matches
                    async.reject(matches, function (match, callback) {
                        callback(match.numMatches == 0);
                    }, function (goodMatches) {
                        async.map(goodMatches, function (match, cb) {
                            cb(null, {id: match.id, triggers: match.matchedTriggers, name: match.name});
                        }, function (err, answers) {
                            async.map(answers, function (answer, callback) {
                                Card.findOne({id: answer.id}, function (err, card) {
                                    if (err) {
                                        callback(err);
                                        return;
                                    }
                                    callback(null, {triggers: answer.triggers, name: card.name});
                                })
                            }, function (err, formatMatches) {
                                mixpanel.track('match', {
                                    distinct_id: req.get('Session-Id'),
                                    text: transcription,
                                    matches: formatMatches
                                });
                            });

                            res.json(answers);
                        });
                    });
                })
            });
        }
    },

    /**
     * Get a list of all the trigger (words/phrases)
     * @param req
     * @param res
     */
    triggers: function (req, res) {
        Card.find({}, function (err, cards) {
            if (err) {
                res.status(500);
                return res.end();
            }
            if (cards.length == 0) {
                res.status(404);
                return res.end();
            }

            async.map(cards, function (card, callback) {
                callback(null, card.triggerWords);
            }, function (err, triggers) {
                //filter out empty strings
                async.reject(triggers, function (trigger, callback) {
                    callback(trigger.length == 0);
                }, function (goodTriggers) {
                    //set Etag to enable caching
                    var etag = hash.MD5(goodTriggers);
                    res.set('Etag', etag);
                    return res.json(_.flatten(goodTriggers));
                });
            });
        })
    },

    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to CardController)
     */
    _config: {
    }

}

function compileCard(card, callback) {
    //not sure why this is necessary but sometimes some of these are undefined...
    if (!card || !card.template || !card.template.handlebarsTemplate) {
        callback(err, null);
    }
    callback(null, handlebars.compile(card.template.handlebarsTemplate)(card.variables));
}

function cacheCard(baseUrl, cardId) {
    var options = {
        screenSize: {
            width: 640, height: 360
        }, shotSize: {
            width: 640, height: 360
        },
        streamType: 'jpg'
    };

    //take a screenshot of the preview page
    webshot(baseUrl + '/card/preview/' + cardId, options, function (err, renderStream) {
        var upload = s3Stream.upload({
            Bucket: 'glass-genius',
            Key: cardId + '.jpg',
            ACL: 'public-read',
            StorageClass: 'REDUCED_REDUNDANCY',
            ContentType: 'image/jpeg'
        });

        upload.on('error', function (error) {
            console.log(error);
        });

        renderStream.pipe(upload);

        console.log('caching card ' + cardId);
    });
}