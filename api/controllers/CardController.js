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
var crypto = require('crypto');

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

    preview: function (req, res) {
        if (!req.params.id) {
            res.status(404);
            return res.end();
        }
        Card.findOne({id: req.params.id}).populate('template').exec(function (err, card) {
            if (err) {
                res.status(404);
                return;
            }
            compileCard(card, function (err, html) {
                res.write('<html><head><link rel="stylesheet" href="/styles/glass-preview.css"></head><body>');
                res.write(html + '</body></html>');
                res.end();
            });
        });
    },

    render: function (req, res) {
        //disgusting hack to enable faster response times
        //the client will set this header if it thinks it has the image cached, so we will just assume that it hasn't changed
        if (req.get('If-None-Match')) {
            res.status(304);
            return res.end();
        }

        var options = {
            screenSize: {
                width: 640, height: 360
            }, shotSize: {
                width: 640, height: 360
            },
            streamType: 'jpg'
        };

        //take a screenshot of the preview page
        //set the Etag header to be the MD5 of the image to aid in caching the response client-side
        webshot(req.baseUrl + '/card/preview/' + req.params.id, options, function (err, renderStream) {
            var hash = crypto.createHash('md5');
            hash.setEncoding('hex');
            var chunks = [];
            renderStream.on('data', function (chunk) {
                hash.write(chunk);
                chunks.push(chunk);
            });
            renderStream.on('end', function () {
                hash.end();
                var etag = hash.read();
                if (req.header('If-None-Match') == etag) {
                    res.status(304);
                    return res.end();
                }
                res.set('Etag', etag);
                _.forEach(chunks, function (chunk) {
                    res.write(chunk);
                });
                res.end();
            });
        });
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
                            callback(null, memo);
                        }
                        else
                            callback(null, memo);
                    }, function (err, result) {
                        card.numMatches = result.numMatches;
                        card.matchedTriggers = result.matchedTriggers;
                        callback(null, card);
                    });
                }, function (err, matches) {
                    //sort by the most frequently occurring matches descending
                    matches = _(matches).chain()
                        .sortBy(matches, function (match) {
                            return match.numMatches;
                        })
                        .reverse()
                        .value();

                    //filter out cards that don't actually have matches
                    async.reject(matches, function (match, callback) {
                        callback(match.numMatches == 0);
                    }, function (goodMatches) {
                        async.map(goodMatches, function (match, cb) {
                            cb(null, {id: match.id, triggers: match.matchedTriggers, matches: match.numMatches});
                        }, function (err, answers) {
                            return res.json(answers);
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

};

function compileCard(card, callback) {
    callback(null, handlebars.compile(card.template.handlebarsTemplate)(card.variables));
}