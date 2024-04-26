Array.from(document.querySelectorAll('.search input')).forEach((input, index) => {
    input.addEventListener("input", () => {
        rotateCaret(input, index);
    });
   
});

function rotateCaret(input, index) {
    const caret = input.parentElement.querySelector('.bi-caret-down-fill');
    if (input.value.length > 0) {
        caret.style.transform = "rotate(180deg)";
    } else {
        caret.style.transform = "rotate(0deg)";
    }
}

let menu =document.getElementsByClassName("bi bi-three-dots")[0];
let m=document.getElementById("menu1");
menu.addEventListener("click",()=>{
    m.classList.toggle("ul_active");
})