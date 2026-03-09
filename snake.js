(() => {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('snakeScore');
    const highScoreElement = document.getElementById('snakeHighScore');
    const gameOverElement = document.getElementById('snakeGameOver');
    const restartBtn = document.getElementById('snakeRestartBtn');

    const gridSize = 20;
    const tileCount = canvas.width / gridSize;

    let snake = [{ x: 10, y: 10 }];
    let velocity = { x: 0, y: 0 };
    let food = { x: 15, y: 15 };
    let score = 0;
    let highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;
    let gameRunning = false;
    let gameLoop;

    // Affichage initial
    highScoreElement.textContent = highScore;
    restartBtn.textContent = "Jouer";

    function drawIntro() {
        ctx.fillStyle = '#0f0c29';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Appuyez sur "Jouer"', canvas.width / 2, canvas.height / 2);
    }

    // --- GESTION DU COMPTE À REBOURS ---
    function startCountdown() {
        setupBoard();
        
        restartBtn.style.display = 'none';
        
        // CORRECTION DU CENTRAGE ICI
        gameOverElement.style.display = 'flex'; 
        gameOverElement.style.justifyContent = 'center';
        gameOverElement.style.alignItems = 'center';
        gameOverElement.style.fontSize = '50px'; 
        
        let count = 3;
        gameOverElement.textContent = count;

        const countdown = setInterval(() => {
            count--;
            if (count > 0) {
                gameOverElement.textContent = count;
            } else if (count === 0) {
                gameOverElement.textContent = "GO !";
            } else {
                clearInterval(countdown);
                gameOverElement.style.display = 'none';
                gameOverElement.style.fontSize = ''; // On réinitialise la taille de police
                startGameAction();
            }
        }, 1000);
    }

    // --- PRÉPARATION DU PLATEAU ---
    function setupBoard() {
        window.jeuActif = "snake";

        snake = [{ x: 10, y: 10 }];
        velocity = { x: 1, y: 0 }; // Le serpent partira vers la droite
        score = 0;
        scoreElement.textContent = score;
        generateFood();
        
        // On dessine le plateau une première fois pour le décompte
        clearCanvas();
        drawFood();
        drawSnake();
    }

    // --- LANCEMENT DE L'ACTION ---
    function startGameAction() {
        gameRunning = true;
        if (gameLoop) clearInterval(gameLoop);
        gameLoop = setInterval(drawGame, 100); 
    }

    function drawGame() {
        if (window.jeuActif !== "snake") {
            clearInterval(gameLoop);
            gameRunning = false;
            return;
        }

        if (!gameRunning) return;
        
        moveSnake();
        
        if (checkCollision()) {
            endGame();
            return;
        }

        if (snake[0].x === food.x && snake[0].y === food.y) {
            score++;
            scoreElement.textContent = score;
            if (score > highScore) {
                highScore = score;
                highScoreElement.textContent = highScore;
                localStorage.setItem('snakeHighScore', highScore);
            }
            generateFood();
        } else {
            snake.pop();
        }

        clearCanvas();
        drawFood();
        drawSnake();
    }

    function clearCanvas() {
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#0f0c29');
        gradient.addColorStop(1, '#24243e');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function drawSnake() {
        snake.forEach((segment, index) => {
            ctx.fillStyle = index === 0 ? '#4ecca3' : '#45b393';
            ctx.fillRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2);
        });
    }

    function drawFood() {
        ctx.fillStyle = '#ff6b6b';
        ctx.beginPath();
        ctx.arc(food.x * gridSize + gridSize / 2, food.y * gridSize + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
    }

    function moveSnake() {
        const head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };
        snake.unshift(head);
    }

    function checkCollision() {
        const head = snake[0];
        if (head.x < 0 || head.x >= tileCount || head.y < 0 || head.y >= tileCount) return true;
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) return true;
        }
        return false;
    }

    function generateFood() {
        food = { x: Math.floor(Math.random() * tileCount), y: Math.floor(Math.random() * tileCount) };
        for (let segment of snake) {
            if (food.x === segment.x && food.y === segment.y) { generateFood(); return; }
        }
    }

    function endGame() {
        gameRunning = false;
        clearInterval(gameLoop);
        
        gameOverElement.textContent = "Game Over"; 
        gameOverElement.style.display = 'flex'; 
        gameOverElement.style.justifyContent = 'center';
        gameOverElement.style.alignItems = 'center';
        
        restartBtn.textContent = "Recommencer";
        restartBtn.style.display = 'block';
    }

    // --- CONTRÔLES ---
    document.addEventListener('keydown', (e) => {
        if (window.jeuActif !== "snake") return;

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            e.preventDefault(); 
        }

        if (!gameRunning) return;

        switch(e.key) {
            case 'ArrowUp': if (velocity.y !== 1) velocity = { x: 0, y: -1 }; break;
            case 'ArrowDown': if (velocity.y !== -1) velocity = { x: 0, y: 1 }; break;
            case 'ArrowLeft': if (velocity.x !== 1) velocity = { x: -1, y: 0 }; break;
            case 'ArrowRight': if (velocity.x !== -1) velocity = { x: 1, y: 0 }; break;
        }
    });

    const handleMobile = (x, y) => {
        if (!gameRunning) return;
        if ((x !== 0 && velocity.x !== -x) || (y !== 0 && velocity.y !== -y)) velocity = { x, y };
    };

    document.getElementById('snakeBtnUp').addEventListener('click', () => handleMobile(0, -1));
    document.getElementById('snakeBtnDown').addEventListener('click', () => handleMobile(0, 1));
    document.getElementById('snakeBtnLeft').addEventListener('click', () => handleMobile(-1, 0));
    document.getElementById('snakeBtnRight').addEventListener('click', () => handleMobile(1, 0));

    restartBtn.addEventListener('click', startCountdown);

    drawIntro();
})();