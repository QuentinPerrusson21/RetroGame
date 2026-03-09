(() => {
    const canvas = document.getElementById('doodleCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('doodleScore');
    const highScoreElement = document.getElementById('doodleHighScore');
    const gameMessage = document.getElementById('doodleMessage');
    const restartBtn = document.getElementById('doodleRestartBtn');

    let score = 0;
    let highScore = parseInt(localStorage.getItem('doodleHighScore')) || 0;
    highScoreElement.textContent = highScore;
    restartBtn.textContent = "Jouer";

    let gameRunning = false, animationId;
    
    // Paramètres physiques du jeu
    const gravity = 0.3;
    const jumpStrength = -8;
    const playerSpeed = 5;
    
    let player = { x: 0, y: 0, width: 20, height: 20, dx: 0, dy: 0, color: '#a8ff78' };
    let platforms = [];
    const platformWidth = 50;
    const platformHeight = 10;
    
    let leftPressed = false;
    let rightPressed = false;

    // --- GESTION DU COMPTE À REBOURS ---
    function startCountdown() {
        setupBoard();

        restartBtn.style.display = 'none';

        gameMessage.style.display = 'flex';
        gameMessage.style.justifyContent = 'center';
        gameMessage.style.alignItems = 'center';
        gameMessage.style.fontSize = '50px';

        let count = 3;
        gameMessage.textContent = count;

        const countdown = setInterval(() => {
            count--;
            if (count > 0) {
                gameMessage.textContent = count;
            } else if (count === 0) {
                gameMessage.textContent = "GO !";
            } else {
                clearInterval(countdown);
                gameMessage.style.display = 'none';
                gameMessage.style.fontSize = ''; 
                startGameAction();
            }
        }, 1000);
    }

    // --- PRÉPARATION DU PLATEAU ---
    function setupBoard() {
        window.jeuActif = "doodle";

        score = 0; 
        scoreElement.textContent = score;
        
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 150;
        player.dx = 0;
        player.dy = 0; // Il reste immobile pendant le décompte

        leftPressed = false;
        rightPressed = false;

        generateInitialPlatforms();
        drawStaticBoard();
    }

    function generateInitialPlatforms() {
        platforms = [];
        // Une plateforme sûre juste sous le joueur pour le départ
        platforms.push({ x: player.x - 15, y: player.y + 40 });
        
        // On remplit le reste de l'écran avec des plateformes aléatoires
        for (let i = 0; i < 7; i++) {
            let x = Math.random() * (canvas.width - platformWidth);
            let y = canvas.height - 100 - (i * 70); // Espacées verticalement
            platforms.push({ x: x, y: y });
        }
    }

    // --- LANCEMENT DE L'ACTION ---
    function startGameAction() {
        gameRunning = true;
        player.dy = jumpStrength; // On le fait sauter au "GO!"
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    function drawStaticBoard() {
        ctx.fillStyle = '#2b5876'; // Fond du jeu (bleu nuit)
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Plateformes
        ctx.fillStyle = '#4e4376';
        platforms.forEach(p => {
            ctx.fillRect(p.x, p.y, platformWidth, platformHeight);
        });

        // Joueur
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    // --- BOUCLE DE JEU ---
    function animate() {
        if (!gameRunning) return;
        
        ctx.fillStyle = '#2b5876';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Mouvements horizontaux
        if (leftPressed) player.dx = -playerSpeed;
        else if (rightPressed) player.dx = playerSpeed;
        else player.dx = 0;

        player.x += player.dx;

        // Effet pac-man sur les bords (réapparaît de l'autre côté)
        if (player.x < -player.width) player.x = canvas.width;
        else if (player.x > canvas.width) player.x = -player.width;

        // Gravité
        player.dy += gravity;
        player.y += player.dy;

        // Collisions avec les plateformes (uniquement quand le joueur tombe)
        if (player.dy > 0) {
            platforms.forEach(p => {
                if (
                    player.x < p.x + platformWidth &&
                    player.x + player.width > p.x &&
                    player.y + player.height > p.y &&
                    player.y + player.height < p.y + platformHeight + player.dy
                ) {
                    player.dy = jumpStrength; // BOING !
                }
            });
        }

        // Effet de caméra : Si le joueur monte au-dessus du milieu de l'écran
        if (player.y < canvas.height / 2) {
            let diff = (canvas.height / 2) - player.y;
            player.y = canvas.height / 2; // Le joueur reste au centre
            
            // On fait descendre toutes les plateformes pour simuler la montée
            platforms.forEach(p => {
                p.y += diff;
            });
            
            // On augmente le score en fonction de la hauteur parcourue
            score += Math.floor(diff);
            scoreElement.textContent = score;
        }

        // Nettoyage des anciennes plateformes et création des nouvelles
        for (let i = platforms.length - 1; i >= 0; i--) {
            if (platforms[i].y > canvas.height) {
                platforms.splice(i, 1);
                
                // Nouvelle plateforme tout en haut
                let x = Math.random() * (canvas.width - platformWidth);
                // On la place juste au-dessus de l'écran
                platforms.push({ x: x, y: -20 }); 
            }
        }

        // Dessin des Plateformes
        ctx.fillStyle = '#4e4376';
        platforms.forEach(p => {
            ctx.fillRect(p.x, p.y, platformWidth, platformHeight);
        });

        // Dessin du Joueur
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);

        // GAME OVER
        if (player.y > canvas.height) {
            gameRunning = false;
            cancelAnimationFrame(animationId);
            
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('doodleHighScore', highScore);
            }

            gameMessage.textContent = "CHUTE !";
            gameMessage.style.display = 'flex';
            gameMessage.style.justifyContent = 'center';
            gameMessage.style.alignItems = 'center';
            restartBtn.style.display = 'block';
            return;
        }

        animationId = requestAnimationFrame(animate);
    }

    // --- CONTRÔLES ---
    document.addEventListener("keydown", (e) => {
        if (window.jeuActif !== "doodle" || !gameRunning) return;
        if (e.key === "ArrowLeft") { leftPressed = true; e.preventDefault(); }
        else if (e.key === "ArrowRight") { rightPressed = true; e.preventDefault(); }
    });

    document.addEventListener("keyup", (e) => {
        if (window.jeuActif !== "doodle") return;
        if (e.key === "ArrowLeft") leftPressed = false;
        else if (e.key === "ArrowRight") rightPressed = false;
    });

    // Contrôles Mobiles / Souris
    const btnLeft = document.getElementById('doodleBtnLeft');
    const btnRight = document.getElementById('doodleBtnRight');
    
    if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e)=>{e.preventDefault(); if(gameRunning) leftPressed=true;});
        btnLeft.addEventListener('touchend', (e)=>{e.preventDefault(); leftPressed=false;});
        btnLeft.addEventListener('mousedown', ()=>{if(gameRunning) leftPressed=true;});
        btnLeft.addEventListener('mouseup', ()=>{leftPressed=false;});
    }
    if (btnRight) {
        btnRight.addEventListener('touchstart', (e)=>{e.preventDefault(); if(gameRunning) rightPressed=true;});
        btnRight.addEventListener('touchend', (e)=>{e.preventDefault(); rightPressed=false;});
        btnRight.addEventListener('mousedown', ()=>{if(gameRunning) rightPressed=true;});
        btnRight.addEventListener('mouseup', ()=>{rightPressed=false;});
    }

    restartBtn.addEventListener('click', startCountdown);

    // Intro
    ctx.fillStyle = '#2b5876'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = '#a8ff78'; ctx.font = '24px Courier New'; ctx.textAlign = 'center'; 
    ctx.fillText('JUMPER', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = '#fff'; ctx.font = '16px Arial'; 
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2 + 20);
})();