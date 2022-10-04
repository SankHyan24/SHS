const knex = require('knex');

const db = knex({
    client: 'mysql',
    connection: {
        host: 'scitbb.top',
        user: 'sunc',
        password: 'sunchuan24',
        database: 'BS'
    }})

module.exports = {
    
    login_user: (req, res) => {

        const { email, password } = req.body;
        db.select('name', 'email')
        .from('users')
        .where({
            email: email,
            password: password
        })
        .then(data => {
            if(data.length){
                res.json(data[0]);
            } else{
                res.json('email or password is incorrect');
            }
        })
    },
    register_user: (req, res) => {
        const { name, email, password } = req.body;
        if(!name.length || !email.length || !password.length){
            res.json('fill all the fields');
        } else{
            db("users").insert({
                name: name,
                email: email,
                password: password
            })// catch the error and return error if email already exists
            .then(() => res.json('success'))
            .catch(err => res.json('email already exists'));
        }
    }

};