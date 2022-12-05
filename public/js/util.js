const alertBox = (data) => {
    // need util.css
    const alertContainer = document.querySelector('.alert-box');
    const alertMsg = document.querySelector('.alert');
    alertMsg.innerHTML = data;

    alertContainer.style.top = `5%`;
    setTimeout(() => {
        alertContainer.style.top = null;
    }, 5000);
}

const if_logged_in = () => {
    return sessionStorage.name == null ? false : true;
}