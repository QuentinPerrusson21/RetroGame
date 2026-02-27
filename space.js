(() => {
    const canvas = document.getElementById('spaceCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('spaceScore');
    const highScoreElement = document.getElementById('spaceHighScore');
    const gameMessage = document.getElementById('spaceMessage');
    const restartBtn = document.getElementById('spaceRestartBtn');

    let score = 0;
    let highScore = parseInt(localStorage.getItem('spaceHighScore')) || 0;
    highScoreElement.textContent = highScore;
    restartBtn.textContent = "Jouer";

    let gameRunning = false;
    let animationId;

    // --- Paramètres ---
    const player = { x: canvas.width / 2 - 15, y: canvas.height - 30, width: 30, height: 20, color: '#39ff14', dx: 0, speed: 5 };
    let bullets = [];
    let aliens = [];
    
    // Configuration Aliens
    const alienRows = 4;
    const alienCols = 8;
    const alienWidth = 30;
    const alienHeight = 20;
    const alienPadding = 15;
    const alienOffsetTop = 50;
    const alienOffsetLeft = 30;
    
    let alienDirection = 1; // 1 = droite, -1 = gauche
    let alienSpeed = 1;
    let alienDropDistance = 20;
    let wave = 1;

    // --- INITIALISATION ---
    function initGame() {
        // ACTIVATION DU JEU
        window.jeuActif = "space";

        score = 0; 
        wave = 1;
        scoreElement.textContent = score;
        alienSpeed = 1; // Vitesse initiale
        bullets = [];
        createAliens();
        
        player.x = canvas.width / 2 - player.width / 2;
        player.dx = 0;

        gameMessage.style.display = 'none';
        restartBtn.style.display = 'none';
        gameRunning = true;
        
        // Relance la boucle
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    function createAliens() {
        aliens = [];
        for (let r = 0; r < alienRows; r++) {
            for (let c = 0; c < alienCols; c++) {
                let alienX = (c * (alienWidth + alienPadding)) + alienOffsetLeft;
                let alienY = (r * (alienHeight + alienPadding)) + alienOffsetTop;
                // Couleurs rétro
                let color = r === 0 ? '#ff073a' : r === 1 ? '#ffff00' : '#00ffff';
                aliens.push({ x: alienX, y: alienY, width: alienWidth, height: alienHeight, color: color, alive: true });
            }
        }
    }

    // --- BOUCLE DE JEU ---
    function animate() {
        if (!gameRunning) return;

        // Effet de traînée pour le style rétro
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        updatePlayer();
        updateBullets();
        updateAliens();
        checkCollisions();
        
        drawPlayer();
        drawAliens();
        drawBullets();
        
        // Nouvelle vague ?
        if (aliens.every(a => !a.alive)) nextWave();

        animationId = requestAnimationFrame(animate);
    }

    // --- LOGIQUE ---
    function updatePlayer() {
        player.x += player.dx;
        // Limites
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }

    function shoot() {
        if (!gameRunning) return;
        // Limite de tir (3 balles max à la fois)
        if (bullets.length < 3) {
             bullets.push({ 
                 x: player.x + player.width / 2 - 2.5, 
                 y: player.y, 
                 width: 5, 
                 height: 15, 
                 color: '#fff', 
                 speed: 7 
             });
        }
    }

    function updateBullets() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            bullets[i].y -= bullets[i].speed;
            if (bullets[i].y + bullets[i].height < 0) bullets.splice(i, 1);
        }
    }

    function updateAliens() {
        let hitEdge = false;
        let reachedBottom = false;

        for (let alien of aliens) {
            if (!alien.alive) continue;
            
            // Touche les bords ?
            if (alien.x + alien.width > canvas.width || alien.x < 0) hitEdge = true;
            // Touche le bas (Game Over) ?
            if (alien.y + alien.height > player.y) reachedBottom = true;
        }

        if (reachedBottom) { endGame(); return; }

        if (hitEdge) {
            alienDirection *= -1;
            for (let alien of aliens) alien.y += alienDropDistance;
        }

        for (let alien of aliens) alien.x += alienSpeed * alienDirection;
    }

    function checkCollisions() {
        bullets.forEach((b, bIndex) => {
            aliens.forEach((a, aIndex) => {
                if (a.alive && b.x < a.x + a.width && b.x + b.width > a.x && b.y < a.y + a.height && b.y + b.height > a.y) {
                    // Touché !
                    a.alive = false;
                    bullets.splice(bIndex, 1);
                    score += 10 * wave;
                    scoreElement.textContent = score;
                    
                    if (score > highScore) {
                        highScore = score;
                        highScoreElement.textContent = highScore;
                        localStorage.setItem('spaceHighScore', highScore);
                    }
                    
                    // Accélération progressive
                    alienSpeed += 0.05;
                }
            });
        });
    }

    function nextWave() {
        wave++;
        alienSpeed = 1 + (wave * 0.5); 
        bullets = [];
        createAliens();
    }

    function endGame() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        gameMessage.textContent = "GAME OVER 💀";
        gameMessage.style.display = 'block';
        restartBtn.textContent = "Recommencer";
        restartBtn.style.display = 'block';
    }

    // --- DESSIN ---
    function drawPlayer() {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y + 10, player.width, 10); // Base
        ctx.fillRect(player.x + 10, player.y, 10, 10); // Canon
    }

    function drawBullets() {
        bullets.forEach(b => { 
            ctx.fillStyle = b.color; 
            ctx.fillRect(b.x, b.y, b.width, b.height); 
        });
    }

    function drawAliens() {
        aliens.forEach(a => {
            if (a.alive) {
                ctx.fillStyle = a.color;
                // Forme Alien Simple
                ctx.fillRect(a.x + 5, a.y, a.width - 10, a.height); // Corps
                ctx.fillRect(a.x, a.y + 5, 5, a.height - 10); // Bras G
                ctx.fillRect(a.x + a.width - 5, a.y + 5, 5, a.height - 10); // Bras D
                // Yeux
                ctx.fillStyle = '#000';
                ctx.fillRect(a.x + 8, a.y + 5, 4, 4);
                ctx.fillRect(a.x + a.width - 12, a.y + 5, 4, 4);
            }
        });
    }

    // --- CONTRÔLES (PROTECTION ACTIVE) ---
    document.addEventListener('keydown', (e) => {
        // Protection : Si ce n'est pas le tour de Space Invaders, on ne fait rien
        if (window.jeuActif !== "space") return;

        if (['ArrowLeft', 'ArrowRight', ' ', 'ArrowUp'].includes(e.key)) {
            e.preventDefault(); // Stop Scroll
        }
        
        // Contrôles
        if (e.key === 'ArrowLeft') player.dx = -player.speed;
        if (e.key === 'ArrowRight') player.dx = player.speed;
        if (e.key === ' ' || e.key === 'ArrowUp') shoot();
    });

    document.addEventListener('keyup', (e) => {
        if (window.jeuActif !== "space") return;

        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') player.dx = 0;
    });

    // Contrôles Tactiles / Souris
    const btnLeft = document.getElementById('spaceBtnLeft');
    const btnRight = document.getElementById('spaceBtnRight');
    const btnShoot = document.getElementById('spaceBtnShoot');
    
    // Fonction utilitaire pour lancer le jeu au clic tactile
    const handleInput = (action) => {
        if (!gameRunning) initGame();
        action();
    };

    if (btnLeft) {
        btnLeft.addEventListener('mousedown', () => handleInput(() => player.dx = -player.speed));
        btnLeft.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(() => player.dx = -player.speed); });
        btnLeft.addEventListener('mouseup', () => player.dx = 0);
        btnLeft.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
    }

    if (btnRight) {
        btnRight.addEventListener('mousedown', () => handleInput(() => player.dx = player.speed));
        btnRight.addEventListener('touchstart', (e) => { e.preventDefault(); handleInput(() => player.dx = player.speed); });
        btnRight.addEventListener('mouseup', () => player.dx = 0);
        btnRight.addEventListener('touchend', (e) => { e.preventDefault(); player.dx = 0; });
    }

    if (btnShoot) {
        btnShoot.addEventListener('click', (e) => { 
            e.preventDefault(); 
            handleInput(() => shoot()); 
        });
    }

    restartBtn.addEventListener('click', initGame);

    // Écran titre
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#39ff14'; ctx.font = '20px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('SPACE INVADERS', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2 + 20);
})();