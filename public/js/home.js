const greeting = document.querySelector('.greeting');

window.onload = () => {
    if (!sessionStorage.name) {
        location.href = '/login';
    } else {
        greeting.innerHTML = `hello ${sessionStorage.name}`;
    }
}

const logOut = document.querySelector('.logout');

logOut.onclick = () => {
    sessionStorage.clear();
    location.reload();
}

const intoHouse = document.querySelector('.greeting');

intoHouse.onclick = () => {
    location.href = '/house';
    // fetch('/house-get', {
    //     method: 'POST',
    //     headers: new Headers({ 'Content-Type': 'application/json' }),
    //     body: JSON.stringify({
    //         email: sessionStorage.email,
    //     })
    // })
    //     .then(res => res.json())
    //     .then(data => {
    //         alertBox(data.name);
    //     })
}