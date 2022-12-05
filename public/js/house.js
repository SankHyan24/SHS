const form1 = [...document.querySelector('.forms').children];
const form2 = [...document.querySelector('.forms2').children];

form1.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i * 100);
})

form2.forEach((item, i) => {
    setTimeout(() => {
        item.style.opacity = 1;
    }, i * 100);
})


const updateHouseFrom = () => {
    fetch('/house-get', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: sessionStorage.email,
            password: sessionStorage.password
        })
    })
        .then(res => res.json())
        .then(data => {
            if (data == 'You Are Not Logged In!')
                alertBox(data);

            data = data.map(item => {
                return {
                    'House Name': item.h_name,
                    'House Type': type_id_to_name(item.h_type)
                }
            })
            vm.gridData = data;
        })
}
window.onload = () => {
    if (!sessionStorage.name) {
        location.href = '/';
    } else {
        updateHouseFrom();
    }
}


const createHouse = document.querySelector('.submit-btn');
createHouse.onclick = () => {
    // post a request to create a house
    fetch('/house', {
        method: 'POST',
        headers: new Headers({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
            email: sessionStorage.email,
            h_name: document.querySelector('.h_name').value == '' ? 'default' : document.querySelector('.h_name').value,
            h_type: document.querySelector('input[name="h_type"]:checked').value
        })
    })
        .then(res => res.json())
        .then(data => {
            alertBox(data.name + " added successfully!");
        }).then(() => {
            updateHouseFrom(); 
        })
}
