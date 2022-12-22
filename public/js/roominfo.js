// Read data
'use strict';
import render_items from './room.js';
var items_data = new Array();
export var getItems = () => {
    fetch('/get-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: sessionStorage.email,
            password: sessionStorage.password,
            h_name: sessionStorage.h_name,
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data == 'You Are Not Logged In!')
                alertBox(data);
            else {
                items_data = data;
                console.log("yes");
                console.log(items_data);
                render_items(items_data);
            }
        })
}

const addItems = (obj) => {
    var item_info = {
        type: obj.type,
        is_open: 1,
        axis_x: obj.x,
        axis_y: obj.y,
        axis_z: obj.z
    }
    fetch('/add-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: sessionStorage.email,
            password: sessionStorage.password,
            h_name: sessionStorage.h_name,
            item: item_info
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data == 'You Are Not Logged In!') {
                console.log("yes");
                alertBox(data);
            }
            else {
                console.log("yes");
                alertBox(data);
            }
        })
}


const delItems = (id) => {
    fetch('/del-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: sessionStorage.email,
            password: sessionStorage.password,
            h_name: sessionStorage.h_name,
            id: id
        })
    })
        .then(res => res.json())
        .then(data => {
            console.log("del-items");
            alertBox(data);
        })
}

export var saveItems = (add_list, delete_ids) => {
    // add all new items
    console.log(add_list.length);
    for (var i = 0; i < add_list.length; i++) {
        addItems(add_list[i]);
    }
    for (var i = 0; i < delete_ids.length; i++) {
        delItems(delete_ids[i]);
    }
}

export var updateItems = (item) => {
    fetch('/update-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: sessionStorage.email,
            password: sessionStorage.password,
            h_name: sessionStorage.h_name,
            item: item
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data == 'You Are Not Logged In!') {
                console.log("yes");
                alertBox(data);
            }
            else {
                console.log("yes");
                alertBox(data);
            }
        })
}





window.onload = () => {
    if (!sessionStorage.name) {
        location.href = '/';
    } else {
        console.log(sessionStorage.name);
        console.log(sessionStorage.h_name);
        let doc0 = document.getElementById("room_name_title");
        doc0.innerHTML = "房间: " + sessionStorage.h_name;
        getItems();
    }
}

