const login = document.getElementById("login");

const creds = localStorage.getItem("auth");

// The server renders a Logout link (href="/logout") when a session exists.
// Only fall back to the localStorage email display when it hasn't done so.
if (creds && login && !login.getAttribute("href").includes("/logout")) {
    try {
        const data = JSON.parse(creds);
        if (data && data.email) {
            login.innerHTML = data.email;
        }
    } catch (e) {
        localStorage.removeItem("auth");
    }
}