const Game = (function () {
  const $pauseScreen = $('#pause-screen');
  const $endScreen = $('#end-screen');
  const $scores = $('[data-score]');
  const $highScores = $('[data-high-score]');

  const canvas = $('#canvas')[0];
  const ctx = canvas.getContext('2d');

  const CV_WIDTH = (canvas.width = 600);
  const CV_HEIGHT = (canvas.height = 600);
  const GRID_SIZE = 30;
  const SNAKE_COLOR = '#16A34A';
  const FOOD_COLOR = '#DC2626';
  const SPEED = 250;

  class Snake {
    constructor(initialX = 0, initialY = 0) {
      this.nodes = [{ x: initialX, y: initialY }];
      this.shouldGrow = false;
    }

    move(x, y) {
      this.nodes.push({ x, y });

      if (!this.shouldGrow) {
        this.nodes.shift();
      } else {
        this.shouldGrow = false;
      }
    }

    moveUp() {
      this.move(this.head.x, this.head.y - GRID_SIZE);
      if (this.head.y < 0) {
        this.move(this.head.x, CV_HEIGHT - GRID_SIZE);
      }
    }

    moveRight() {
      this.move(this.head.x + GRID_SIZE, this.head.y);
      if (this.head.x >= CV_WIDTH) {
        this.move(0, this.head.y);
      }
    }

    moveDown() {
      this.move(this.head.x, this.head.y + GRID_SIZE);
      if (this.head.y >= CV_HEIGHT) {
        this.move(this.head.x, 0);
      }
    }

    moveLeft() {
      this.move(this.head.x - GRID_SIZE, this.head.y);
      if (this.head.x < 0) {
        this.move(CV_WIDTH - GRID_SIZE, this.head.y);
      }
    }

    hasEatenSelf() {
      for (const node of this.nodes.slice(0, -1)) {
        if (this.head.x === node.x && this.head.y === node.y) {
          return true;
        }
      }
      return false;
    }

    grow() {
      this.shouldGrow = true;
    }

    reset(x = 0, y = 0) {
      this.nodes = [{ x, y }];
    }

    get head() {
      return this.nodes.slice(-1)[0];
    }

    draw() {
      this.nodes.forEach(({ x, y }) => {
        ctx.fillStyle = SNAKE_COLOR;
        ctx.fillRect(x + 2, y + 2, GRID_SIZE - 2, GRID_SIZE - 2);
      });
    }
  }

  class Food {
    constructor(initialX = 0, initialY = 0) {
      this.x = initialX;
      this.y = initialY;
    }

    randomPosition() {
      this.x = Math.floor(Math.random() * 20) * 30;
      this.y = Math.floor(Math.random() * 20) * 30;
    }

    isEatenBy(snakeInstance) {
      return this.x === snakeInstance.head.x && this.y === snakeInstance.head.y;
    }

    draw() {
      ctx.fillStyle = FOOD_COLOR;
      ctx.fillRect(this.x + 2, this.y + 2, GRID_SIZE - 2, GRID_SIZE - 2);
    }
  }

  // Entry point
  const gameState = {
    direction: 'right',
    speed: SPEED,
    score: 0,
    highScore: Number(localStorage.getItem('high-score')) || 0,
    paused: false,
  };
  const snake = new Snake();
  const food = new Food();
  let updaterId;
  food.randomPosition();
  setScore(0);
  runGame();
  render();

  document.onkeydown = (e) => {
    const key = e.key;

    if (key === ' ') {
      if (gameState.paused) continueGame();
      else pauseGame();
    }

    changeDirection(key);
  };

  function render() {
    ctx.clearRect(0, 0, CV_WIDTH, CV_HEIGHT);
    food.draw();
    snake.draw();

    requestAnimationFrame(render);
  }

  function changeDirection(key) {
    switch (key) {
      case 'up':
      case 'ArrowUp':
      case 'w':
        if (gameState.direction != 'down') gameState.direction = 'up';
        break;
      case 'right':
      case 'ArrowRight':
      case 'd':
        if (gameState.direction != 'left') gameState.direction = 'right';
        break;
      case 'down':
      case 'ArrowDown':
      case 's':
        if (gameState.direction != 'up') gameState.direction = 'down';
        break;
      case 'left':
      case 'ArrowLeft':
      case 'a':
        if (gameState.direction != 'right') gameState.direction = 'left';
        break;
    }
  }

  function setScore(score) {
    gameState.score = score;
    if (score > gameState.highScore) {
      gameState.highScore = score;
      localStorage.setItem('high-score', String(score));
    }

    $scores.text(score);
    $highScores.text(gameState.highScore);
  }

  function runGame() {
    updaterId = setInterval(() => {
      switch (gameState.direction) {
        case 'up':
          snake.moveUp();
          break;
        case 'right':
          snake.moveRight();
          break;
        case 'down':
          snake.moveDown();
          break;
        case 'left':
          snake.moveLeft();
          break;
      }

      if (snake.hasEatenSelf()) {
        gameOver();
      }

      if (food.isEatenBy(snake)) {
        setScore(gameState.score + 1);
        snake.grow();
        food.randomPosition();
      }
    }, gameState.speed);
  }

  function stopGame() {
    clearInterval(updaterId);
  }

  function pauseGame() {
    stopGame();
    $pauseScreen.removeClass('hidden');
    gameState.paused = true;
  }

  function continueGame() {
    $pauseScreen.addClass('hidden');
    gameState.paused = false;
    runGame();
  }

  function restartGame() {
    stopGame();
    gameState.direction = 'right';
    gameState.speed = SPEED;
    gameState.paused = false;
    setScore(0);

    snake.reset();
    food.randomPosition();

    $pauseScreen.addClass('hidden');
    $endScreen.addClass('hidden');
    runGame();
  }

  function gameOver() {
    stopGame();
    gameState.paused = true;
    $endScreen.removeClass('hidden');
  }

  return {
    snake: {
      changeDirection,
    },
    pauseGame,
    continueGame,
    restartGame,
  };
})();
