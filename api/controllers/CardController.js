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
        if(!req.params.id) {
            res.status(404);
            return res.end();
        }
        Card.findOne({id: req.params.id}).populate('template').exec(function (err, card) {
            if (err) {
                res.status(404);
                return;
            }
            compileCard(card, function (err, html) {
                res.write('<html></html><head><link rel="stylesheet" href="/styles/glass-preview.css"></head><body>');
                res.write(html + '</body></html>');
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
            var matches = [];
            async.each(req.param('words').split(','), function (word, callback) {
                Card.find().populate('template').where({triggerWords: word}).exec(function (err, cards) {
                    async.each(cards, function (card, callback) {
                        matches.push(card);
                        callback();
                    });
                    callback(err);
                });
            }, function (err) {
                if (err) {
                    res.status(500);
                    return;
                }

                if (matches.length == 0) {
                    res.status(404);
                    return;
                }

                var matchesWithOccurrences = new Array(matches.length);
                for (var i = 0; i < matches.length; i++) {
                    var card = matches[i];

                    var found = false;
                    for (var j = 0; j < matchesWithOccurrences.length; j++) {
                        if (matchesWithOccurrences[j] && matchesWithOccurrences[j].card === card) {
                            found = true;
                            matchesWithOccurrences[j].occurrences++;
                        }
                    }
                    if (!found) {
                        matchesWithOccurrences.push({card: card, occurrences: 1});
                    }
                }

                matchesWithOccurrences.sort(function (a, b) {
                    if (a.occurrences < b.occurrences)
                        return -1;
                    if (a.occurrences > b.occurrences)
                        return 1;
                    return 0;
                });
                var bestCard = matchesWithOccurrences[0].card;

                compileCard(bestCard, function (err, html) {
                    if (err) {
                        res.status(500);
                        return res.end();
                    }
                    return res.send(html);
                });
            });
        }
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