const gameContainerEl = document.getElementById('gameContainer');
const squareEl = gameContainerEl.querySelector('.tile');

const squareSize = 100; // px
const gap = 15; // px
const boardSize = 4;

let board;

const [UP, RIGHT, DOWN, LEFT] = [
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
  'ArrowLeft',
];

let rows;

function initializeGame() {
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

  createSquare(0, 1, 31);
  createSquare(1, 2, 31);
  //   createSquare(3, 3, 2);
  spawnRandomSquare();
  spawnRandomSquare();
}

function createSquare(x, y, val) {
  const square = document.createElement('div');
  square.className = 'square';
  square.style.backgroundColor = 'pink';
  square.style.top = x * (squareSize + gap) + gap + 'px';
  square.style.left = y * (squareSize + gap) + gap + 'px';
  square.innerText = val;

  board[x][y] = square;
  gameContainerEl.appendChild(square);
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
  const val = Math.random() < 0.9 ? 2 : 4;
  createSquare(x, y, val);
}

function moveSquare(square, x, y) {
  square.style.top = x * (squareSize + gap) + gap + 'px';
  square.style.left = y * (squareSize + gap) + gap + 'px';
}

document.addEventListener('keydown', (e) => {
  console.log(e.key);
  switch (e.key) {
    case UP:
      moveUp();
      break;
    case RIGHT:
      moveRight();
      break;
    case DOWN:
      moveDown();
      break;
    case LEFT:
      moveLeft();
      break;
    case ' ':
      spawnRandomSquare();
  }
});

function moveUp() {
  for (let i = 0; i < boardSize; i++) {
    // each column
    let emptyIdx = 0;
    for (let j = emptyIdx; j < boardSize; j++) {
      if (board[j][i] !== null) {
        if (j !== emptyIdx) {
          moveSquare(board[j][i], emptyIdx, i);
          board[emptyIdx][i] = board[j][i];
          board[j][i] = null;
        }
        emptyIdx++;
      }
    }
  }
}

function moveLeft() {
  for (let i = 0; i < boardSize; i++) {
    // each row
    let emptyIdx = 0;
    for (let j = emptyIdx; j < boardSize; j++) {
      if (board[i][j] !== null) {
        if (j !== emptyIdx) {
          moveSquare(board[i][j], i, emptyIdx);
          board[i][emptyIdx] = board[i][j];
          board[i][j] = null;
        }

        emptyIdx++;
      }
    }
  }
}

function moveDown() {
  for (let i = 0; i < boardSize; i++) {
    // each column
    let emptyIdx = boardSize - 1;
    for (let j = emptyIdx; j >= 0; j--) {
      if (board[j][i] !== null) {
        if (j !== emptyIdx) {
          moveSquare(board[j][i], emptyIdx, i);
          board[emptyIdx][i] = board[j][i];
          board[j][i] = null;
        }
        emptyIdx--;
      }
    }
  }
}

function moveRight() {
  for (let i = 0; i < boardSize; i++) {
    // each row
    let emptyIdx = boardSize - 1;
    for (let j = emptyIdx; j >= 0; j--) {
      if (board[i][j] !== null) {
        if (j !== emptyIdx) {
          moveSquare(board[i][j], i, emptyIdx);
          board[i][emptyIdx] = board[i][j];
          board[i][j] = null;
        }

        emptyIdx--;
      }
    }
  }
}

initializeGame();
