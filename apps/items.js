const knex = require('knex');
const util = require('../lib/util');
const db = knex({
    client: 'mysql',
    connection: {
        host: 'sc.scitbb.top',
        user: 'sunc',
        password: 'sunc',
        database: 'BS'
    }
})

module.exports = {
    // type 0: Light
    //   -1: is_open
    //   -2: brightness
    // type 1: Switch
    //   -1: is_open
    // type 2: Sensor
    //   -1: temperature
    //   -2: humidity
    // type 3: Lock
    //   -1: is_open
    //   -2: lock_password
    items_type_mapper: {
        "Light": 0,
        "Switch": 1,
        "Sensor": 2,
        "Lock": 3
    },
    items_type_mapper_cn: {
        "灯": 0,
        "开关": 1,
        "传感器": 2,
        "密码锁": 3
    },
    get_items: (req, res) => {
        console.log('get items');
        const email = req.body.email;
        const password = req.body.password;
        const h_name = req.body.h_name;
        let user_id = null;
        // get the correct user
        db.select('id', 'email')
            .from('users')
            .where({
                email: email,
                password: password
            })
            .then(data => {
                if (data.length) {
                    user_id = data[0].id;
                    // get the correct house
                    db.select('h_name', 'hid')
                        .from('houses')
                        .where({
                            belong_to: user_id,
                            h_name: h_name
                        })
                        .then(data => {
                            // convert the data to the format that the front end needs
                            if (data.length) {
                                let hid = data[0].hid;
                                db.select('*')
                                    .from('items')
                                    .where({
                                        hid: hid
                                    })
                                    .then(data => {
                                        if (data.length) {
                                            let items = [];
                                            for (let i = 0; i < data.length; i++) {
                                                let item = {};
                                                item.id = data[i].id;
                                                item.type = data[i].type;
                                                item.is_open = data[i].is_open;
                                                item.brightness = data[i].brightness;
                                                item.temperature = data[i].temperature;
                                                item.humidity = data[i].humidity;
                                                item.lock_password = data[i].lock_password;
                                                item.axis_x = data[i].axis_x;
                                                item.axis_y = data[i].axis_y;
                                                item.axis_z = data[i].axis_z;
                                                items.push(item);
                                            }
                                            console.log(items);
                                            res.json(items);
                                        } else {
                                            res.json('There are no items in this house!');
                                        }
                                    })
                            } else {
                                res.json('You Have Not Created Any House Yet!');
                            }
                        })
                } else {
                    res.json('You Are Not Logged In!');
                }
            })
    },
    add_items: (req, res) => {
        console.log('add items');
        const email = req.body.email;
        const password = req.body.password;
        const h_name = req.body.h_name;
        const item = req.body.item;
        let user_id = null;
        // get the correct user
        db.select('id', 'email')
            .from('users')
            .where({
                email: email,
                password: password
            })
            .then(data => {
                if (data.length) {
                    user_id = data[0].id;
                    // get the correct house
                    db.select('h_name', 'hid')
                        .from('houses')
                        .where({
                            belong_to: user_id,
                            h_name: h_name
                        })
                        .then(data => {
                            // convert the data to the format that the front end needs
                            if (data.length) {
                                let hid = data[0].hid;
                                db('items')
                                    .insert({
                                        hid: hid,
                                        type: item.type,
                                        is_open: item.is_open,
                                        brightness: item.brightness,
                                        temperature: item.temperature,
                                        humidity: item.humidity,
                                        lock_passwd: item.lock_password,
                                        axis_x: item.axis_x,
                                        axis_y: item.axis_y,
                                        axis_z: item.axis_z
                                    })
                                    .then(data => {
                                        console.log('item added');
                                    })
                                res.json('Items Added!');
                                console.log('Items Added!');
                            } else {
                                console.log('You Have Not Created Any House Yet!');
                                res.json('You Have Not Created Any House Yet!');
                            }
                        })
                } else {
                    console.log('You Are Not Logged In!');
                    res.json('You Are Not Logged In!');
                }
            })
    },
    del_items: (req, res) => {
        console.log('del items');
        const email = req.body.email;
        const password = req.body.password;
        const h_name = req.body.h_name;
        const item_id = req.body.id;
        let user_id = null;
        // get the correct user
        db.select('id', 'email')
            .from('users')
            .where({
                email: email,
                password: password
            })
            .then(data => {
                if (data.length) {
                    user_id = data[0].id;
                    // get the correct house
                    db.select('h_name', 'hid')
                        .from('houses')
                        .where({
                            belong_to: user_id,
                            h_name: h_name
                        })
                        .then(data => {
                            // convert the data to the format that the front end needs
                            if (data.length) {
                                let hid = data[0].hid;
                                db('items')
                                    .where({
                                        id: item_id
                                    })
                                    .del()
                                    .then(data => {
                                        console.log('item deleted');
                                    })
                                res.json('Items Deleted!');
                                console.log('Items Deleted!');
                            } else {
                                console.log('You Have Not Created Any House Yet!');
                                res.json('You Have Not Created Any House Yet!');
                            }
                        })
                } else {
                    console.log('You Are Not Logged In!');
                    res.json('You Are Not Logged In!');
                }
            })
    },
    update_items: (req, res) => {
        console.log('alt items');
        const email = req.body.email;
        const password = req.body.password;
        const h_name = req.body.h_name;
        const item = req.body.item;
        let user_id = null;
        // get the correct user
        db.select('id', 'email')
            .from('users')
            .where({
                email: email,
                password: password
            })
            .then(data => {
                if (data.length) {
                    user_id = data[0].id;
                    // get the correct house
                    db.select('h_name', 'hid')
                        .from('houses')
                        .where({
                            belong_to: user_id,
                            h_name: h_name
                        })
                        .then(data => {
                            // convert the data to the format that the front end needs
                            if (data.length) {
                                let hid = data[0].hid;
                                db('items')
                                    .where({
                                        id: item.id
                                    })
                                    .update({
                                        type: item.type,
                                        is_open: item.is_open,
                                        brightness: item.brightness,
                                        temperature: item.temperature,
                                        humidity: item.humidity,
                                        lock_passwd: item.lock_password,
                                        axis_x: item.axis_x,
                                        axis_y: item.axis_y,
                                        axis_z: item.axis_z
                                    })
                                    .then(data => {
                                        console.log('item updated');
                                    })
                                res.json('Items Updated!');
                                console.log('Items Updated!');
                            } else {
                                console.log('You Have Not Created Any House Yet!');
                                res.json('You Have Not Created Any House Yet!');
                            }
                        })
                } else {
                    console.log('You Are Not Logged In!');
                    res.json('You Are Not Logged In!');
                }
            })
    }
};