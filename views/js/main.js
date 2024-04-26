const login = document.getElementById("login");

const creds = localStorage.getItem("auth");

console.log(creds, login);

if (creds && login) {
    const data = JSON.parse(creds);
    console.log(login, data)
    login.innerHTML = data.email;
}