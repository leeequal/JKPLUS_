
import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// Common Utilities & Hooks
// ==========================================

function useInterval(callback: () => void, delay: number | null) {
    const savedCallback = useRef<() => void>(null);

    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    useEffect(() => {
        if (delay !== null) {
            const id = setInterval(() => {
                if (savedCallback.current) savedCallback.current();
            }, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

// ==========================================
// Game 1: AI Omok (오목)
// ==========================================
const OmokGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const BOARD_SIZE = 13; 
    const EMPTY = 0;
    const BLACK = 1; // User
    const WHITE = 2; // AI

    const [board, setBoard] = useState<number[][]>(() => 
        Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY))
    );
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');
    const [turn, setTurn] = useState<number>(BLACK);
    const [lastMove, setLastMove] = useState<{r: number, c: number} | null>(null);
    const [isAiThinking, setIsAiThinking] = useState(false);

    const resetGame = () => {
        setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(EMPTY)));
        setGameStatus('playing');
        setTurn(BLACK);
        setLastMove(null);
        setIsAiThinking(false);
    };

    const checkWin = (currentBoard: number[][], r: number, c: number, player: number) => {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]]; 
        for (const [dr, dc] of directions) {
            let count = 1;
            for (let i = 1; i < 5; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || currentBoard[nr][nc] !== player) break;
                count++;
            }
            for (let i = 1; i < 5; i++) {
                const nr = r - dr * i;
                const nc = c - dc * i;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE || currentBoard[nr][nc] !== player) break;
                count++;
            }
            if (count >= 5) return true;
        }
        return false;
    };

    const handleCellClick = (r: number, c: number) => {
        if (gameStatus !== 'playing' || turn !== BLACK || board[r][c] !== EMPTY || isAiThinking) return;

        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = BLACK;
        setBoard(newBoard);
        setLastMove({ r, c });

        if (checkWin(newBoard, r, c, BLACK)) {
            setGameStatus('won');
            return;
        }

        setTurn(WHITE);
    };

    useEffect(() => {
        if (turn === WHITE && gameStatus === 'playing') {
            setIsAiThinking(true);
            const timer = setTimeout(() => {
                makeAIMove();
                setIsAiThinking(false);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [turn, gameStatus]);

    const makeAIMove = () => {
        setBoard(prevBoard => {
            const bestMove = getBestMove(prevBoard);
            
            if (!bestMove) {
                setGameStatus('draw');
                return prevBoard;
            }

            const currentBoard = prevBoard.map(row => [...row]);
            currentBoard[bestMove.r][bestMove.c] = WHITE;
            setLastMove({ r: bestMove.r, c: bestMove.c });
            
            if (checkWin(currentBoard, bestMove.r, bestMove.c, WHITE)) {
                setGameStatus('lost');
            } else {
                setTurn(BLACK);
            }
            return currentBoard;
        });
    };

    const getBestMove = (currentBoard: number[][]) => {
        let bestScore = -Infinity;
        let bestMoves: {r: number, c: number}[] = [];
        const center = Math.floor(BOARD_SIZE / 2);

        // 1. Check for immediate win
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === EMPTY) {
                    const tempBoard = currentBoard.map(row => [...row]);
                    tempBoard[r][c] = WHITE;
                    if (checkWin(tempBoard, r, c, WHITE)) return { r, c };
                }
            }
        }
        // 2. Check for immediate threat (Block)
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === EMPTY) {
                    const tempBoard = currentBoard.map(row => [...row]);
                    tempBoard[r][c] = BLACK;
                    if (checkWin(tempBoard, r, c, BLACK)) return { r, c };
                }
            }
        }

        // 3. Evaluate positions
        for (let r = 0; r < BOARD_SIZE; r++) {
            for (let c = 0; c < BOARD_SIZE; c++) {
                if (currentBoard[r][c] === EMPTY) {
                    let hasNeighbor = false;
                    const range = 2;
                    for(let dr = -range; dr <= range; dr++) {
                        for(let dc = -range; dc <= range; dc++) {
                            if (dr===0 && dc===0) continue;
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && currentBoard[nr][nc] !== EMPTY) {
                                hasNeighbor = true; break;
                            }
                        }
                        if(hasNeighbor) break;
                    }
                    if (!hasNeighbor && r === center && c === center) hasNeighbor = true;
                    if (!hasNeighbor) continue;

                    let score = (BOARD_SIZE - Math.abs(r - center) - Math.abs(c - center));
                    score += evaluatePosition(currentBoard, r, c, WHITE) * 1.2;
                    score += evaluatePosition(currentBoard, r, c, BLACK) * 1.0;

                    if (score > bestScore) {
                        bestScore = score;
                        bestMoves = [{r, c}];
                    } else if (score === bestScore) {
                        bestMoves.push({r, c});
                    }
                }
            }
        }

        if (bestMoves.length === 0) return { r: center, c: center };
        return bestMoves[Math.floor(Math.random() * bestMoves.length)];
    };

    const evaluatePosition = (currentBoard: number[][], r: number, c: number, player: number) => {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        let score = 0;
        for (const [dr, dc] of directions) {
            let consecutive = 0;
            let openEnds = 0;
            
            for (let i = 1; i < 5; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                if (currentBoard[nr][nc] === player) consecutive++;
                else if (currentBoard[nr][nc] === EMPTY) { openEnds++; break; }
                else break;
            }
            for (let i = 1; i < 5; i++) {
                const nr = r - dr * i;
                const nc = c - dc * i;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) break;
                if (currentBoard[nr][nc] === player) consecutive++;
                else if (currentBoard[nr][nc] === EMPTY) { openEnds++; break; }
                else break;
            }
            
            if (consecutive >= 4) score += 50000;
            else if (consecutive === 3 && openEnds === 2) score += 10000;
            else if (consecutive === 3 && openEnds === 1) score += 1000;
            else if (consecutive === 2 && openEnds === 2) score += 500;
            else if (consecutive === 2 && openEnds === 1) score += 100;
            else if (consecutive === 1 && openEnds === 2) score += 50;
        }
        return score;
    };

    return (
        <div className="flex flex-col items-center bg-gradient-to-b from-slate-900 to-slate-900/95 border border-slate-700/70 rounded-2xl p-4 w-full max-w-md mx-auto shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
            <div className="w-full flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-semibold tracking-tight text-slate-100">⚫⚪ AI 오목</h3>
                <div className="flex gap-2">
                    <button onClick={resetGame} className="px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-500/15 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition">재시작</button>
                    <button onClick={onBack} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition">나가기</button>
                </div>
            </div>

            <div className="relative bg-[#dcb35c] p-1 sm:p-2 rounded shadow-2xl border-4 border-[#8b5a2b] select-none touch-manipulation">
                <div 
                    className="grid relative"
                    style={{ 
                        gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`, 
                        width: 'min(85vw, 360px)', 
                        aspectRatio: '1/1',
                        backgroundImage: 'linear-gradient(45deg, #dcb35c 25%, #e6c374 25%, #e6c374 50%, #dcb35c 50%, #dcb35c 75%, #e6c374 75%, #e6c374 100%)',
                        backgroundSize: '20px 20px'
                    }}
                >
                    {board.map((row, r) => 
                        row.map((cell, c) => (
                            <div 
                                key={`${r}-${c}`}
                                onClick={() => handleCellClick(r, c)}
                                className="relative flex items-center justify-center cursor-pointer"
                            >
                                <div className="absolute w-full h-[1px] bg-black/40 pointer-events-none" style={{
                                    left: c === 0 ? '50%' : (c === BOARD_SIZE - 1 ? '-50%' : '0'),
                                    width: (c === 0 || c === BOARD_SIZE - 1) ? '50%' : '100%',
                                    transform: c === 0 ? 'translateX(0)' : (c === BOARD_SIZE - 1 ? 'translateX(50%)' : 'none')
                                }}></div>
                                <div className="absolute h-full w-[1px] bg-black/40 pointer-events-none" style={{
                                    top: r === 0 ? '50%' : (r === BOARD_SIZE - 1 ? '-50%' : '0'),
                                    height: (r === 0 || r === BOARD_SIZE - 1) ? '50%' : '100%',
                                    transform: r === 0 ? 'translateY(0)' : (r === BOARD_SIZE - 1 ? 'translateY(50%)' : 'none')
                                }}></div>
                                {BOARD_SIZE === 13 && ((r === 3 && c === 3) || (r === 3 && c === 9) || (r === 6 && c === 6) || (r === 9 && c === 3) || (r === 9 && c === 9)) && (
                                    <div className="absolute w-1.5 h-1.5 bg-black rounded-full pointer-events-none"></div>
                                )}
                                {cell !== EMPTY && (
                                    <div 
                                        className={`w-[85%] h-[85%] rounded-full shadow-sm z-10 transition-all duration-200
                                            ${cell === BLACK 
                                                ? 'bg-gradient-to-br from-gray-800 to-black shadow-slate-900/50' 
                                                : 'bg-gradient-to-br from-white to-gray-200 shadow-black/20'
                                            }`}
                                        style={{boxShadow: '2px 2px 2px rgba(0,0,0,0.3)'}}
                                    >
                                        {lastMove?.r === r && lastMove?.c === c && (
                                            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full border border-white/30 shadow-sm"></div>
                                        )}
                                    </div>
                                )}
                                {cell === EMPTY && turn === BLACK && gameStatus === 'playing' && !isAiThinking && (
                                    <div className="w-3 h-3 rounded-full bg-black/20 opacity-0 hover:opacity-100 transition-opacity z-10 pointer-events-none"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
                {gameStatus !== 'playing' && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded z-20 backdrop-blur-[2px]">
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-600 text-center shadow-2xl transform animate-fadeIn mx-4">
                            <h4 className="text-2xl font-bold mb-2">
                                {gameStatus === 'won' && <span className="text-green-400">🎉 승리하셨습니다!</span>}
                                {gameStatus === 'lost' && <span className="text-red-400">🤖 AI가 승리했습니다.</span>}
                                {gameStatus === 'draw' && <span className="text-slate-300">무승부입니다.</span>}
                            </h4>
                            <button 
                                onClick={resetGame}
                                className="w-full px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition shadow-lg mt-4"
                            >
                                다시 하기
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <div className="mt-4 flex justify-center gap-4 text-sm font-medium text-slate-400 w-full">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${turn === BLACK ? 'bg-slate-800 text-amber-300 border border-amber-500/40' : 'border border-transparent'}`}>
                    <div className="w-3 h-3 rounded-full bg-black border border-slate-600"></div> 나 (흑)
                </div>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-colors ${turn === WHITE ? 'bg-slate-800 text-amber-300 border border-amber-500/40' : 'border border-transparent'}`}>
                    <div className="w-3 h-3 rounded-full bg-white border border-slate-600"></div> AI (백) {isAiThinking && <span className="ml-1 animate-pulse">...</span>}
                </div>
            </div>
        </div>
    );
};

// ==========================================
// Game 2: Mahjong Solitaire (사천성)
// ==========================================

interface MahjongTile {
    id: number;
    value: string;
    isMatched: boolean;
}

const MahjongGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [tiles, setTiles] = useState<MahjongTile[]>([]);
    const [selectedTileId, setSelectedTileId] = useState<number | null>(null);
    const [matches, setMatches] = useState(0);
    const [isGameClear, setIsGameClear] = useState(false);

    // Standard Mahjong Unicode Tiles
    const TILE_TYPES = [
        '🀀', '🀁', '🀂', '🀃', '🀄', '🀅', '🀆', // Winds & Dragons
        '🀇', '🀈', '🀉', '🀊', '🀋', '🀌', '🀍', '🀎', '🀏', // Characters
        '🀐', '🀑', '🀒', '🀓', '🀔', '🀕', '🀖', '🀗', '🀘', // Bamboos
        '🀙', '🀚', '🀛', '🀜', '🀝', '🀞', '🀟', '🀠', '🀡'  // Dots
    ];

    const GRID_COLS = 6;
    const GRID_ROWS = 6;
    const TOTAL_TILES = GRID_COLS * GRID_ROWS;

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        const gameTiles: MahjongTile[] = [];
        const numPairs = TOTAL_TILES / 2;
        
        // Pick random types and create pairs
        const selectedTypes = [];
        for (let i = 0; i < numPairs; i++) {
            const type = TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)];
            selectedTypes.push(type);
            selectedTypes.push(type);
        }

        // Shuffle
        selectedTypes.sort(() => Math.random() - 0.5);

        // Create tile objects
        selectedTypes.forEach((val, idx) => {
            gameTiles.push({
                id: idx,
                value: val,
                isMatched: false
            });
        });

        setTiles(gameTiles);
        setSelectedTileId(null);
        setMatches(0);
        setIsGameClear(false);
    };

    const handleTileClick = (id: number) => {
        if (isGameClear) return;
        
        const clickedTile = tiles.find(t => t.id === id);
        if (!clickedTile || clickedTile.isMatched) return;

        if (selectedTileId === null) {
            // First selection
            setSelectedTileId(id);
        } else if (selectedTileId === id) {
            // Deselect if clicked same tile
            setSelectedTileId(null);
        } else {
            // Check match
            const firstTile = tiles.find(t => t.id === selectedTileId);
            if (firstTile && firstTile.value === clickedTile.value) {
                // Match found
                setTiles(prev => prev.map(t => 
                    (t.id === id || t.id === selectedTileId) ? { ...t, isMatched: true } : t
                ));
                setMatches(prev => {
                    const newMatches = prev + 1;
                    if (newMatches === TOTAL_TILES / 2) {
                        setTimeout(() => setIsGameClear(true), 500);
                    }
                    return newMatches;
                });
                setSelectedTileId(null);
            } else {
                // No match, switch selection to new tile
                setSelectedTileId(id);
            }
        }
    };

    return (
        <div className="flex flex-col items-center bg-gradient-to-b from-slate-900 to-slate-900/95 border border-slate-700/70 rounded-2xl p-4 w-full max-w-md mx-auto shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
            <div className="w-full flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-semibold tracking-tight text-slate-100">🀄 사천성 마작</h3>
                <div className="flex gap-2">
                    <button onClick={startNewGame} className="px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-500/15 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition">재시작</button>
                    <button onClick={onBack} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition">나가기</button>
                </div>
            </div>

            <div className="bg-slate-800/50 p-2 rounded-xl border border-slate-700 relative">
                <div 
                    className="grid gap-2"
                    style={{ 
                        gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
                        width: 'min(90vw, 360px)',
                    }}
                >
                    {tiles.map(tile => (
                        <div 
                            key={tile.id}
                            onClick={() => handleTileClick(tile.id)}
                            className={`
                                aspect-[3/4] rounded-md flex items-center justify-center text-3xl sm:text-4xl shadow-md cursor-pointer transition-all duration-200 select-none
                                ${tile.isMatched ? 'opacity-0 pointer-events-none transform scale-90' : 'opacity-100'}
                                ${selectedTileId === tile.id 
                                    ? 'bg-amber-100 text-amber-900 border-2 border-blue-500 -translate-y-1' 
                                    : 'bg-amber-100 text-amber-800 border-b-4 border-amber-300 hover:border-amber-400 active:border-b-0 active:translate-y-1'
                                }
                            `}
                        >
                            {tile.value}
                        </div>
                    ))}
                </div>

                {isGameClear && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white rounded-xl z-10 animate-fadeIn">
                        <div className="text-5xl mb-4">🀄🎉</div>
                        <p className="text-2xl font-bold mb-2 text-amber-400">게임 클리어!</p>
                        <p className="text-sm text-slate-300 mb-6">모든 마작패를 제거했습니다.</p>
                        <button onClick={startNewGame} className="px-6 py-3 bg-amber-600 text-white rounded-full font-bold shadow-lg hover:bg-amber-500 transition-transform hover:scale-105">
                            다시 도전하기
                        </button>
                    </div>
                )}
            </div>

            <div className="mt-4 w-full flex justify-between px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/70 text-sm text-slate-300">
                <span>남은 짝: {(TOTAL_TILES / 2) - matches}</span>
                <span>매칭: {matches} / {TOTAL_TILES / 2}</span>
            </div>
        </div>
    );
};

// ==========================================
// Game 3: Construction Tetris (현장 벽돌 쌓기)
// ==========================================

const TETROMINOS = {
    0: { shape: [[0]], color: 'bg-slate-800' },
    I: { shape: [[0, 1], [0, 1], [0, 1], [0, 1]], color: 'bg-cyan-500' },
    J: { shape: [[0, 1], [0, 1], [1, 1]], color: 'bg-blue-500' },
    L: { shape: [[1, 0], [1, 0], [1, 1]], color: 'bg-orange-500' },
    O: { shape: [[1, 1], [1, 1]], color: 'bg-yellow-500' },
    S: { shape: [[0, 1, 1], [1, 1, 0]], color: 'bg-green-500' },
    T: { shape: [[1, 1, 1], [0, 1, 0]], color: 'bg-purple-500' },
    Z: { shape: [[1, 1, 0], [0, 1, 1]], color: 'bg-red-500' },
};

const STAGE_WIDTH = 10;
const STAGE_HEIGHT = 20;

const createStage = () => Array.from(Array(STAGE_HEIGHT), () => Array(STAGE_WIDTH).fill([0, 'clear']));

const checkCollision = (player: any, stage: any, { x: moveX, y: moveY }: { x: number, y: number }) => {
    for (let y = 0; y < player.tetromino.length; y += 1) {
        for (let x = 0; x < player.tetromino[y].length; x += 1) {
            if (player.tetromino[y][x] !== 0) {
                if (
                    !stage[y + player.pos.y + moveY] ||
                    !stage[y + player.pos.y + moveY][x + player.pos.x + moveX] ||
                    stage[y + player.pos.y + moveY][x + player.pos.x + moveX][1] !== 'clear'
                ) {
                    return true;
                }
            }
        }
    }
    return false;
};

const TetrisGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [stage, setStage] = useState(createStage());
    const [dropTime, setDropTime] = useState<number | null>(null);
    const [gameOver, setGameOver] = useState(false);
    const [score, setScore] = useState(0);
    
    const [player, setPlayer] = useState({
        pos: { x: 0, y: 0 },
        tetromino: TETROMINOS[0].shape,
        collided: false,
    });

    const movePlayer = (dir: number) => {
        if (!checkCollision(player, stage, { x: dir, y: 0 })) {
            setPlayer(prev => ({ ...prev, pos: { x: prev.pos.x + dir, y: prev.pos.y } }));
        }
    };

    const startGame = () => {
        setStage(createStage());
        setDropTime(1000);
        resetPlayer();
        setGameOver(false);
        setScore(0);
    };

    const resetPlayer = useCallback(() => {
        const keys = 'IJLOSTZ';
        const randChar = keys[Math.floor(Math.random() * keys.length)] as keyof typeof TETROMINOS;
        setPlayer({
            pos: { x: STAGE_WIDTH / 2 - 2, y: 0 },
            tetromino: TETROMINOS[randChar].shape,
            collided: false,
        });
    }, []);

    const drop = () => {
        if (!checkCollision(player, stage, { x: 0, y: 1 })) {
            setPlayer(prev => ({ ...prev, pos: { x: prev.pos.x, y: prev.pos.y + 1 } }));
        } else {
            if (player.pos.y < 1) {
                setGameOver(true);
                setDropTime(null);
            }
            setPlayer(prev => ({ ...prev, collided: true }));
        }
    };

    const dropPlayer = () => {
        setDropTime(null);
        drop();
    };

    const move = ({ keyCode }: { keyCode: number }) => {
        if (!gameOver) {
            if (keyCode === 37) movePlayer(-1); // Left
            else if (keyCode === 39) movePlayer(1); // Right
            else if (keyCode === 40) dropPlayer(); // Down
            else if (keyCode === 38) playerRotate(stage, 1); // Up (Rotate)
        }
    };

    const playerRotate = (stage: any, dir: number) => {
        const clonedPlayer = JSON.parse(JSON.stringify(player));
        clonedPlayer.tetromino = rotate(clonedPlayer.tetromino, dir);
        
        const pos = clonedPlayer.pos.x;
        let offset = 1;
        while (checkCollision(clonedPlayer, stage, { x: 0, y: 0 })) {
            clonedPlayer.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > clonedPlayer.tetromino[0].length) {
                rotate(clonedPlayer.tetromino, -dir);
                clonedPlayer.pos.x = pos;
                return;
            }
        }
        setPlayer(clonedPlayer);
    };

    const rotate = (matrix: any[], dir: number) => {
        const rotated = matrix.map((_, index) => matrix.map(col => col[index]));
        if (dir > 0) return rotated.map(row => row.reverse());
        return rotated.reverse();
    };

    useInterval(() => {
        drop();
    }, dropTime);

    useEffect(() => {
        if (player.collided) {
            resetPlayer();
            setScore(prev => prev + 10);
            setDropTime(1000 / (1 + (score / 500))); // Increase speed
        }
    }, [player.collided]);

    useEffect(() => {
        const updateStage = (prevStage: any[]) => {
            // Flush stage
            const newStage = prevStage.map(row =>
                row.map((cell: any[]) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
            );

            // Draw player
            player.tetromino.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        if (
                            newStage[y + player.pos.y] &&
                            newStage[y + player.pos.y][x + player.pos.x]
                        ) {
                            // Store value AND color key
                            const type = Object.keys(TETROMINOS).find(key => JSON.stringify(TETROMINOS[key as keyof typeof TETROMINOS].shape) === JSON.stringify(player.tetromino));
                            newStage[y + player.pos.y][x + player.pos.x] = [
                                value,
                                `${player.collided ? 'merged' : 'clear'}`,
                                type
                            ];
                        }
                    }
                });
            });

            if (player.collided) {
                const sweepedStage = newStage.reduce((ack, row) => {
                    if (row.findIndex((cell: any[]) => cell[0] === 0) === -1) {
                        setScore(prev => prev + 100);
                        ack.unshift(new Array(newStage[0].length).fill([0, 'clear']));
                        return ack;
                    }
                    ack.push(row);
                    return ack;
                }, []);
                return sweepedStage;
            }

            return newStage;
        };

        setStage(prev => updateStage(prev));
    }, [player, resetPlayer]); // eslint-disable-line

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => move(e);
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [player, stage, gameOver]); // eslint-disable-line

    const getCellColor = (cell: any[]) => {
        if (cell[0] === 0) return 'bg-slate-800/50';
        if (cell[2]) {
             // @ts-ignore
             return TETROMINOS[cell[2]]?.color || 'bg-slate-500';
        }
        return 'bg-slate-500'; 
    };

    return (
        <div className="flex flex-col items-center bg-gradient-to-b from-slate-900 to-slate-900/95 border border-slate-700/70 rounded-2xl p-4 w-full max-w-md mx-auto shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
            <div className="w-full flex justify-between items-center mb-4 px-1">
                <h3 className="text-xl font-semibold tracking-tight text-slate-100">🧱 현장 벽돌 쌓기</h3>
                <div className="flex gap-2">
                    <button onClick={startGame} className="px-3 py-1.5 rounded-lg border border-amber-400/30 bg-amber-500/15 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition">
                        {gameOver ? '다시 시작' : '시작 / 리셋'}
                    </button>
                    <button onClick={onBack} className="px-3 py-1.5 rounded-lg border border-slate-600 bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 transition">나가기</button>
                </div>
            </div>

            <div className="relative border-4 border-slate-700 bg-slate-900 rounded-lg p-1 shadow-2xl">
                <div 
                    className="grid gap-[1px] bg-slate-700"
                    style={{ 
                        gridTemplateColumns: `repeat(${STAGE_WIDTH}, 1fr)`,
                        width: '200px',
                        height: '400px'
                    }}
                >
                    {stage.map((row, y) => 
                        row.map((cell, x) => (
                            <div 
                                key={`${y}-${x}`} 
                                className={`w-full h-full border-[0.5px] border-black/10 ${getCellColor(cell)}`}
                            />
                        ))
                    )}
                </div>
                
                {gameOver && (
                    <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white z-10">
                        <p className="text-2xl font-bold mb-2 text-red-500">GAME OVER</p>
                        <p className="text-lg">Score: {score}</p>
                        <button onClick={startGame} className="mt-4 px-4 py-2 bg-white text-black rounded font-bold">Retry</button>
                    </div>
                )}
                
                {!dropTime && !gameOver && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 pointer-events-none z-10">
                        <p className="text-white font-bold animate-pulse">Press Start</p>
                    </div>
                )}
            </div>

            <div className="mt-4 w-full px-4 flex justify-between items-center bg-slate-800/70 border border-slate-700 p-2.5 rounded-xl mb-4">
                <span className="text-slate-400 text-sm">Score</span>
                <span className="text-amber-300 font-semibold text-xl">{score}</span>
            </div>

            {/* Mobile Controls */}
            <div className="grid grid-cols-3 gap-2 w-full px-4 mb-2">
                <div className="col-start-2 flex justify-center">
                    <button 
                        className="w-14 h-14 bg-slate-700/90 rounded-2xl shadow-lg active:bg-amber-600/80 flex items-center justify-center border border-slate-600 active:scale-95 transition-all"
                        onClick={() => playerRotate(stage, 1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-2 w-full px-4">
                <div className="flex justify-center">
                    <button 
                        className="w-14 h-14 bg-slate-700/90 rounded-2xl shadow-lg active:bg-amber-600/80 flex items-center justify-center border border-slate-600 active:scale-95 transition-all"
                        onClick={() => movePlayer(-1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                </div>
                <div className="flex justify-center">
                    <button 
                        className="w-14 h-14 bg-slate-700/90 rounded-2xl shadow-lg active:bg-amber-600/80 flex items-center justify-center border border-slate-600 active:scale-95 transition-all"
                        onClick={() => { setDropTime(null); drop(); setDropTime(1000 / (1 + (score / 500))); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7-7-7" /></svg>
                    </button>
                </div>
                <div className="flex justify-center">
                    <button 
                        className="w-14 h-14 bg-slate-700/90 rounded-2xl shadow-lg active:bg-amber-600/80 flex items-center justify-center border border-slate-600 active:scale-95 transition-all"
                        onClick={() => movePlayer(1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// Game 4: Reaction Speed Test (안전모 잡기)
// ==========================================
const ReactionGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [state, setState] = useState<'waiting' | 'ready' | 'now' | 'finished'>('waiting');
    const [message, setMessage] = useState('화면을 클릭해서 시작하세요.');
    const [startTime, setStartTime] = useState(0);
    const [score, setScore] = useState<number | null>(null);
    const timeoutRef = useRef<number | null>(null);

    const handleMouseDown = () => {
        if (state === 'waiting' || state === 'finished') {
            setState('ready');
            setMessage('초록색이 되면 클릭하세요! (기다리세요...)');
            setScore(null);
            
            const randomTime = Math.floor(Math.random() * 2000) + 1000; // 1-3 seconds
            timeoutRef.current = window.setTimeout(() => {
                setState('now');
                setMessage('지금 클릭하세요!!!');
                setStartTime(Date.now());
            }, randomTime);
        } else if (state === 'ready') {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            setState('waiting');
            setMessage('너무 빨랐습니다! 다시 시도하려면 클릭하세요.');
        } else if (state === 'now') {
            const endTime = Date.now();
            const reactionTime = endTime - startTime;
            setScore(reactionTime);
            setState('finished');
            setMessage(`${reactionTime}ms! 대단한 반사신경입니다. 다시 하려면 클릭하세요.`);
        }
    };

    return (
        <div 
            className={`flex flex-col items-center justify-center h-96 rounded-2xl border border-slate-700/70 cursor-pointer transition-colors select-none p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.35)]
                ${state === 'waiting' || state === 'finished' ? 'bg-slate-800' : ''}
                ${state === 'ready' ? 'bg-red-900' : ''}
                ${state === 'now' ? 'bg-green-600' : ''}
            `}
            onMouseDown={handleMouseDown}
            onTouchStart={handleMouseDown}
        >
            <h3 className="text-2xl font-semibold tracking-tight text-white mb-4">⚡ 안전 순발력 테스트</h3>
            <p className="text-lg text-slate-100 font-medium mb-2">{message}</p>
            {score !== null && (
                <div className="mt-4 p-4 bg-black/30 rounded-lg">
                    <p className="text-3xl font-bold text-amber-400">{score} ms</p>
                </div>
            )}
            <div className="mt-8 text-sm text-slate-400">
                작업 현장에서는 빠른 반응속도가 생명입니다!<br/>초록색 화면이 뜨자마자 화면을 터치하세요.
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); onBack(); }}
                className="mt-8 px-4 py-2 rounded-lg border border-slate-600 bg-slate-800 text-sm text-slate-200 hover:bg-slate-700 transition"
            >
                게임 목록으로
            </button>
        </div>
    );
};

// ==========================================
// Game 5: Lucky Draw (오늘의 운세)
// ==========================================
const LuckyGame: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [result, setResult] = useState<string | null>(null);
    const [isSpinning, setIsSpinning] = useState(false);

    const fortunes = [
        "🚧 오늘은 안전운이 최고! 무사고 기원합니다.",
        "💰 예상치 못한 수입이 생길지도 몰라요!",
        "👷‍♂️ 좋은 동료를 만나 일이 술술 풀릴 거예요.",
        "🍱 점심 메뉴가 아주 맛있을 예정입니다.",
        "🌞 날씨도 좋고 컨디션도 최상이네요!",
        "🔧 장비빨이 잘 받는 날입니다. 능률 Up!"
    ];

    const drawFortune = () => {
        if (isSpinning) return;
        setIsSpinning(true);
        setResult(null);
        
        setTimeout(() => {
            const randomIndex = Math.floor(Math.random() * fortunes.length);
            setResult(fortunes[randomIndex]);
            setIsSpinning(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col items-center justify-center h-96 bg-gradient-to-b from-slate-900 to-slate-900/95 border border-slate-700/70 rounded-2xl p-6 text-center shadow-[0_16px_36px_rgba(0,0,0,0.35)]">
            <h3 className="text-2xl font-semibold tracking-tight text-white mb-6">🍀 오늘의 현장 운세</h3>
            
            {isSpinning ? (
                <div className="animate-spin text-6xl mb-6">🎲</div>
            ) : (
                <div className="text-6xl mb-6 transition-transform hover:scale-110 cursor-pointer" onClick={drawFortune}>
                    {result ? '📜' : '🎁'}
                </div>
            )}

            {result ? (
                <div className="bg-amber-500/15 border border-amber-500/35 p-4 rounded-xl animate-fadeIn">
                    <p className="text-lg font-semibold text-amber-200">{result}</p>
                </div>
            ) : (
                <p className="text-slate-400">선물 상자를 눌러 오늘의 운세를 확인하세요!</p>
            )}

            <div className="mt-8 flex gap-4">
                <button 
                    onClick={drawFortune}
                    disabled={isSpinning}
                    className="px-6 py-2 rounded-lg border border-amber-400/30 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 font-semibold transition disabled:bg-slate-600/70 disabled:text-slate-300"
                >
                    {result ? '다시 뽑기' : '운세 보기'}
                </button>
                <button 
                    onClick={onBack}
                    className="px-6 py-2 rounded-lg border border-slate-600 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
                >
                    나가기
                </button>
            </div>
        </div>
    );
};

// ==========================================
// Main Game Center Component
// ==========================================

interface GameItem {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    component: React.FC<{ onBack: () => void }>;
}

interface LoungeNewsItem {
    title: string;
    link: string;
    mobileLink: string;
    source?: string;
    pubDate?: string;
    description?: string;
}

const FALLBACK_NEWS: LoungeNewsItem[] = [
    { title: '국내 건설 경기, 인프라·정비사업 중심으로 회복 흐름', link: 'https://news.google.com', mobileLink: 'https://m.search.naver.com/search.naver?where=m_news&query=%EA%B1%B4%EC%84%A4%20%EA%B2%BD%EA%B8%B0%20%EC%9D%B8%ED%94%84%EB%9D%BC', source: '산업 브리핑', description: '건설 경기와 수주 흐름, 현장 운영 관련 주요 이슈를 요약합니다.' },
    { title: '폭염·집중호우 대비 현장 안전관리 강화 권고', link: 'https://news.google.com', mobileLink: 'https://m.search.naver.com/search.naver?where=m_news&query=%EA%B1%B4%EC%84%A4%20%ED%98%84%EC%9E%A5%20%ED%8F%AD%EC%97%BC%20%ED%98%B8%EC%9A%B0%20%EC%95%88%EC%A0%84', source: '안전 이슈', description: '작업자 보호와 우천·폭염 대응 중심의 현장 안전 소식입니다.' },
    { title: '노무·정산 디지털화 확산으로 현장 운영 효율 개선', link: 'https://news.google.com', mobileLink: 'https://m.search.naver.com/search.naver?where=m_news&query=%EB%85%B8%EB%AC%B4%20%EC%A0%95%EC%82%B0%20%EB%94%94%EC%A7%80%ED%84%B8%ED%99%94', source: '디지털 전환', description: '노무·정산 자동화와 운영 효율화 트렌드를 다룹니다.' },
    { title: '건설업 채용 시장, 숙련 인력 중심 수요 지속', link: 'https://news.google.com', mobileLink: 'https://m.search.naver.com/search.naver?where=m_news&query=%EA%B1%B4%EC%84%A4%20%EC%B1%84%EC%9A%A9%20%EC%88%99%EB%A0%A8%20%EC%9D%B8%EB%A0%A5', source: '채용 동향', description: '채용 수요와 인력 매칭 이슈를 확인할 수 있습니다.' },
];

const NEWS_CATEGORIES = [
    { id: 'general', label: '종합', query: '건설 OR 건축 OR 현장 OR 인력 OR 안전' },
    { id: 'policy', label: '정치·정책', query: '국토부 OR 건설 정책 OR 입법 OR 규제' },
    { id: 'economy', label: '경제', query: '건설 경기 OR 수주 OR 원자재 OR PF OR 분양' },
    { id: 'society', label: '사회', query: '건설 사고 OR 산업재해 OR 노무 OR 임금 OR 고용' },
    { id: 'world', label: '국제', query: '해외 건설 OR 글로벌 인프라 OR 해외 플랜트' },
    { id: 'tech', label: 'IT·과학', query: '스마트건설 OR BIM OR 건설 AI OR 건설 로봇 OR 드론 측량' },
    { id: 'sports', label: '스포츠', query: '스포츠 OR 축구 OR 야구 OR 농구 OR 배구' },
    { id: 'entertainment', label: '연예', query: '연예 OR 아이돌 OR 배우 OR 드라마 OR 예능' },
] as const;

type NewsCategoryId = (typeof NEWS_CATEGORIES)[number]['id'];

const stripHtml = (value?: string) => {
    if (!value) return '요약 정보가 없습니다. 아래 원문 기사 열기로 자세히 확인해 주세요.';
    return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
};

const formatNewsDate = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    return parsed.toLocaleString('ko-KR', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const formatRelativeTime = (value?: string) => {
    if (!value) return '';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return '';
    const diffMs = Date.now() - parsed.getTime();
    const diffMin = Math.max(1, Math.floor(diffMs / 60000));
    if (diffMin < 60) return `${diffMin}분 전`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}시간 전`;
    const diffDay = Math.floor(diffHour / 24);
    return `${diffDay}일 전`;
};

const getNewsTag = (title: string) => {
    if (title.includes('안전') || title.includes('사고') || title.includes('재해')) return '안전';
    if (title.includes('채용') || title.includes('인력') || title.includes('구인')) return '채용';
    if (title.includes('수주') || title.includes('경기') || title.includes('분양') || title.includes('PF')) return '경제';
    if (title.includes('정책') || title.includes('국토부') || title.includes('규제')) return '정책';
    if (title.includes('해외') || title.includes('글로벌') || title.includes('국제')) return '국제';
    if (title.includes('AI') || title.includes('BIM') || title.includes('로봇') || title.includes('드론')) return '기술';
    if (title.includes('축구') || title.includes('야구') || title.includes('농구') || title.includes('배구') || title.includes('스포츠')) return '스포츠';
    if (title.includes('연예') || title.includes('아이돌') || title.includes('배우') || title.includes('드라마') || title.includes('예능')) return '연예';
    return '건설';
};

const getNewsPriority = (title: string) => {
    if (title.includes('사고') || title.includes('경보') || title.includes('폭염') || title.includes('호우')) return 3;
    if (title.includes('산재') || title.includes('재해') || title.includes('안전수칙')) return 3;
    if (title.includes('안전') || title.includes('채용') || title.includes('수급')) return 2;
    if (title.includes('국토부') || title.includes('입법') || title.includes('규제')) return 2;
    return 1;
};

const getSnippet = (description?: string) => {
    const stripped = stripHtml(description);
    return stripped.length > 110 ? `${stripped.slice(0, 110)}...` : stripped;
};

const toMobileNewsLink = (title: string) =>
    `https://m.search.naver.com/search.naver?where=m_news&query=${encodeURIComponent(title)}`;

export const GameCenter: React.FC = () => {
    const LOUNGE_TAB_STORAGE_KEY = 'jkplus.lounge.activeTab';
    const [activeGameId, setActiveGameId] = useState<string | null>(null);
    const [news, setNews] = useState<LoungeNewsItem[]>(FALLBACK_NEWS);
    const [isNewsLoading, setIsNewsLoading] = useState(true);
    const [newsError, setNewsError] = useState<string | null>(null);
    const [activeNewsCategory, setActiveNewsCategory] = useState<NewsCategoryId>('general');
    const [activeLoungeTab, setActiveLoungeTab] = useState<'news' | 'games'>(() => {
        const saved = localStorage.getItem(LOUNGE_TAB_STORAGE_KEY);
        return saved === 'games' ? 'games' : 'news';
    });
    const [selectedNews, setSelectedNews] = useState<LoungeNewsItem | null>(null);

    const GAMES: GameItem[] = [
        {
            id: 'omok',
            title: 'AI 오목',
            description: 'AI와 정교한 수 읽기 대결을 즐겨보세요. 짧게 몰입하기 좋은 전략 게임입니다.',
            icon: <span className="text-3xl">⚫</span>,
            component: OmokGame
        },
        {
            id: 'mahjong',
            title: '사천성 마작',
            description: '같은 패를 빠르게 찾아 지우는 집중력 퍼즐입니다. 템포 있게 즐겨보세요.',
            icon: <span className="text-3xl">🀄</span>,
            component: MahjongGame
        },
        {
            id: 'tetris',
            title: '현장 벽돌 쌓기',
            description: '블록을 빈틈없이 정리해 점수를 올려보세요. 손맛이 좋은 클래식 모드입니다.',
            icon: <span className="text-3xl">🧱</span>,
            component: TetrisGame
        },
        {
            id: 'reaction',
            title: '안전 순발력 테스트',
            description: '신호가 뜨는 순간 터치! 나의 반응 속도를 간단하게 측정해 보세요.',
            icon: <span className="text-3xl">⚡</span>,
            component: ReactionGame
        },
        {
            id: 'lucky',
            title: '오늘의 현장 운세',
            description: '가볍게 확인하는 오늘의 운세 카드. 쉬는 시간에 부담 없이 즐겨보세요.',
            icon: <span className="text-3xl">🍀</span>,
            component: LuckyGame
        }
    ];

    const activeGame = GAMES.find(g => g.id === activeGameId);

    useEffect(() => {
        let isMounted = true;

        const fetchNews = async () => {
            try {
                setIsNewsLoading(true);
                const query = NEWS_CATEGORIES.find(category => category.id === activeNewsCategory)?.query ?? NEWS_CATEGORIES[0].query;
                const rssUrl = encodeURIComponent(`https://news.google.com/rss/search?q=${query}&hl=ko&gl=KR&ceid=KR:ko`);
                const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${rssUrl}`);
                if (!response.ok) throw new Error(`status ${response.status}`);
                const data = await response.json();

                const items = Array.isArray(data?.items)
                    ? data.items.slice(0, 6).map((item: any) => ({
                        title: item.title as string,
                        link: item.link as string,
                        mobileLink: toMobileNewsLink(item.title as string),
                        source: item.author || '주요 뉴스',
                        pubDate: item.pubDate as string,
                        description: stripHtml(item.description as string),
                    }))
                    : [];

                if (isMounted && items.length > 0) {
                    const sorted = [...items].sort((a, b) => {
                        const priorityDiff = getNewsPriority(b.title) - getNewsPriority(a.title);
                        if (priorityDiff !== 0) return priorityDiff;
                        const aTime = a.pubDate ? new Date(a.pubDate).getTime() : 0;
                        const bTime = b.pubDate ? new Date(b.pubDate).getTime() : 0;
                        return bTime - aTime;
                    });
                    setNews(sorted);
                    setNewsError(null);
                } else if (isMounted) {
                    setNewsError('실시간 뉴스가 없어 기본 소식을 표시합니다.');
                }
            } catch (error) {
                console.error('휴게실 뉴스 조회 실패', error);
                if (isMounted) setNewsError('실시간 뉴스 조회에 실패하여 기본 소식을 표시합니다.');
            } finally {
                if (isMounted) setIsNewsLoading(false);
            }
        };

        void fetchNews();

        return () => {
            isMounted = false;
        };
    }, [activeNewsCategory]);

    useEffect(() => {
        localStorage.setItem(LOUNGE_TAB_STORAGE_KEY, activeLoungeTab);
    }, [activeLoungeTab]);

    if (activeGame) {
        const GameComponent = activeGame.component;
        return (
            <div className="animate-fadeIn">
                <GameComponent onBack={() => setActiveGameId(null)} />
            </div>
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="mb-6 text-center">
                <h2 className="text-2xl md:text-3xl font-bold text-slate-100">🏗️ 인력 라운지</h2>
                <p className="text-slate-400 mt-2">현장에 필요한 뉴스를 먼저 확인하고, 원하실 때만 미니게임을 이용해 주세요.</p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl border border-slate-700 bg-slate-900/70 p-1.5">
                <button
                    onClick={() => setActiveLoungeTab('news')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        activeLoungeTab === 'news'
                            ? 'bg-indigo-500/25 border border-indigo-400/40 text-indigo-200'
                            : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                    📰 뉴스 브리핑
                </button>
                <button
                    onClick={() => setActiveLoungeTab('games')}
                    className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                        activeLoungeTab === 'games'
                            ? 'bg-indigo-500/25 border border-indigo-400/40 text-indigo-200'
                            : 'text-slate-300 hover:bg-slate-800'
                    }`}
                >
                    🎮 게임
                </button>
            </div>

            {activeLoungeTab === 'news' && (
            <div className="mb-6 bg-slate-800/40 border border-slate-700 rounded-xl p-5">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                    <h3 className="text-lg font-bold text-slate-100">📰 주요 뉴스 브리핑</h3>
                    <div className="flex flex-wrap gap-2">
                        {NEWS_CATEGORIES.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveNewsCategory(category.id)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition ${
                                    activeNewsCategory === category.id
                                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                        : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>
                {isNewsLoading && <p className="text-xs text-slate-400 mb-2">불러오는 중...</p>}
                {newsError && <p className="text-xs text-amber-400 mb-2">{newsError}</p>}
                <div className="mb-3">
                    <p className="text-xs font-bold text-slate-300 mb-2">오늘의 핵심 3건</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {news.slice(0, 3).map((item, index) => (
                            <button
                                key={`${item.link}-top-${index}`}
                                onClick={() => {
                                    setSelectedNews(item);
                                }}
                                className="text-left p-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-amber-500/50 transition"
                            >
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{getNewsTag(item.title)}</span>
                                    <span className="text-[10px] text-slate-500">{formatRelativeTime(item.pubDate)}</span>
                                </div>
                                <p className="text-sm font-semibold text-slate-100 leading-snug">{item.title}</p>
                                <p className="text-[11px] text-slate-400 mt-1">{getSnippet(item.description)}</p>
                            </button>
                        ))}
                    </div>
                </div>
                <ul className="space-y-2">
                    {news.map((item, index) => (
                        <li key={`${item.link}-${index}`}>
                            <button
                                onClick={() => {
                                    setSelectedNews(item);
                                }}
                                className="w-full text-left p-3 rounded-lg bg-slate-900/60 border border-slate-700 hover:border-amber-500/50 transition"
                            >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-700 text-slate-200">{getNewsTag(item.title)}</span>
                                        <span className="text-[10px] text-slate-500">{formatRelativeTime(item.pubDate)}</span>
                                    </div>
                                    <p className="text-sm text-slate-200 hover:text-amber-300 transition-colors">{item.title}</p>
                                    <p className="text-[11px] text-slate-500 mt-1">{item.source || '주요 뉴스'} {formatNewsDate(item.pubDate) ? `· ${formatNewsDate(item.pubDate)}` : ''}</p>
                                </button>
                        </li>
                    ))}
                </ul>
            </div>
            )}

            {activeLoungeTab === 'games' && (
            <div className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-700/70 rounded-2xl p-4 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-500/40 to-transparent" />
                <div className="mb-4">
                    <p className="text-sm sm:text-base font-semibold text-slate-100 tracking-tight">🎮 선택형 미니게임</p>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">짧게 쉬고 싶을 때 바로 실행하실 수 있습니다.</p>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                        {GAMES.map(game => (
                            <button
                                key={game.id}
                                onClick={() => setActiveGameId(game.id)}
                                className="group relative overflow-hidden flex items-start gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border border-slate-700/80 bg-slate-800/60 hover:bg-slate-800/95 hover:border-slate-500/70 active:scale-[0.99] transition-all duration-200 text-left"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-r from-white/[0.03] to-transparent" />
                                <div className="relative shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-slate-600/70 bg-slate-900/90 flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                                    {game.icon}
                                </div>
                                <div className="relative min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <h3 className="text-base sm:text-lg font-semibold text-slate-100 tracking-tight group-hover:text-white transition-colors">
                                            {game.title}
                                        </h3>
                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-700/70 text-slate-300 border border-slate-600/70">
                                            빠른 플레이
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                                        {game.description}
                                    </p>
                                </div>
                            </button>
                        ))}
                </div>
            </div>
            )}

            {selectedNews && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm p-3 sm:p-6">
                    <div className="mx-auto h-full max-w-3xl bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden flex flex-col">
                        <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between gap-2">
                            <p className="text-sm font-bold text-slate-200">기사 보기</p>
                            <button
                                onClick={() => setSelectedNews(null)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200"
                            >
                                휴게실로 돌아가기
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4">
                            <h4 className="text-lg font-bold text-white leading-snug">{selectedNews.title}</h4>
                            <p className="text-xs text-slate-400 mt-2">{selectedNews.source || '주요 뉴스'} {formatNewsDate(selectedNews.pubDate) ? `· ${formatNewsDate(selectedNews.pubDate)}` : ''}</p>

                            <div className="mt-4 bg-slate-800/70 border border-slate-700 rounded-xl p-4">
                                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">{stripHtml(selectedNews.description)}</p>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                                <a
                                    href={selectedNews.mobileLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    모바일 뉴스로 보기
                                </a>
                                <button
                                    onClick={() => navigator.clipboard?.writeText(selectedNews.link)}
                                    className="px-3 py-2 text-xs font-bold rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100"
                                >
                                    링크 복사
                                </button>
                                <a
                                    href={selectedNews.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-500 text-white"
                                >
                                    원문 새 탭으로 열기
                                </a>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-3">
                                가독성 문제를 줄이기 위해 앱 내 임베드 대신 모바일 뉴스 페이지로 이동하도록 변경했습니다.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
