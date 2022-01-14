const gameHeaderEl = document.getElementById('gameHeader');
const gameContainerEl = document.getElementById('gameContainer');
const squareEl = gameContainerEl.querySelector('.tile');

const squareSize = 100; // px
const gap = 15; // px
const boardSize = 4;
const animationSpeed = 100; // ms

let flag; // do not receive input when false
let board;

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

// Nice idea but doesn't look good in practice
// const redMax = 255;
// const greenMax = 123;
// const blueMax = 0;
// const squareCount = 11; // 2^11 = 2048
// computeColors();
// function computeColors() {
//   // 255 -> 255-colorDiff -> ... -> colorMax
//   const redDiff = parseInt((255 - redMax) / 11);
//   const greenDiff = parseInt((255 - greenMax) / 11);
//   const blueDiff = parseInt((255 - blueMax) / 11);
//   let red = 255,
//     green = 255,
//     blue = 255;
//   for (let i = 0; i < squareCount; i++) {
//     red -= redDiff;
//     green -= greenDiff;
//     blue -= blueDiff;
//     colors.push(`rgb(${red}, ${green}, ${blue})`);
//   }
// }

let rows;

function initializeGame() {
  flag = true;
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

  //   createSquare(0, 0, 2);
  //   createSquare(0, 1, 4);
  //   createSquare(0, 2, 8);
  //   createSquare(0, 3, 16);
  //   createSquare(1, 0, 32);
  //   createSquare(1, 1, 64);
  //   createSquare(1, 2, 128);
  //   createSquare(1, 3, 256);
  //   createSquare(2, 0, 512);
  //   createSquare(2, 1, 1024);
  //   createSquare(2, 2, 2048);

  spawnRandomSquare();
  spawnRandomSquare();
}

function restartGame() {
  flag = true;
  board.forEach((row) =>
    row.forEach((square) => {
      if (square !== null) {
        square.classList.add('shrink');
        setTimeout(() => square.remove(), animationSpeed);
      }
    })
  );
}

function createSquare(x, y, val) {
  const square = document.createElement('div');
  square.className = 'square shrink';
  square.style.backgroundColor = colors[Math.log2(val) - 1];
  square.style.top = x * (squareSize + gap) + gap + 'px';
  square.style.left = y * (squareSize + gap) + gap + 'px';
  square.innerText = val;

  board[x][y] = square;
  gameContainerEl.appendChild(square);
  setTimeout(() => square.classList.remove('shrink'), animationSpeed);
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

function canFuseSquares(square, x, y) {
  return (
    0 <= x &&
    x < boardSize &&
    0 <= y &&
    y < boardSize &&
    square.innerText === board[x][y].innerText
  );
}

function upgradeSquare(square) {
  const val = parseInt(square.innerText) * 2;
  square.innerText = val;
  square.style.backgroundColor = colors[Math.log2(val) - 1];
  square.classList.add('enlarge');
  setTimeout(() => square.classList.remove('enlarge'), animationSpeed);
}

document.addEventListener('keydown', (e) => {
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
      spawnRandomSquare();
  }

  if (moved) spawnRandomSquare();
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

gameHeaderEl.addEventListener('click', restartGame);

initializeGame();
