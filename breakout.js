(() => {
    const canvas = document.getElementById('breakoutCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('breakoutScore');
    const highScoreElement = document.getElementById('breakoutHighScore');
    const gameMessage = document.getElementById('breakoutMessage');
    const restartBtn = document.getElementById('breakoutRestartBtn');

    let score = 0;
    let highScore = parseInt(localStorage.getItem('breakoutHighScore')) || 0;
    highScoreElement.textContent = highScore;
    restartBtn.textContent = "Recommencer";

    let gameRunning = false, animationId;
    let x, y, dx, dy, paddleX;
    const ballRadius = 8, paddleWidth = 75, paddleHeight = 10;
    const brickRows = 5, brickCols = 7, brickW = 55, brickH = 20, brickPad = 10, brickOffT = 30, brickOffL = 20;
    let bricks = [], rightPressed = false, leftPressed = false;

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

    function setupBoard() {
        window.jeuActif = "breakout";

        score = 0; scoreElement.textContent = score;
        
        x = canvas.width / 2; 
        y = canvas.height - 30;
        dx = 2; 
        dy = -2;
        paddleX = (canvas.width - paddleWidth) / 2;
        rightPressed = false; 
        leftPressed = false;

        createBricks();

        drawStaticBoard();
    }

    function startGameAction() {
        gameRunning = true;
        if (animationId) cancelAnimationFrame(animationId);
        animate();
    }

    function createBricks() {
        bricks = [];
        for(let c=0; c<brickCols; c++) {
            bricks[c] = [];
            for(let r=0; r<brickRows; r++) {
                bricks[c][r] = { x: 0, y: 0, status: 1, color: `hsl(${r*40+180}, 100%, 50%)` };
            }
        }
    }

    function drawStaticBoard() {
        ctx.clearRect(0,0,canvas.width,canvas.height);

        for(let c=0; c<brickCols; c++) {
            for(let r=0; r<brickRows; r++) {
                let bx = (c*(brickW+brickPad))+brickOffL;
                let by = (r*(brickH+brickPad))+brickOffT;
                bricks[c][r].x = bx; 
                bricks[c][r].y = by;
                ctx.fillStyle = bricks[c][r].color; 
                ctx.fillRect(bx, by, brickW, brickH);
            }
        }

        ctx.beginPath(); 
        ctx.arc(x, y, ballRadius, 0, Math.PI*2); 
        ctx.fillStyle = "#fff"; 
        ctx.fill(); 
        ctx.closePath();

        ctx.fillStyle = "#00e5ff"; 
        ctx.fillRect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);
    }

    function animate() {
        if(!gameRunning) return;
        ctx.clearRect(0,0,canvas.width,canvas.height);
        
        for(let c=0; c<brickCols; c++) {
            for(let r=0; r<brickRows; r++) {
                if(bricks[c][r].status === 1) {
                    let bx = (c*(brickW+brickPad))+brickOffL;
                    let by = (r*(brickH+brickPad))+brickOffT;
                    bricks[c][r].x = bx; bricks[c][r].y = by;
                    ctx.fillStyle = bricks[c][r].color; 
                    ctx.fillRect(bx, by, brickW, brickH);
                    
                    if(x > bx && x < bx+brickW && y > by && y < by+brickH) {
                        dy = -dy; 
                        bricks[c][r].status = 0; 
                        score += 10; 
                        scoreElement.textContent = score;
                        if(score%50 === 0) { dx = dx>0?dx+0.2:dx-0.2; dy = dy>0?dy+0.2:dy-0.2; }
                        if(score > highScore) { 
                            highScore=score; 
                            highScoreElement.textContent=highScore; 
                            localStorage.setItem('breakoutHighScore',highScore); 
                        }
                    }
                }
            }
        }

        ctx.beginPath(); 
        ctx.arc(x, y, ballRadius, 0, Math.PI*2); 
        ctx.fillStyle = "#fff"; 
        ctx.fill(); 
        ctx.closePath();
        
        if(rightPressed && paddleX < canvas.width-paddleWidth) paddleX += 7;
        else if(leftPressed && paddleX > 0) paddleX -= 7;
        ctx.fillStyle = "#00e5ff"; 
        ctx.fillRect(paddleX, canvas.height-paddleHeight, paddleWidth, paddleHeight);

        if(x + dx > canvas.width-ballRadius || x + dx < ballRadius) dx = -dx;
        if(y + dy < ballRadius) dy = -dy;
        else if(y + dy > canvas.height-ballRadius) {
            if(x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy; dx = (x - (paddleX + paddleWidth/2)) * 0.15;
            } else {
                gameRunning = false; 
                cancelAnimationFrame(animationId);
                
                gameMessage.textContent = "PERDU";
                gameMessage.style.display = 'flex';
                gameMessage.style.justifyContent = 'center';
                gameMessage.style.alignItems = 'center';
                restartBtn.style.display = 'block'; 
                return;
            }
        }

        x += dx; y += dy;
        animationId = requestAnimationFrame(animate);
    }
    document.addEventListener("keydown", (e) => {
        if (window.jeuActif !== "breakout") return; 
        
        if (!gameRunning) return;

        if(e.key==="Right"||e.key==="ArrowRight") { rightPressed=true; e.preventDefault();}
        else if(e.key==="Left"||e.key==="ArrowLeft") { leftPressed=true; e.preventDefault();}
    });

    document.addEventListener("keyup", (e) => {
        if (window.jeuActif !== "breakout") return;

        if(e.key==="Right"||e.key==="ArrowRight") rightPressed=false;
        else if(e.key==="Left"||e.key==="ArrowLeft") leftPressed=false;
    });

    const btnLeft = document.getElementById('breakoutBtnLeft');
    const btnRight = document.getElementById('breakoutBtnRight');
    
    if(btnLeft) {
        btnLeft.addEventListener('touchstart', (e)=>{e.preventDefault(); if(gameRunning) leftPressed=true;});
        btnLeft.addEventListener('touchend', (e)=>{e.preventDefault(); leftPressed=false;});
        btnLeft.addEventListener('mousedown', (e)=>{if(gameRunning) leftPressed=true;});
        btnLeft.addEventListener('mouseup', (e)=>{leftPressed=false;});
    }
    if(btnRight) {
        btnRight.addEventListener('touchstart', (e)=>{e.preventDefault(); if(gameRunning) rightPressed=true;});
        btnRight.addEventListener('touchend', (e)=>{e.preventDefault(); rightPressed=false;});
        btnRight.addEventListener('mousedown', (e)=>{if(gameRunning) rightPressed=true;});
        btnRight.addEventListener('mouseup', (e)=>{rightPressed=false;});
    }
    
    restartBtn.addEventListener('click', startCountdown);

    ctx.fillStyle='#111'; ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle='#00e5ff'; ctx.font='20px Courier New'; ctx.textAlign='center'; 
    ctx.fillText('CASSE-BRIQUES', canvas.width/2, canvas.height/2 - 20);
    ctx.fillStyle='#fff'; ctx.font='16px Arial'; 
    ctx.fillText('Cliquez sur Jouer', canvas.width/2, canvas.height/2 + 20);
})();