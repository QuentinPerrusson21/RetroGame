(() => {
    const canvas = document.getElementById('pacmanCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('pacmanScore');
    const highScoreElement = document.getElementById('pacmanHighScore');
    const gameMessage = document.getElementById('pacmanMessage');
    const restartBtn = document.getElementById('pacmanRestartBtn');

    const tileSize = 20;
    // Grille 19x21 : 1=Mur, 0=Pastille, 2=Vide, 4=Fantômes (Départ)
    const mapLayout = [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
        [1,1,1,1,0,1,1,1,2,1,2,1,1,1,0,1,1,1,1],
        [2,2,2,1,0,1,2,2,2,4,2,2,2,1,0,1,2,2,2],
        [1,1,1,1,0,1,2,1,1,2,1,1,2,1,0,1,1,1,1],
        [1,0,0,0,0,0,0,1,2,2,2,1,0,0,0,0,0,0,1],
        [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
        [1,0,0,1,0,1,0,0,0,2,0,0,0,1,0,1,0,0,1],
        [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
        [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
        [1,0,1,1,1,1,1,1,0,1,0,1,1,1,1,1,1,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    ];

    let score = 0;
    let highScore = parseInt(localStorage.getItem('pacmanHighScore')) || 0;
    let gameInterval;
    let gameRunning = false;
    let mouthOpen = 0;
    let mouthSpeed = 0.2;

    highScoreElement.textContent = highScore;
    
    // État du jeu
    let pacman = { x: 9, y: 16, dir: 0, nextDir: 0 };
    let ghosts = [];
    let pellets = [];

    function initGame() {
        // --- MODIFICATION 1 : ON ACTIVE CE JEU ---
        window.jeuActif = "pacman";
        // -----------------------------------------

        score = 0; scoreElement.textContent = score;
        gameMessage.style.display = 'none'; restartBtn.style.display = 'none';
        
        // Reset Pacman
        pacman = { x: 9, y: 16, dir: 0, nextDir: 0 }; 
        
        // Reset Fantômes
        ghosts = [
            { x: 9, y: 8, color: 'red', dir: 2 },   // Blinky
            { x: 1, y: 1, color: 'pink', dir: 1 },  // Pinky
            { x: 17, y: 1, color: 'cyan', dir: 2 }  // Inky
        ];

        // Reset Pastilles
        pellets = [];
        for (let row = 0; row < mapLayout.length; row++) {
            for (let col = 0; col < mapLayout[row].length; col++) {
                if (mapLayout[row][col] === 0) pellets.push({ x: col, y: row });
            }
        }
        
        gameRunning = true;
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(update, 150); // Vitesse du jeu
    }

    // --- MODIFICATION 2 : PROTECTION DES TOUCHES ---
    document.addEventListener('keydown', (e) => {
        // Si ce n'est pas le tour de Pacman, on arrête tout
        if (window.jeuActif !== "pacman") return;
        if (!gameRunning) return;

        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); // Empêche le scroll
        }

        switch(e.key) {
            case 'ArrowRight': pacman.nextDir = 0; break;
            case 'ArrowDown': pacman.nextDir = 1; break;
            case 'ArrowLeft': pacman.nextDir = 2; break;
            case 'ArrowUp': pacman.nextDir = 3; break;
        }
    });
    // -----------------------------------------------

    // Contrôles Boutons (Souris/Tactile) - Pas besoin de protection ici
    document.getElementById('pacmanBtnRight').addEventListener('click', () => pacman.nextDir = 0);
    document.getElementById('pacmanBtnDown').addEventListener('click', () => pacman.nextDir = 1);
    document.getElementById('pacmanBtnLeft').addEventListener('click', () => pacman.nextDir = 2);
    document.getElementById('pacmanBtnUp').addEventListener('click', () => pacman.nextDir = 3);

    restartBtn.addEventListener('click', initGame);

    function update() {
        if (!gameRunning) return;
        
        // Logique de déplacement
        movePacman(); 
        moveGhosts(); 
        checkCollisions(); 
        
        // Animation Bouche
        mouthOpen += mouthSpeed; 
        if (mouthOpen > 0.25 || mouthOpen < 0) mouthSpeed = -mouthSpeed;
        
        // Victoire ?
        if (pellets.length === 0) gameOver(true);
        
        draw();
    }

    function movePacman() {
        let nextX = pacman.x, nextY = pacman.y;
        
        // Tente de tourner (nextDir)
        if (pacman.nextDir===0) nextX++; else if (pacman.nextDir===1) nextY++; 
        else if (pacman.nextDir===2) nextX--; else if (pacman.nextDir===3) nextY--;
        
        if (!isWall(nextX, nextY)) { 
            pacman.dir = pacman.nextDir; pacman.x = nextX; pacman.y = nextY; 
        } else {
            // Sinon continue tout droit (dir actuelle)
            nextX = pacman.x; nextY = pacman.y;
            if (pacman.dir===0) nextX++; else if (pacman.dir===1) nextY++; 
            else if (pacman.dir===2) nextX--; else if (pacman.dir===3) nextY--;
            
            if (!isWall(nextX, nextY)) { pacman.x = nextX; pacman.y = nextY; }
        }

        // Manger Pastille
        const pIndex = pellets.findIndex(p => p.x === pacman.x && p.y === pacman.y);
        if (pIndex !== -1) {
            pellets.splice(pIndex, 1); 
            score += 10; 
            scoreElement.textContent = score;
            if (score > highScore) { 
                highScore = score; 
                highScoreElement.textContent = highScore; 
                localStorage.setItem('pacmanHighScore', highScore); 
            }
        }
    }

    function moveGhosts() {
        ghosts.forEach(ghost => {
            // IA simple : choisit une direction valide au hasard (sauf demi-tour immédiat si possible)
            let possible = [];
            
            // Teste les 4 directions : Droite(0), Bas(1), Gauche(2), Haut(3)
            // On vérifie x+1, y+1, x-1, y-1
            if (!isWall(ghost.x+1, ghost.y)) possible.push(0); 
            if (!isWall(ghost.x, ghost.y+1)) possible.push(1);
            if (!isWall(ghost.x-1, ghost.y)) possible.push(2); 
            if (!isWall(ghost.x, ghost.y-1)) possible.push(3);
            
            // Essaie d'éviter le demi-tour (dir + 2 modulo 4)
            let better = possible.filter(d => d !== (ghost.dir+2)%4);
            
            // Choisit une direction
            let move = better.length > 0 ? better[Math.floor(Math.random()*better.length)] : possible[0];
            
            ghost.dir = move;
            if(move===0) ghost.x++; else if(move===1) ghost.y++; 
            else if(move===2) ghost.x--; else if(move===3) ghost.y--;
        });
    }

    function isWall(x, y) { 
        return y<0 || y>=mapLayout.length || x<0 || x>=mapLayout[0].length || mapLayout[y][x]===1; 
    }
    
    function checkCollisions() { 
        for(let g of ghosts) {
            if(g.x===pacman.x && g.y===pacman.y) gameOver(false); 
        }
    }

    function gameOver(win) {
        gameRunning = false; 
        clearInterval(gameInterval);
        gameMessage.textContent = win ? "GAGNÉ ! 🎉" : "GAME OVER 💀";
        gameMessage.style.display = 'block'; 
        restartBtn.textContent = "Recommencer"; 
        restartBtn.style.display = 'block';
    }

    function draw() {
        // Fond Noir
        ctx.fillStyle = 'black'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Murs Bleus
        ctx.fillStyle = '#2121ff';
        for(let r=0;r<mapLayout.length;r++) {
            for(let c=0;c<mapLayout[r].length;c++) {
                if(mapLayout[r][c]===1) ctx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);
            }
        }

        // Pastilles
        ctx.fillStyle = '#ffb8ae'; 
        pellets.forEach(p => { 
            ctx.beginPath(); 
            ctx.arc(p.x*tileSize+tileSize/2, p.y*tileSize+tileSize/2, 3, 0, Math.PI*2); 
            ctx.fill(); 
        });
        
        // Pacman
        const px = pacman.x*tileSize+tileSize/2;
        const py = pacman.y*tileSize+tileSize/2;
        
        // Rotation selon direction : 0=Dr, 1=Bas, 2=Ga, 3=Haut
        // Angle de base en radians : 0, PI/2, PI, 3PI/2
        const rot = pacman.dir * 0.5 * Math.PI;
        
        ctx.fillStyle = 'yellow'; 
        ctx.beginPath(); 
        // Arc de cercle avec ouverture de bouche
        ctx.arc(px, py, tileSize/2-2, rot + mouthOpen * Math.PI, rot + (2 - mouthOpen) * Math.PI); 
        ctx.lineTo(px, py); 
        ctx.fill();
        
        // Fantômes
        ghosts.forEach(g => {
            const gx = g.x*tileSize+tileSize/2;
            const gy = g.y*tileSize+tileSize/2;
            ctx.fillStyle = g.color; 
            ctx.beginPath(); 
            ctx.arc(gx, gy-2, tileSize/2-2, Math.PI, 0); // Tête ronde
            ctx.lineTo(gx+tileSize/2-2, gy+tileSize/2-2); // Bas droite
            ctx.lineTo(gx-tileSize/2+2, gy+tileSize/2-2); // Bas gauche
            ctx.fill();
        });
    }

    // Écran titre initial
    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='yellow'; ctx.font='20px Courier New'; ctx.textAlign='center'; 
    ctx.fillText('PAC-MAN', canvas.width/2, canvas.height/2-20);
    ctx.fillStyle='white'; ctx.font='16px Arial'; 
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2+20);
})();