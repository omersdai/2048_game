const scoreEl = document.getElementById('score');
const bestScoreEl = document.getElementById('bestScore');
const resetBtn = document.getElementById('resetBtn');
const gameContainerEl = document.getElementById('gameContainer');

const popupEl = document.getElementById('popup');
const gameMessageEl = document.getElementById('gameMessage');
const closeBtn = document.getElementById('closeBtn');

const base = 2;
const goal = Math.pow(base, 11);
const squareSize = 100; // px
const gap = 15; // px
const boardSize = 4;
const animationSpeed = 100; // ms

let flag; // do not receive input when false
let gameStatus;
let score;
let bestScore;
let endGameShown;
let board;

const [WON, LOST, CONTINUE] = ['won', 'lost', 'continue'];
const [UP, RIGHT, DOWN, LEFT] = [
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'ArrowLeft',
];

const colors = [
  'rgb(228, 176, 187)',
  'rgb(230, 129, 151)',
  'rgb(235, 103, 103)',
  'rgb(228, 60, 60)',
  'rgb(238, 192, 106)',
  'rgb(255, 166, 0)',
  'rgb(124, 235, 124)',
  'rgb(65, 235, 65)',
  'rgb(112, 214, 248)',
  'rgb(0, 191, 255)',
  'rgb(161, 68, 173)',
];

function initializeGame() {
  flag = true;
  gameStatus = CONTINUE;
  score = 0;
  bestScore = 0;
  endGameShown = false;
  board = [];
  for (let i = 0; i < boardSize; i++) {
    const arr = [];

    const gameRow = document.createElement('div');
    gameRow.className = 'game-row';
    for (let j = 0; j < boardSize; j++) {
      arr.push(null);

      const tile = document.createElement('div');
      tile.className = 'tile';
      gameRow.appendChild(tile);
    }
    board.push(arr);
    gameContainerEl.appendChild(gameRow);
  }

  if (!loadGame()) {
    spawnRandomSquare();
    spawnRandomSquare();
  }

  updateScore();
}

function restartGame() {
  popupEl.classList.add('hide');
  flag = true;
  gameStatus = CONTINUE;
  score = 0;
  updateScore();
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      removeSquare(i, j);
    }
  }

  spawnRandomSquare();
  spawnRandomSquare();
}

function showEndGame() {
  if (endGameShown) return;
  endGameShown = true;
  gameMessageEl.innerText = gameStatus === WON ? 'You won!' : 'Game Over!';
  popupEl.classList.remove('hide');
}

function createSquare(x, y, val) {
  const square = document.createElement('div');
  square.className = 'square shrink';
  square.style.backgroundColor = colors[log(val, base) - 1];
  square.style.top = x * (squareSize + gap) + gap + 'px';
  square.style.left = y * (squareSize + gap) + gap + 'px';
  square.innerText = val;

  board[x][y] = square;
  gameContainerEl.appendChild(square);
  setTimeout(() => square.classList.remove('shrink'), animationSpeed);
}

function removeSquare(x, y) {
  const square = board[x][y];
  if (square) {
    square.classList.add('shrink');
    setTimeout(() => square.remove(), animationSpeed);
    board[x][y] = null;
  }
}

function upgradeSquare(square) {
  const val = parseInt(square.innerText) * base;
  updateScore(val);

  square.innerText = val;
  square.style.backgroundColor = colors[log(val, base) - 1];
  square.classList.add('enlarge');
  setTimeout(() => square.classList.remove('enlarge'), animationSpeed);
}

function spawnRandomSquare() {
  const emptySquares = [];
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board[i][j] === null) emptySquares.push([i, j]);
    }
  }
  if (emptySquares.length === 0) return;
  const idx = Math.floor(Math.random() * emptySquares.length);
  const x = emptySquares[idx][0];
  const y = emptySquares[idx][1];
  const val = Math.random() < 0.9 ? base : base * base;
  createSquare(x, y, val);
}

function moveSquare(square, x, y) {
  square.style.top = x * (squareSize + gap) + gap + 'px';
  square.style.left = y * (squareSize + gap) + gap + 'px';
}

function canFuseSquares(square, x, y) {
  return (
    0 <= x &&
    x < boardSize &&
    0 <= y &&
    y < boardSize &&
    board[x][y] !== null &&
    square.innerText === board[x][y].innerText
  );
}

function checkGameStatus() {
  let hasSpace = false;
  let canFuse = false;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const square = board[i][j];
      if (square !== null) {
        const val = parseInt(square.innerText);
        if (val === goal) return WON;
        else if (
          hasSpace ||
          canFuse ||
          canFuseSquares(square, i - 1, j) ||
          canFuseSquares(square, i + 1, j) ||
          canFuseSquares(square, i, j - 1) ||
          canFuseSquares(square, i, j + 1)
        ) {
          canFuse = true;
        }
      } else hasSpace = true;
    }
  }
  return hasSpace || canFuse ? CONTINUE : LOST;
}

document.addEventListener('keydown', (e) => {
  e.preventDefault(); // do not scroll window
  if (!flag) return;
  flag = false;
  setTimeout(() => (flag = true), animationSpeed);
  let moved = false;
  switch (e.key) {
    case UP:
      moved = moveUp();
      break;
    case RIGHT:
      moved = moveRight();
      break;
    case DOWN:
      moved = moveDown();
      break;
    case LEFT:
      moved = moveLeft();
      break;
    case ' ':
      // spawnRandomSquare();
      // saveGame();
      loadGame();
      break;
  }

  if (moved) {
    spawnRandomSquare();
    setTimeout(() => {
      gameStatus = checkGameStatus();
      if (gameStatus === WON || gameStatus === LOST) showEndGame();
      console.log(gameStatus);
    }, animationSpeed);
  }
});

function moveUp() {
  let moved = false;
  const fusedSquares = new Set();
  for (let i = 0; i < boardSize; i++) {
    // each column
    let idx = 0; // the idx which is empty
    for (let j = idx; j < boardSize; j++) {
      const square = board[j][i];
      if (square !== null) {
        if (
          canFuseSquares(square, idx - 1, i) &&
          !fusedSquares.has(board[idx - 1][i]) // do not fuse same square twice
        ) {
          moved = true;
          board[j][i] = null;
          const fusedSquare = board[idx - 1][i];
          square.style.zIndex = -1;
          moveSquare(square, idx - 1, i);
          fusedSquares.add(fusedSquare);
          setTimeout(() => {
            square.remove();
            upgradeSquare(fusedSquare);
          }, animationSpeed); // remove square after 1 second
        } else {
          if (idx !== j) {
            moved = true;
            board[j][i] = null;
            board[idx][i] = square;
            moveSquare(square, idx, i);
          }
          idx++;
        }
      }
    }
  }
  return moved;
}

function moveLeft() {
  let moved = false;
  const fusedSquares = new Set();
  for (let i = 0; i < boardSize; i++) {
    // each row
    let idx = 0; // the idx which is empty
    for (let j = idx; j < boardSize; j++) {
      const square = board[i][j];
      if (square !== null) {
        if (
          canFuseSquares(square, i, idx - 1) &&
          !fusedSquares.has(board[i][idx - 1]) // do not fuse same square twice
        ) {
          moved = true;
          board[i][j] = null;
          const fusedSquare = board[i][idx - 1];
          square.style.zIndex = -1;
          moveSquare(square, i, idx - 1);
          fusedSquares.add(fusedSquare);
          setTimeout(() => {
            square.remove();
            upgradeSquare(fusedSquare);
          }, animationSpeed); // remove square after 1 second
        } else {
          if (idx !== j) {
            moved = true;
            board[i][j] = null;
            board[i][idx] = square;
            moveSquare(square, i, idx);
          }
          idx++;
        }
      }
    }
  }
  return moved;
}

function moveDown() {
  let moved = false;
  const fusedSquares = new Set();
  for (let i = 0; i < boardSize; i++) {
    // each column
    let idx = boardSize - 1; // the idx which is empty
    for (let j = idx; j >= 0; j--) {
      const square = board[j][i];
      if (square !== null) {
        if (
          canFuseSquares(square, idx + 1, i) &&
          !fusedSquares.has(board[idx + 1][i]) // do not fuse same square twice
        ) {
          moved = true;
          board[j][i] = null;
          const fusedSquare = board[idx + 1][i];
          square.style.zIndex = -1;
          moveSquare(square, idx + 1, i);
          fusedSquares.add(fusedSquare);
          setTimeout(() => {
            square.remove();
            upgradeSquare(fusedSquare);
          }, animationSpeed); // remove square after 1 second
        } else {
          if (idx !== j) {
            moved = true;
            board[j][i] = null;
            board[idx][i] = square;
            moveSquare(square, idx, i);
          }
          idx--;
        }
      }
    }
  }
  return moved;
}

function moveRight() {
  let moved = false;
  const fusedSquares = new Set();
  for (let i = 0; i < boardSize; i++) {
    // each row
    let idx = boardSize - 1; // the idx which is empty
    for (let j = idx; j >= 0; j--) {
      const square = board[i][j];
      if (square !== null) {
        if (
          canFuseSquares(square, i, idx + 1) &&
          !fusedSquares.has(board[i][idx + 1]) // do not fuse same square twice
        ) {
          moved = true;
          board[i][j] = null;
          const fusedSquare = board[i][idx + 1];
          square.style.zIndex = -1;
          moveSquare(square, i, idx + 1);
          fusedSquares.add(fusedSquare);
          setTimeout(() => {
            square.remove();
            upgradeSquare(fusedSquare);
          }, animationSpeed); // remove square after 1 second
        } else {
          if (idx !== j) {
            moved = true;
            board[i][j] = null;
            board[i][idx] = square;
            moveSquare(square, i, idx);
          }
          idx--;
        }
      }
    }
  }
  return moved;
}

function updateScore(val = 0) {
  score += val;
  scoreEl.innerText = score;
  if (bestScore < score) bestScore = score;

  bestScoreEl.innerText = bestScore;
}

function saveGame() {
  const gameState = {
    gameStatus,
    score,
    bestScore,
    board: board.map((row) =>
      row.map((square) => (square === null ? null : square.innerText))
    ),
  };

  localStorage.setItem('2048', JSON.stringify(gameState));
}

function loadGame() {
  const gameState = JSON.parse(localStorage.getItem('2048'));
  if (!gameState) return false;
  gameStatus = gameState.gameStatus;
  score = gameState.score;
  bestScore = gameState.bestScore;
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      removeSquare(i, j);
      const val = gameState.board[i][j];
      if (val) createSquare(i, j, parseInt(val));
    }
  }

  return true;
}

resetBtn.addEventListener('click', restartGame);
closeBtn.addEventListener('click', () => popupEl.classList.add('hide'));
window.onbeforeunload = function () {
  saveGame();
};

function log(n, base) {
  return Math.round(Math.log(n) / Math.log(base));
}

initializeGame();
