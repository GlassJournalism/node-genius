/**
 * Card
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

module.exports = {

    attributes: {

        templateId: 'string',
        variables: 'json',
        triggerWords: 'array',

        category: {
            model: 'category'
        }

    }

};
