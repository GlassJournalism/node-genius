module.exports = {
  productionHerokuPostgres: {
    adapter: 'sails-postgresql',
    url: process.env.DATABASE_URL
  }
};
