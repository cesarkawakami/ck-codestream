(function() {

var site = "";
var problem_name = "";

if (document.title.includes("CodinGame")) {
    site = "CodinGame";
    problem_name = document.querySelector('[api="apis.title"]').textContent;
}

return {
    site: site,
    problem_name: problem_name
};

})();
