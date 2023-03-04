const knex = require('knex');

const db = knex({
    client: 'mysql',
    connection: {
        host: '****',
        user: '****',
        password: '****',
        database: '****'
    }
})

module.exports = {

    login_user: (req, res) => {
        console.log("POST: /login-user");

        const { email, password } = req.body;
        if (email == undefined || password == undefined)
            return res.json({ error: 'email or password is undefined' });
        db.select('name', 'email')
            .from('users')
            .where({
                email: email,
                password: password
            })
            .then(data => {
                if (data.length)
                    res.json(data[0]);
                else
                    res.json('email or password is incorrect');
            })
    },
    register_user: (req, res) => {
        console.log("POST: /register-user");
        const { name, email, password } = req.body;
        if (name == undefined || email == undefined || password == undefined)
            return res.json({ error: 'name, email or password is undefined' });
        if (!name.length || !email.length || !password.length) {
            res.json('fill all the fields');
        } else {
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