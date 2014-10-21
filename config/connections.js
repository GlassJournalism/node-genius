module.exports.connections = {
    productionMongoHQ: {
        adapter: 'sails-mongo',
        url: process.env.MONGOHQ_URL
    }
};
