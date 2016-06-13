!function() {

document.getElementById("config-go").addEventListener("click", function() {
    localStorage.setItem("ck-codestream-config", JSON.stringify({
        secret: document.getElementById("secret").value
    }));
});

}();
