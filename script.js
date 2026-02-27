

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
// Variable globale pour savoir quel jeu est en train d'être joué
window.jeuActif = ""; 

// Empêche la page de scroller quand on joue avec les flèches
window.addEventListener("keydown", function(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].indexOf(e.code) > -1) {
        // Si un jeu est actif, on bloque le scroll de la page
        if (window.jeuActif !== "") {
            e.preventDefault();
        }
    }
}, false);
document.addEventListener('DOMContentLoaded', () => {
// 1. On récupère les éléments
const toggleButton = document.getElementById('theme-toggle');
const body = document.body;

// Sécurité : Si le bouton n'existe pas, on arrête pour éviter les erreurs
if (!toggleButton) {
    console.error("Erreur : Le bouton avec l'ID 'theme-toggle' est introuvable !");
    return;
}

// 2. Vérifier la mémoire (LocalStorage) au chargement
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    body.classList.add('dark-mode');
    toggleButton.textContent = " MODE CLAIR";
}

// 3. L'action au clic
toggleButton.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        toggleButton.textContent = " MODE CLAIR";
        localStorage.setItem('theme', 'dark'); // Sauvegarde "dark"
    } else {
        toggleButton.textContent = " MODE SOMBRE";
        localStorage.setItem('theme', 'light'); // Sauvegarde "light"
    }
});
});
