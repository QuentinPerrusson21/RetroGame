(() => {
    const canvas = document.getElementById('racingCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('racingScore');
    const highScoreElement = document.getElementById('racingHighScore');
    const gameMessage = document.getElementById('racingMessage');
    const restartBtn = document.getElementById('racingRestartBtn');

    // --- CONFIGURATION ---
    const carWidth = 40;
    const carHeight = 70;
    // 3 voies centrées : x = 70, 200, 330 (sur 400px de large)
    const lanes = [70, 200, 330]; 
    
    let score = 0;
    let highScore = parseInt(localStorage.getItem('racingHighScore')) || 0;
    highScoreElement.textContent = highScore;
    restartBtn.textContent = "Jouer";

    let gameRunning = false;
    let animationId;
    let speed = 5;
    let lineOffset = 0;

    let player = { lane: 1, y: 400 }; // Le joueur est sur la voie du milieu (index 1)
    let enemies = [];

    // --- INITIALISATION ---
    function initGame() {
        // ACTIVATION DU JEU
        window.jeuActif = "racing";
        
        score = 0; scoreElement.textContent = score;
        speed = 5;
        player.lane = 1;
        enemies = [];
        
        gameMessage.style.display = 'none';
        restartBtn.style.display = 'none';
        gameRunning = true;
        
        animate();
    }

    // --- BOUCLE DE JEU ---
    function animate() {
        if (!gameRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        update();
        draw();
        
        animationId = requestAnimationFrame(animate);
    }

    function update() {
        // Défilement de la route
        lineOffset += speed;
        if (lineOffset >= 40) lineOffset = 0;

        // Augmenter la difficulté
        score += 1;
        if (score % 500 === 0) speed += 0.5;
        scoreElement.textContent = Math.floor(score / 10); // Affiche un score lisible

        // Gestion des Ennemis
        if (Math.random() < 0.02) spawnEnemy();

        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += speed;

            // Collision
            if (
                Math.abs(enemies[i].y - player.y) < carHeight - 10 && // Chevauchement vertical
                enemies[i].lane === player.lane // Même voie
            ) {
                gameOver();
            }

            // Suppression si hors écran
            if (enemies[i].y > canvas.height) {
                enemies.splice(i, 1);
            }
        }
    }

    function spawnEnemy() {
        // Choisir une voie au hasard
        let lane = Math.floor(Math.random() * 3);
        
        // Vérifier qu'il n'y a pas déjà une voiture trop proche sur cette voie
        let tooClose = enemies.some(e => e.lane === lane && e.y < 150);
        
        if (!tooClose) {
            enemies.push({
                lane: lane,
                y: -100, // Commence au-dessus de l'écran
                color: Math.random() > 0.5 ? '#ef4444' : '#3b82f6' // Rouge ou Bleu
            });
        }
    }

    function draw() {
        // 1. DESSINER LA ROUTE
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Bandes herbe sur les côtés
        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 20, canvas.height);
        ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);

        // Lignes blanches (bordures de route)
        ctx.fillStyle = '#fff';
        ctx.fillRect(25, 0, 5, canvas.height);
        ctx.fillRect(canvas.width - 30, 0, 5, canvas.height);

        // Lignes pointillées centrales (qui bougent)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = -1; i < 20; i++) {
            // Ligne séparatrice 1 (entre voie 0 et 1) -> x ≈ 133
            ctx.fillRect(133, i * 40 + lineOffset, 4, 20);
            // Ligne séparatrice 2 (entre voie 1 et 2) -> x ≈ 266
            ctx.fillRect(266, i * 40 + lineOffset, 4, 20);
        }

        // 2. DESSINER LES ENNEMIS
        enemies.forEach(e => {
            drawCar(lanes[e.lane], e.y, e.color);
        });

        // 3. DESSINER LE JOUEUR
        drawCar(lanes[player.lane], player.y, '#f59e0b'); // Orange
    }

    function drawCar(x, y, color) {
        // Corps de la voiture
        ctx.fillStyle = color;
        // Ombre
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(x - carWidth/2, y, carWidth, carHeight);
        ctx.shadowBlur = 0;

        // Pare-brise
        ctx.fillStyle = '#1e293b'; // Vitre sombre
        ctx.fillRect(x - carWidth/2 + 5, y + 10, carWidth - 10, 15);

        // Toit
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x - carWidth/2 + 5, y + 30, carWidth - 10, 25);

        // Phares (jaunes)
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x - carWidth/2 + 2, y + 2, 8, 5);
        ctx.fillRect(x + carWidth/2 - 10, y + 2, 8, 5);
    }

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        gameMessage.style.display = 'block';
        restartBtn.textContent = "Recommencer";
        restartBtn.style.display = 'block';

        let finalScore = Math.floor(score / 10);
        if (finalScore > highScore) {
            highScore = finalScore;
            highScoreElement.textContent = highScore;
            localStorage.setItem('racingHighScore', highScore);
        }
    }

    // --- CONTRÔLES ---
    function moveLeft() { if (player.lane > 0) player.lane--; }
    function moveRight() { if (player.lane < 2) player.lane++; }

    // Clavier (Protection active)
    document.addEventListener('keydown', (e) => {
        if (window.jeuActif !== "racing") return;
        
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            if (!gameRunning) return;
            
            if (e.key === 'ArrowLeft') moveLeft();
            if (e.key === 'ArrowRight') moveRight();
        }
    });

    // Boutons Mobiles / Souris
    document.getElementById('racingBtnLeft').addEventListener('click', () => {
        if (gameRunning) moveLeft();
    });
    document.getElementById('racingBtnRight').addEventListener('click', () => {
        if (gameRunning) moveRight();
    });

    restartBtn.addEventListener('click', initGame);

    // Écran titre
    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f59e0b'; ctx.font = '30px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('TURBO RACER', canvas.width/2, canvas.height/2);
    ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2 + 40);

})();