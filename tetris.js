// テトリスゲームの実装

class Tetris {
    constructor() {
        this.width = 10;
        this.height = 20;
        this.board = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameRunning = false;
        this.isPaused = false;
        this.dropSpeed = 500;
        this.gameLoopInterval = null;
        this.dropInterval = null;

        // テトリミノの定義
        this.tetrominos = {
            I: { shape: [[1, 1, 1, 1]], color: 'I' },
            O: { shape: [[1, 1], [1, 1]], color: 'O' },
            T: { shape: [[0, 1, 0], [1, 1, 1]], color: 'T' },
            S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'S' },
            Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'Z' },
            J: { shape: [[1, 0, 0], [1, 1, 1]], color: 'J' },
            L: { shape: [[0, 0, 1], [1, 1, 1]], color: 'L' }
        };

        this.currentPiece = this.getRandomPiece();
        this.nextPiece = this.getRandomPiece();
        this.pieceX = 3;
        this.pieceY = 0;

        this.setupUI();
        this.setupEventListeners();
        this.render();
    }

    getRandomPiece() {
        const pieces = Object.keys(this.tetrominos);
        const randomPiece = pieces[Math.floor(Math.random() * pieces.length)];
        return JSON.parse(JSON.stringify(this.tetrominos[randomPiece]));
    }

    setupUI() {
        this.gameBoard = document.getElementById('gameBoard');
        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.nextBoard = document.getElementById('nextBoard');
        this.startBtn = document.getElementById('startBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');

        this.createBoardCells();
        this.createNextBoardCells();
    }

    createBoardCells() {
        this.gameBoard.innerHTML = '';
        this.cells = [];
        for (let y = 0; y < this.height; y++) {
            this.cells[y] = [];
            for (let x = 0; x < this.width; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.gameBoard.appendChild(cell);
                this.cells[y][x] = cell;
            }
        }
    }

    createNextBoardCells() {
        this.nextBoard.innerHTML = '';
        this.nextBoardCells = [];
        for (let y = 0; y < 4; y++) {
            this.nextBoardCells[y] = [];
            for (let x = 0; x < 4; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                this.nextBoard.appendChild(cell);
                this.nextBoardCells[y][x] = cell;
            }
        }
    }

    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.start());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.reset());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(e) {
        if (!this.isGameRunning) return;

        switch (e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.movePiece(1, 0);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.rotatePiece();
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.accelerateDrop();
                break;
            case ' ':
                e.preventDefault();
                this.togglePause();
                break;
        }
    }

    start() {
        if (this.isGameRunning) return;
        this.isGameRunning = true;
        this.isPaused = false;
        this.startBtn.disabled = true;
        this.pauseBtn.disabled = false;
        this.dropInterval = setInterval(() => this.dropPiece(), this.dropSpeed);
    }

    togglePause() {
        if (!this.isGameRunning) return;
        this.isPaused = !this.isPaused;
        this.pauseBtn.textContent = this.isPaused ? '再開' : 'ポーズ';
    }

    reset() {
        clearInterval(this.dropInterval);
        clearInterval(this.gameLoopInterval);
        this.board = Array(this.height).fill(null).map(() => Array(this.width).fill(0));
        this.score = 0;
        this.level = 1;
        this.lines = 0;
        this.isGameRunning = false;
        this.isPaused = false;
        this.pieceX = 3;
        this.pieceY = 0;
        this.currentPiece = this.getRandomPiece();
        this.nextPiece = this.getRandomPiece();
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        this.pauseBtn.textContent = 'ポーズ';
        this.updateUI();
        this.render();
    }

    movePiece(dx, dy) {
        if (this.isPaused) return;
        this.pieceX += dx;
        this.pieceY += dy;

        if (this.collides()) {
            this.pieceX -= dx;
            this.pieceY -= dy;
            return false;
        }
        return true;
    }

    rotatePiece() {
        if (this.isPaused) return;
        const oldShape = this.currentPiece.shape;
        this.currentPiece.shape = this.rotateMatrix(this.currentPiece.shape);

        if (this.collides()) {
            this.currentPiece.shape = oldShape;
        }
    }

    rotateMatrix(matrix) {
        const n = matrix.length;
        const rotated = Array(matrix[0].length).fill(null).map(() => Array(n).fill(0));
        for (let y = 0; y < n; y++) {
            for (let x = 0; x < matrix[y].length; x++) {
                rotated[x][n - 1 - y] = matrix[y][x];
            }
        }
        return rotated;
    }

    collides() {
        const shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardX = this.pieceX + x;
                    const boardY = this.pieceY + y;

                    if (boardX < 0 || boardX >= this.width || boardY >= this.height) {
                        return true;
                    }
                    if (boardY >= 0 && this.board[boardY][boardX]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    dropPiece() {
        if (this.isPaused) return;
        
        if (!this.movePiece(0, 1)) {
            this.placePiece();
            this.clearLines();
            this.spawnNewPiece();

            if (this.collides()) {
                this.gameOver();
            }
        }
        this.render();
    }

    accelerateDrop() {
        clearInterval(this.dropInterval);
        this.dropInterval = setInterval(() => this.dropPiece(), 50);
        setTimeout(() => {
            clearInterval(this.dropInterval);
            this.dropInterval = setInterval(() => this.dropPiece(), this.dropSpeed);
        }, 100);
    }

    placePiece() {
        const shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.pieceY + y;
                    const boardX = this.pieceX + x;
                    if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
                        this.board[boardY][boardX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    spawnNewPiece() {
        this.currentPiece = this.nextPiece;
        this.nextPiece = this.getRandomPiece();
        this.pieceX = 3;
        this.pieceY = 0;
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.height - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell !== 0)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.width).fill(0));
                linesCleared++;
                y++;
            }
        }

        if (linesCleared > 0) {
            this.lines += linesCleared;
            this.score += linesCleared * linesCleared * 100;
            this.level = Math.floor(this.lines / 10) + 1;
            this.dropSpeed = Math.max(100, 500 - (this.level - 1) * 30);
            this.updateUI();
        }
    }

    gameOver() {
        this.isGameRunning = false;
        clearInterval(this.dropInterval);
        this.startBtn.disabled = false;
        this.pauseBtn.disabled = true;
        alert(`ゲームオーバー！\nスコア: ${this.score}\nレベル: ${this.level}`);
    }

    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
    }

    render() {
        // ボード全体をクリア
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.cells[y][x];
                if (this.board[y][x]) {
                    cell.className = `cell filled ${this.board[y][x]}`;
                } else {
                    cell.className = 'cell';
                }
            }
        }

        // 現在のピースを描画
        const shape = this.currentPiece.shape;
        for (let y = 0; y < shape.length; y++) {
            for (let x = 0; x < shape[y].length; x++) {
                if (shape[y][x]) {
                    const boardY = this.pieceY + y;
                    const boardX = this.pieceX + x;
                    if (boardY >= 0 && boardY < this.height && boardX >= 0 && boardX < this.width) {
                        const cell = this.cells[boardY][boardX];
                        cell.className = `cell filled ${this.currentPiece.color}`;
                    }
                }
            }
        }

        // ネクストピースを描画
        for (let y = 0; y < 4; y++) {
            for (let x = 0; x < 4; x++) {
                this.nextBoardCells[y][x].className = 'cell';
            }
        }
        const nextShape = this.nextPiece.shape;
        const offsetX = Math.floor((4 - nextShape[0].length) / 2);
        const offsetY = Math.floor((4 - nextShape.length) / 2);
        for (let y = 0; y < nextShape.length; y++) {
            for (let x = 0; x < nextShape[y].length; x++) {
                if (nextShape[y][x]) {
                    const cell = this.nextBoardCells[offsetY + y][offsetX + x];
                    cell.className = `cell filled ${this.nextPiece.color}`;
                }
            }
        }
    }
}

// ゲーム開始
window.addEventListener('DOMContentLoaded', () => {
    new Tetris();
});
