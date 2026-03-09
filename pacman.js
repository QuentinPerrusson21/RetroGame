(() => {
    const canvas = document.getElementById('pacmanCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('pacmanScore');
    const highScoreElement = document.getElementById('pacmanHighScore');
    const gameMessage = document.getElementById('pacmanMessage');
    const restartBtn = document.getElementById('pacmanRestartBtn');

    const tileSize = 20;
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
    let mouthSpeed = 0.04; 
    const speed = 0.125;   

    highScoreElement.textContent = highScore;
    
    let pacman = { x: 9, y: 16, dir: 0, nextDir: 0 };
    let ghosts = [];
    let pellets = [];

    function startCountdown() {
        setupBoard();
        restartBtn.style.display = 'none';
        gameMessage.style.display = 'block';
        gameMessage.style.fontSize = '40px';
        
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

    function setupBoard() {
        window.jeuActif = "pacman";
        score = 0; scoreElement.textContent = score;
        
        pacman = { x: 9, y: 16, dir: 0, nextDir: 0 }; 
        ghosts = [
            { x: 9, y: 8, color: 'red', dir: 2 },
            { x: 1, y: 1, color: 'pink', dir: 1 },
            { x: 17, y: 1, color: 'cyan', dir: 2 }
        ];

        pellets = [];
        for (let row = 0; row < mapLayout.length; row++) {
            for (let col = 0; col < mapLayout[row].length; col++) {
                if (mapLayout[row][col] === 0) pellets.push({ x: col, y: row });
            }
        }
        
        draw();
    }

    function startGameAction() {
        gameRunning = true;
        if (gameInterval) clearInterval(gameInterval);
        gameInterval = setInterval(update, 16); 
    }

    document.addEventListener('keydown', (e) => {
        if (window.jeuActif !== "pacman" || !gameRunning) return;
        if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault(); 

        switch(e.key) {
            case 'ArrowRight': pacman.nextDir = 0; break;
            case 'ArrowDown': pacman.nextDir = 1; break;
            case 'ArrowLeft': pacman.nextDir = 2; break;
            case 'ArrowUp': pacman.nextDir = 3; break;
        }
    });

    document.getElementById('pacmanBtnRight').addEventListener('click', () => pacman.nextDir = 0);
    document.getElementById('pacmanBtnDown').addEventListener('click', () => pacman.nextDir = 1);
    document.getElementById('pacmanBtnLeft').addEventListener('click', () => pacman.nextDir = 2);
    document.getElementById('pacmanBtnUp').addEventListener('click', () => pacman.nextDir = 3);
    restartBtn.addEventListener('click', startCountdown);

    function update() {
        if (!gameRunning) return;
        
        movePacman(); 
        moveGhosts(); 
        checkCollisions(); 
        
        mouthOpen += mouthSpeed; 
        if (mouthOpen > 0.25 || mouthOpen < 0) mouthSpeed = -mouthSpeed;
        
        if (pellets.length === 0) gameOver(true);
        
        draw();
    }

    function movePacman() {
        if (
            (pacman.dir === 0 && pacman.nextDir === 2) ||
            (pacman.dir === 2 && pacman.nextDir === 0) ||
            (pacman.dir === 1 && pacman.nextDir === 3) ||
            (pacman.dir === 3 && pacman.nextDir === 1)
        ) {
            pacman.dir = pacman.nextDir;
        }

        let onGrid = Number.isInteger(pacman.x) && Number.isInteger(pacman.y);

        if (onGrid) {
            let nx = pacman.x, ny = pacman.y;
            if (pacman.nextDir===0) nx++; else if (pacman.nextDir===1) ny++;
            else if (pacman.nextDir===2) nx--; else if (pacman.nextDir===3) ny--;

            if (!isWall(nx, ny)) {
                pacman.dir = pacman.nextDir;
            } else {
                nx = pacman.x; ny = pacman.y;
                if (pacman.dir===0) nx++; else if (pacman.dir===1) ny++;
                else if (pacman.dir===2) nx--; else if (pacman.dir===3) ny--;

                if (isWall(nx, ny)) return; 
            }
        }

        // On avance doucement
        if (pacman.dir === 0) pacman.x += speed;
        else if (pacman.dir === 1) pacman.y += speed;
        else if (pacman.dir === 2) pacman.x -= speed;
        else if (pacman.dir === 3) pacman.y -= speed;

        pacman.x = Math.round(pacman.x * 1000) / 1000;
        pacman.y = Math.round(pacman.y * 1000) / 1000;

        let cx = Math.round(pacman.x);
        let cy = Math.round(pacman.y);
        const pIndex = pellets.findIndex(p => p.x === cx && p.y === cy);
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
            let onGrid = Number.isInteger(ghost.x) && Number.isInteger(ghost.y);

            if (onGrid) {
                let possible = [];
                if (!isWall(ghost.x+1, ghost.y)) possible.push(0); 
                if (!isWall(ghost.x, ghost.y+1)) possible.push(1);
                if (!isWall(ghost.x-1, ghost.y)) possible.push(2); 
                if (!isWall(ghost.x, ghost.y-1)) possible.push(3);
                
                let better = possible.filter(d => d !== (ghost.dir+2)%4);
                let move = better.length > 0 ? better[Math.floor(Math.random()*better.length)] : possible[0];
                
                if (move !== undefined) ghost.dir = move;
            }

            if (ghost.dir === 0) ghost.x += speed;
            else if (ghost.dir === 1) ghost.y += speed;
            else if (ghost.dir === 2) ghost.x -= speed;
            else if (ghost.dir === 3) ghost.y -= speed;

            ghost.x = Math.round(ghost.x * 1000) / 1000;
            ghost.y = Math.round(ghost.y * 1000) / 1000;
        });
    }

    function isWall(x, y) { 
        return y<0 || y>=mapLayout.length || x<0 || x>=mapLayout[0].length || mapLayout[y][x]===1; 
    }
    
    function checkCollisions() { 
        for(let g of ghosts) {
            let dx = g.x - pacman.x;
            let dy = g.y - pacman.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            
            if (distance < 0.8) {
                gameOver(false); 
            }
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
        ctx.fillStyle = 'black'; 
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#2121ff';
        for(let r=0;r<mapLayout.length;r++) {
            for(let c=0;c<mapLayout[r].length;c++) {
                if(mapLayout[r][c]===1) ctx.fillRect(c*tileSize, r*tileSize, tileSize, tileSize);
            }
        }

        ctx.fillStyle = '#ffb8ae'; 
        pellets.forEach(p => { 
            ctx.beginPath(); 
            ctx.arc(p.x*tileSize+tileSize/2, p.y*tileSize+tileSize/2, 3, 0, Math.PI*2); 
            ctx.fill(); 
        });
        
        const px = pacman.x*tileSize+tileSize/2;
        const py = pacman.y*tileSize+tileSize/2;
        const rot = pacman.dir * 0.5 * Math.PI;
        
        ctx.fillStyle = 'yellow'; 
        ctx.beginPath(); 
        ctx.arc(px, py, tileSize/2-2, rot + mouthOpen * Math.PI, rot + (2 - mouthOpen) * Math.PI); 
        ctx.lineTo(px, py); 
        ctx.fill();
        
        ghosts.forEach(g => {
            const gx = g.x*tileSize+tileSize/2;
            const gy = g.y*tileSize+tileSize/2;
            ctx.fillStyle = g.color; 
            ctx.beginPath(); 
            ctx.arc(gx, gy-2, tileSize/2-2, Math.PI, 0); 
            ctx.lineTo(gx+tileSize/2-2, gy+tileSize/2-2); 
            ctx.lineTo(gx-tileSize/2+2, gy+tileSize/2-2); 
            ctx.fill();
        });
    }

    ctx.fillStyle='#000'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='yellow'; ctx.font='20px Courier New'; ctx.textAlign='center'; 
    ctx.fillText('PAC-MAN', canvas.width/2, canvas.height/2-20);
    ctx.fillStyle='white'; ctx.font='16px Arial'; 
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2+20);
})();