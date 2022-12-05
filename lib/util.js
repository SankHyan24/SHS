const knex = require('knex');
const db = knex({
    client: 'mysql',
    connection: {
        host: 'scitbb.top',
        user: 'sunc',
        password: 'sunchuan24',
        database: 'BS'
    }
})

module.exports = {


};