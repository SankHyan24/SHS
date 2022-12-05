// Read data
const getItems = () => {
    fetch('/get-items', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: sessionStorage.email,
            password: sessionStorage.password,
            h_name: sessionStorage.h_name
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

        })
}
window.onload = () => {
    if (!sessionStorage.name) {
        location.href = '/';
    } else {
        updateHouseFrom();
    }
}

