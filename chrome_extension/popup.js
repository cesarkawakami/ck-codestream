!function() {

var site = "";
var problem_name = "";

var replaceAll = function(s, p, r) {
    return s.split(p).join(r);
};

var refresh_x_title = function(x) {
    var title = document.querySelector("#" + x + "-title-template").value;
    title = replaceAll(title, "{{problem_name}}", problem_name);
    title = replaceAll(title, "{{site}}", site);

    console.log("title", title);

    document.querySelector("#" + x + "-title").textContent = title;

};

var refresh_titles = function() {
    for (var x of ["stream", "twitch"]) {
        refresh_x_title(x);
    }
};

chrome.tabs.executeScript(null, {file: "inject-get-problem-name.js"}, function(results) {
    results = results[0];
    console.log("results:", results);
    site = results.site;
    problem_name = results.problem_name;
    document.querySelector("#site").textContent = site;
    document.querySelector("#problem-name").textContent = problem_name;
    refresh_titles();
});

for (var x of ["stream", "twitch"]) {
    if (localStorage.getItem("ck-codestream-" + x + "-title-template") !== null) {
        document.querySelector("#" + x + "-title-template").value =
            localStorage.getItem("ck-codestream-" + x + "-title-template");
        refresh_titles();
    }

    document.querySelector("#" + x + "-title-template").addEventListener("input", function(evt) {
        var title_template = document.querySelector("#" + x + "-title-template").value;
        localStorage.setItem("ck-codestream-" + x + "-title-template", title_template);
        refresh_titles();
    });
}

document.querySelector("#send-stream-title").addEventListener("click", function(evt) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status !== 200) {
            window.alert("non 200 code: " + xhr.status + "\n");
        }
    };
    xhr.open("POST", "https://ck-codestream.herokuapp.com/stream-title", true);
    var form_data = new FormData();
    form_data.set("secret", JSON.parse(localStorage.getItem("ck-codestream-config")).secret);
    form_data.set("title", document.querySelector("#stream-title").textContent);
    xhr.send(form_data);

    return false;
});

document.querySelector("#send-twitch-title").addEventListener("click", function(evt) {
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status !== 200) {
            window.alert("non 200 code: " + xhr.status + "\n");
        }
    };
    xhr.open("POST", "https://ck-codestream.herokuapp.com/twitch-title", true);
    var form_data = new FormData();
    form_data.set("secret", JSON.parse(localStorage.getItem("ck-codestream-config")).secret);
    form_data.set("title", document.querySelector("#twitch-title").textContent);
    xhr.send(form_data);

    return false;
});

}();
