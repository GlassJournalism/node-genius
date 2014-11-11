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

module.exports = {

    index: function (req, res) {
        Card.find().populate('template').exec(function (err, cards) {
            if (req.wantsJSON || req.isSocket) {
                return res.json(cards);
            }
            return res.view('card/index',
                {
                    cards: cards
                });
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
        res.set('Cache-Control', 'public, max-age=31536000');

        var options = {
            screenSize: {
                width: 640, height: 360
            }, shotSize: {
                width: 640, height: 360
            },
            streamType: 'jpg'
        };
        webshot(req.baseUrl + '/card/preview/' + req.params.id, options, function (err, renderStream) {
            renderStream.pipe(res);
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
                    async.reduce(card.triggerWords, 0, function (memo, item, callback) {
                        if (item.length != 0 && transcription.indexOf(item.toLowerCase()) != -1)
                            callback(null, memo + 1);
                        else
                            callback(null, memo);
                    }, function (err, result) {
                        card.numMatches = result;
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
                            cb(null, match.id);
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