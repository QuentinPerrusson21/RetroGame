

let slideIndex = 1;
showSlides(slideIndex);
function plusSlides(n) { showSlides(slideIndex += n); }
function currentSlide(n) { showSlides(slideIndex = n); }
function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    let dots = document.getElementsByClassName("dot");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < dots.length; i++) {
        dots[i].className = dots[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    dots[slideIndex-1].className += " active";
}
setInterval(() => { plusSlides(1); }, 5000);
window.jeuActif = ""; 

window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].indexOf(e.code) > -1) {
        if (window.jeuActif !== "") {
            e.preventDefault();
        }
    }
}, false);
document.addEventListener('DOMContentLoaded', () => {
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

if (!toggleButton) {
    console.error("Erreur : Le bouton avec l'ID 'theme-toggle' est introuvable !");
    return;
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    toggleButton.textContent = " MODE CLAIR";
}

toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = " MODE CLAIR";
        localStorage.setItem('theme', 'dark'); 
    } else {
        toggleButton.textContent = " MODE SOMBRE";
        localStorage.setItem('theme', 'light');
    }
});
});
