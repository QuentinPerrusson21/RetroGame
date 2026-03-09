(() => {
    const canvas = document.getElementById('racingCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('racingScore');
    const highScoreElement = document.getElementById('racingHighScore');
    const gameMessage = document.getElementById('racingMessage');
    const restartBtn = document.getElementById('racingRestartBtn');

    const carWidth = 40;
    const carHeight = 70;
    const lanes = [70, 200, 330]; 
    
    let score = 0;
    let highScore = parseInt(localStorage.getItem('racingHighScore')) || 0;
    highScoreElement.textContent = highScore;

    let gameRunning = false;
    let animationId;
    let speed = 5;
    let lineOffset = 0;

    let player = { lane: 1, x: 200, y: 400 }; 
    let enemies = [];

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
        window.jeuActif = "racing";
        
        score = 0; scoreElement.textContent = score;
        speed = 5;
        lineOffset = 0;
        
        player.lane = 1;
        player.x = lanes[1]; 
        enemies = [];
        
        draw();
    }

    function startGameAction() {
        gameRunning = true;
        animate(); 
    }

    function animate() {
        if (!gameRunning) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        update();
        draw();
        
        animationId = requestAnimationFrame(animate);
    }

    function update() {
        lineOffset += speed;
        if (lineOffset >= 40) lineOffset = 0;

        score += 1;
        if (score % 500 === 0) speed += 0.5;
        scoreElement.textContent = Math.floor(score / 10);

        player.x += (lanes[player.lane] - player.x) * 0.15; 

        if (Math.random() < 0.02) spawnEnemy();

        for (let i = enemies.length - 1; i >= 0; i--) {
            enemies[i].y += speed;

            let enemyX = lanes[enemies[i].lane];
            if (
                Math.abs(enemies[i].y - player.y) < carHeight - 10 && 
                Math.abs(enemyX - player.x) < carWidth - 5 
            ) {
                gameOver();
            }

            if (enemies[i].y > canvas.height) {
                enemies.splice(i, 1);
            }
        }
    }

    function spawnEnemy() {
        let lane = Math.floor(Math.random() * 3);
        
        let tooCloseOnSameLane = enemies.some(e => e.lane === lane && e.y < 200);
        if (tooCloseOnSameLane) return;

        let occupiedLanesTop = new Set(
            enemies.filter(e => e.y < 250).map(e => e.lane)
        );
        
        if (occupiedLanesTop.size >= 2 && !occupiedLanesTop.has(lane)) {
            return;
        }
        
        enemies.push({
            lane: lane,
            y: -100, 
            color: Math.random() > 0.5 ? '#ef4444' : '#3b82f6' 
        });
    }

    function draw() {
        ctx.fillStyle = '#333';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#10b981';
        ctx.fillRect(0, 0, 20, canvas.height);
        ctx.fillRect(canvas.width - 20, 0, 20, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.fillRect(25, 0, 5, canvas.height);
        ctx.fillRect(canvas.width - 30, 0, 5, canvas.height);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        for (let i = -1; i < 20; i++) {
            ctx.fillRect(133, i * 40 + lineOffset, 4, 20);
            ctx.fillRect(266, i * 40 + lineOffset, 4, 20);
        }

        enemies.forEach(e => {
            drawCar(lanes[e.lane], e.y, e.color);
        });

        drawCar(player.x, player.y, '#f59e0b'); 
    }

    function drawCar(x, y, color) {
        ctx.fillStyle = color;
        ctx.shadowColor = 'rgba(0,0,0,0.5)';
        ctx.shadowBlur = 10;
        ctx.fillRect(x - carWidth/2, y, carWidth, carHeight);
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#1e293b'; 
        ctx.fillRect(x - carWidth/2 + 5, y + 10, carWidth - 10, 15);

        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x - carWidth/2 + 5, y + 30, carWidth - 10, 25);

        ctx.fillStyle = '#fef08a';
        ctx.fillRect(x - carWidth/2 + 2, y + 2, 8, 5);
        ctx.fillRect(x + carWidth/2 - 10, y + 2, 8, 5);
    }

    function gameOver() {
        gameRunning = false;
        cancelAnimationFrame(animationId);
        gameMessage.textContent = "CRASH!";
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

    function moveLeft() { if (player.lane > 0) player.lane--; }
    function moveRight() { if (player.lane < 2) player.lane++; }

    document.addEventListener('keydown', (e) => {
        if (window.jeuActif !== "racing") return;
        
        if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault();
            if (!gameRunning) return;
            
            if (e.key === 'ArrowLeft') moveLeft();
            if (e.key === 'ArrowRight') moveRight();
        }
    });

    document.getElementById('racingBtnLeft').addEventListener('click', () => {
        if (gameRunning) moveLeft();
    });
    document.getElementById('racingBtnRight').addEventListener('click', () => {
        if (gameRunning) moveRight();
    });

    restartBtn.addEventListener('click', startCountdown);

    ctx.fillStyle = '#111'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f59e0b'; ctx.font = '30px Courier New'; ctx.textAlign = 'center';
    ctx.fillText('TURBO RACER', canvas.width/2, canvas.height/2);
    ctx.fillStyle = '#fff'; ctx.font = '16px Arial';
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2 + 40);

})();