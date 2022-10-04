const knex = require('knex');

const db = knex({
    client: 'mysql',
    connection: {
        host: 'scitbb.top',
        user: 'sunc',
        password: 'sunchuan24',
        database: 'BS'
    }})



module.exports={
    create_house: (req, res) => {
        // check if the user is logged in
        
        const email = req.body.email;
        let user_id = null;
        db.select( 'id','email')
        .from('users')
        .where({
            email: email
        })
        .then(data => {
            user_id = data[0].id;
            if(data.length){
                db.select('h_name')
                .from('houses')
                .where({
                    h_name: req.body.h_name
                })
                .then(data => {
                    if(data.length){
                        res.json({name: 'house already exists'})
                    }
                    else{
                        db('houses')
                        .insert({
                            h_name: req.body.h_name,
                            h_type: req.body.h_type,
                            belong_to: user_id
                        })
                        .then(data => {
                            res.json({name: 'house created'})
                        })
                    }
                })
            } else{
                res.json('email or password is incorrect');
            }
        })
    },

    get_houses: (req, res) => {
        // check if the user is logged in
        const email = req.body.email;
        let user_id = null;
        db.select( 'id','email')
        .from('users')
        .where({
            email: email
        })
        .then(data => {
            user_id = data[0].id;
            if(data.length){
                db.select('h_name','h_type')
                .from('houses')
                .where({
                    belong_to: user_id
                })
                .then(data => {
                    // convert the data to the format that the front end needs
                    data=data.map(item => {
                        return {
                            h_name: item.h_name,
                            h_type: item.h_type
                        }
                    })
                    console.log(data);
                    res.json(data);
                })
            } else{
                res.json('email or password is incorrect');
            }
        })
    }

}