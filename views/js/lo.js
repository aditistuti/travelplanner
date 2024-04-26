document.addEventListener("DOMContentLoaded", function() {
    var tabs = document.querySelectorAll(".tab");
    var tabContents = document.querySelectorAll(".tab-content > div");
    
    tabs.forEach(function(tab) {
        tab.addEventListener("click", function(event) {
            event.preventDefault();
            
            tabs.forEach(function(item) {
                item.classList.remove("active");
            });
            tab.classList.add("active");
            
            var targetId = tab.firstChild.getAttribute("href").substr(1);
            tabContents.forEach(function(content) {
                if (content.getAttribute("id") === targetId) {
                    content.style.display = "block";
                } else {
                    content.style.display = "none";
                }
            });
        });
    });
    
    var inputs = document.querySelectorAll(".form input, .form textarea");
    inputs.forEach(function(input) {
        input.addEventListener("keyup", function() {
            var label = input.previousElementSibling;
            if (input.value.trim() !== "") {
                label.classList.add("active", "highlight");
            } else {
                label.classList.remove("highlight");
            }
        });
        input.addEventListener("blur", function() {
            var label = input.previousElementSibling;
            if (input.value.trim() === "") {
                label.classList.remove("active", "highlight");
            }
        });
        input.addEventListener("focus", function() {
            var label = input.previousElementSibling;
            if (input.value.trim() !== "") {
                label.classList.add("highlight");
            }
        });
    });
});
