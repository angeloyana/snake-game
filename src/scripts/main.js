const Game = (function () {
  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");

  const CELL_SIZE = 30;
  const BACKGROUND_COLOR = canvas.style.backgroundColor;
  const DEFAULT_SPEED = 250; // milliseconds

  class Entity {
    constructor(color, x = 0, y = 0, width = CELL_SIZE, height = CELL_SIZE) {
      this.color = color;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }

    didCollide(entity) {
      return this.x === entity.x && this.y === entity.y;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.strokeStyle = BACKGROUND_COLOR;
      ctx.strokeWidth = 1;
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  }

  class SnakeNode extends Entity {
    constructor(leftNode) {
      super("#16A34A");

      this.prevX = this.x;
      this.prevY = this.y;

      this.leftNode = leftNode;
      this.rightNode = null;

      if (leftNode) {
        leftNode.rightNode = this;
        this.x = leftNode.prevX;
        this.y = leftNode.prevY;
      }
    }

    move(x, y) {
      this.prevX = this.x;
      this.prevY = this.y;
      this.x = x;
      this.y = y;

      if (this.rightNode) {
        this.rightNode.move(this.prevX, this.prevY);
      }
    }

    moveUp() {
      this.move(this.x, this.y - this.height);
      if (this.y - this.height < -this.height) {
        this.move(this.x, canvas.height - this.height);
      }
    }

    moveDown() {
      this.move(this.x, this.y + this.height);
      if (this.y >= canvas.height) {
        this.move(this.x, 0);
      }
    }

    moveLeft() {
      this.move(this.x - this.width, this.y);
      if (this.x - this.width < -this.width) {
        this.move(canvas.width - this.width, this.y);
      }
    }

    moveRight() {
      this.move(this.x + this.width, this.y);
      if (this.x >= canvas.width) {
        this.move(0, this.y);
      }
    }

    addTail() {
      let lastNode = this;

      while (lastNode.rightNode) {
        lastNode = lastNode.rightNode;
      }

      new SnakeNode(lastNode);
    }

    didCollideSelf() {
      let nextNode = this.rightNode;

      while (nextNode) {
        if (this.didCollide(nextNode)) {
          return true;
        } else {
          nextNode = nextNode.rightNode;
        }
      }

      return false;
    }

    draw() {
      super.draw();

      if (this.rightNode) {
        this.rightNode.draw();
      }
    }
  }

  class Food extends Entity {
    constructor() {
      super("#DC2626");
      this.moveRandom();
    }

    moveRandom() {
      this.x =
        Math.floor(Math.random() * (canvas.width / CELL_SIZE)) * CELL_SIZE;
      this.y =
        Math.floor(Math.random() * (canvas.height / CELL_SIZE)) * CELL_SIZE;
    }
  }

  // Entry point
  const $score = document.querySelectorAll("[data-score]");
  const $highestScore = document.getElementById("highest-score");
  const $restartDialog = document.getElementById("restart-dialog");
  let score = 0;
  let highestScore = parseInt(localStorage.getItem("highestScore")) || 0;

  let intervalID = 0;
  let speed = DEFAULT_SPEED;
  let direction = "right";

  const snake = new SnakeNode();
  const food = new Food();
  setScore(0);
  mainLoop();
  run();

  window.onkeydown = (e) => {
    changeDirection(e.key);
  };

  function run() {
    intervalID = setInterval(() => {
      switch (direction) {
        case "up":
          snake.moveUp();
          break;
        case "down":
          snake.moveDown();
          break;
        case "left":
          snake.moveLeft();
          break;
        case "right":
          snake.moveRight();
          break;
      }

      if (snake.didCollideSelf()) {
        clearInterval(intervalID);
        $restartDialog.classList.remove("hidden");
      }

      if (snake.didCollide(food)) {
        setScore(score + 1);
        snake.addTail();
        food.moveRandom();
      }
    }, speed);
  }

  function mainLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    food.draw();
    snake.draw();

    requestAnimationFrame(mainLoop);
  }

  function changeDirection(key) {
    switch (key) {
      case "ArrowUp":
        if (direction !== "down") direction = "up";
        break;
      case "ArrowDown":
        if (direction !== "up") direction = "down";
        break;
      case "ArrowLeft":
        if (direction !== "right") direction = "left";
        break;
      case "ArrowRight":
        if (direction !== "left") direction = "right";
        break;
    }
  }

  function setScore(newScore) {
    score = newScore;
    highestScore = score > highestScore ? score : highestScore;
    localStorage.setItem("highestScore", String(highestScore));

    $score.forEach(($el) => ($el.textContent = String(score)));
    $highestScore.textContent = String(highestScore);
  }

  function setSpeed(ms) {
    clearInterval(intervalID);
    speed = ms;
    run();
  }

  return {
    restart() {
      snake.rightNode = null;
      snake.move(0, 0);
      direction = "right";

      $restartDialog.classList.add("hidden");
      setSpeed(DEFAULT_SPEED);
      setScore(0);
    },
    snake: {
      moveUp: () => changeDirection("ArrowUp"),
      moveDown: () => changeDirection("ArrowDown"),
      moveLeft: () => changeDirection("ArrowLeft"),
      moveRight: () => changeDirection("ArrowRight"),
      setSpeed,
      resetSpeed: () => {
        setSpeed(DEFAULT_SPEED);
      },
    },
  };
})();
