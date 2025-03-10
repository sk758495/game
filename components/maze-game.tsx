"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface MazeGameProps {
  onComplete: (score: number, metrics: MazeMetrics) => void;
}

// Cognitive metrics interface for maze navigation
interface MazeMetrics {
  completionTime: number;
  totalMoves: number;
  wallCollisions: number;
  backtrackCount: number;
  pathLength: number;
  optimalPathLength: number;
  pathEfficiency: number;
  averageTimePerMove: number;
  movementPatterns: {
    up: number;
    down: number;
    left: number;
    right: number;
  };
  heatmap: number[][];  // Represents visited cell frequency
  performanceOverTime: {
    firstHalf: {
      speed: number;  // Average time per move
      accuracy: number;  // Fewer wall collisions
    };
    secondHalf: {
      speed: number;
      accuracy: number;
    };
  };
  // New path analysis metrics
  pathDeviation: number;  // Number of moves deviating from optimal path
  optimalPath: Point[];  // The calculated optimal path
  actualPath: Point[];   // The path actually taken by the player
}

const MAZE_SIZE = 21; // Ensure odd number for better maze structure
const CELL_SIZE = 30; // Adjusted for better fit on screen
const PLAYER = "P";
const WALL = "#";
const EXIT = "E";
const PATH = " ";

const COLORS = {
  START: "#FFD700", // Gold for start position
  END: "#FF4500", // Orange-Red for exit position
  WALL: "#1E3A8A", // Dark Blue for walls
  PLAYER: "#6D28D9", // Purple for the player
  EXIT: "#14B8A6", // Teal for exit
  PATH: "#F3F4F6", // Light gray for paths
};

// Session storage keys for maze game
const MAZE_STORAGE_KEYS = {
  MAZE: "maze_game_maze",
  PLAYER_POS: "maze_game_player_pos",
  GAME_COMPLETE: "maze_game_complete"
};

const generateMaze = () => {
  const maze = Array.from({ length: MAZE_SIZE }, () => Array(MAZE_SIZE).fill(WALL));

  const carvePath = (x: number, y: number) => {
    maze[y][x] = PATH;
    const directions = [
      [0, -2], [0, 2], [-2, 0], [2, 0]
    ].sort(() => Math.random() - 0.5);

    for (const [dx, dy] of directions) {
      const newX = x + dx;
      const newY = y + dy;
      if (newX > 0 && newX < MAZE_SIZE - 1 && newY > 0 && newY < MAZE_SIZE - 1 && maze[newY][newX] === WALL) {
        maze[newY][newX] = PATH;
        maze[y + dy / 2][x + dx / 2] = PATH;
        carvePath(newX, newY);
      }
    }
  };

  carvePath(1, 1);
  maze[1][1] = PLAYER;
  maze[MAZE_SIZE - 2][MAZE_SIZE - 2] = EXIT;
  return maze;
};

const saveMazeToStorage = (maze: string[][], playerPos: { x: number, y: number }, gameComplete: boolean) => {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(MAZE_STORAGE_KEYS.MAZE, JSON.stringify(maze));
    sessionStorage.setItem(MAZE_STORAGE_KEYS.PLAYER_POS, JSON.stringify(playerPos));
    sessionStorage.setItem(MAZE_STORAGE_KEYS.GAME_COMPLETE, JSON.stringify(gameComplete));
  } catch (error) {
    console.error("Error saving maze game to session storage:", error);
  }
};

const clearMazeStorage = () => {
  if (typeof window === 'undefined') return;
  
  Object.values(MAZE_STORAGE_KEYS).forEach(key => {
    sessionStorage.removeItem(key);
  });
};

interface Point {
  x: number;
  y: number;
}

interface QueueItem {
  point: Point;
  path: Point[];
}

const findOptimalPath = (maze: string[][], start: Point, end: Point): Point[] => {
  const queue: QueueItem[] = [{ point: start, path: [start] }];
  const visited = new Set<string>();
  const directions = [
    { x: 0, y: -1 }, // up
    { x: 0, y: 1 },  // down
    { x: -1, y: 0 }, // left
    { x: 1, y: 0 }   // right
  ];

  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { point, path } = queue.shift()!;
    
    if (point.x === end.x && point.y === end.y) {
      return path;
    }

    for (const dir of directions) {
      const newX = point.x + dir.x;
      const newY = point.y + dir.y;
      const newPoint = { x: newX, y: newY };
      const key = `${newX},${newY}`;

      if (
        newX >= 0 && newX < MAZE_SIZE &&
        newY >= 0 && newY < MAZE_SIZE &&
        maze[newY][newX] !== WALL &&
        !visited.has(key)
      ) {
        visited.add(key);
        queue.push({
          point: newPoint,
          path: [...path, newPoint]
        });
      }
    }
  }

  return []; // No path found
};

const calculatePathDeviation = (optimalPath: Point[], actualPath: Point[]): number => {
  // Create sets of position strings for easy comparison
  const optimalSet = new Set(optimalPath.map(p => `${p.x},${p.y}`));
  const actualSet = new Set(actualPath.map(p => `${p.x},${p.y}`));

  // Calculate positions in actual path but not in optimal path
  const extraMoves = [...actualSet].filter(pos => !optimalSet.has(pos)).length;

  // Calculate positions in optimal path but not taken in actual path
  const missedMoves = [...optimalSet].filter(pos => !actualSet.has(pos)).length;

  return extraMoves + missedMoves;
};

export default function MazeGame({ onComplete }: MazeGameProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [maze, setMaze] = useState(() => {
    // Try to load maze from session storage
    if (typeof window !== 'undefined') {
      try {
        const savedMaze = sessionStorage.getItem(MAZE_STORAGE_KEYS.MAZE);
        if (savedMaze) {
          return JSON.parse(savedMaze);
        }
      } catch (error) {
        console.error("Error loading maze from session storage:", error);
      }
    }
    return generateMaze();
  });
  
  const [playerPos, setPlayerPos] = useState(() => {
    // Try to load player position from session storage
    if (typeof window !== 'undefined') {
      try {
        const savedPlayerPos = sessionStorage.getItem(MAZE_STORAGE_KEYS.PLAYER_POS);
        if (savedPlayerPos) {
          return JSON.parse(savedPlayerPos);
        }
      } catch (error) {
        console.error("Error loading player position from session storage:", error);
      }
    }
    return { x: 1, y: 1 };
  });
  
  const [gameState, setGameState] = useState<"ready" | "playing" | "gameOver">("ready");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // Metrics tracking state
  const [startTime, setStartTime] = useState<number>(0);
  const [moveCount, setMoveCount] = useState(0);
  const [wallCollisions, setWallCollisions] = useState(0);
  const [backtrackCount, setBacktrackCount] = useState(0);
  const [movementHistory, setMovementHistory] = useState<string[]>([]);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
  const [movePatterns, setMovePatterns] = useState({
    up: 0,
    down: 0,
    left: 0,
    right: 0,
  });
  const [firstHalfMetrics, setFirstHalfMetrics] = useState({
    moves: 0,
    collisions: 0,
    time: 0,
  });
  const [heatmap, setHeatmap] = useState<number[][]>([]);

  // Add these new state variables
  const [optimalPath, setOptimalPath] = useState<Point[]>([]);
  const [actualPath, setActualPath] = useState<Point[]>([]);
  const [pathDeviation, setPathDeviation] = useState(0);

  // Save game state to session storage whenever it changes
  useEffect(() => {
    saveMazeToStorage(maze, playerPos, gameState === "gameOver");
  }, [maze, playerPos, gameState]);

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "playing") {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameState("gameOver");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState]);

  const drawMaze = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    canvas.width = MAZE_SIZE * CELL_SIZE;
    canvas.height = MAZE_SIZE * CELL_SIZE;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the base maze
    for (let y = 0; y < MAZE_SIZE; y++) {
      for (let x = 0; x < MAZE_SIZE; x++) {
        ctx.fillStyle = COLORS[maze[y][x] as keyof typeof COLORS] || COLORS.PATH;
        ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        if (maze[y][x] === WALL) {
          ctx.strokeStyle = "#334155";
          ctx.lineWidth = 3;
          ctx.strokeRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }
    }

    // Draw start and end positions
    ctx.fillStyle = COLORS.START;
    ctx.fillRect(1 * CELL_SIZE, 1 * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
    ctx.fillStyle = COLORS.END;
    ctx.fillRect((MAZE_SIZE - 2) * CELL_SIZE, (MAZE_SIZE - 2) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
    
    // Draw the player
    ctx.fillStyle = COLORS.PLAYER;
    ctx.beginPath();
    ctx.arc(
      playerPos.x * CELL_SIZE + CELL_SIZE / 2,
      playerPos.y * CELL_SIZE + CELL_SIZE / 2,
      CELL_SIZE / 3,
      0,
      Math.PI * 2
    );
    ctx.fill();

  }, [maze, playerPos]);

  useEffect(() => {
    drawMaze();
  }, [drawMaze]);

  const resetGame = useCallback(() => {
    startGame();
  }, []);

  const startGame = () => {
    const newMaze = generateMaze();
    setMaze(newMaze);
    const startPoint = { x: 1, y: 1 };
    const endPoint = { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 };
    
    // Calculate optimal path at the start
    const optimal = findOptimalPath(newMaze, startPoint, endPoint);
    setOptimalPath(optimal);
    
    setPlayerPos(startPoint);
    setActualPath([startPoint]);
    setPathDeviation(0);
    setGameState("playing");
    setTimeLeft(60);
    setScore(0);
    // Initialize metrics
    setStartTime(Date.now());
    setMoveCount(0);
    setWallCollisions(0);
    setBacktrackCount(0);
    setMovementHistory([]);
    setVisitedCells(new Set(['1,1']));
    setMovePatterns({ up: 0, down: 0, left: 0, right: 0 });
    setFirstHalfMetrics({ moves: 0, collisions: 0, time: 0 });
    setHeatmap(Array(MAZE_SIZE).fill(0).map(() => Array(MAZE_SIZE).fill(0)));
    clearMazeStorage();
  };

  const handleMove = useCallback((direction: { x: number; y: number }, key: string) => {
    if (gameState !== "playing") return;

    const newPos = {
      x: playerPos.x + direction.x,
      y: playerPos.y + direction.y,
    };

    // Update movement patterns
    const directionKey = key.replace('Arrow', '').toLowerCase() as 'up' | 'down' | 'left' | 'right';
    setMovePatterns(prev => ({
      ...prev,
      [directionKey]: prev[directionKey] + 1
    }));

    // Check for wall collision
    if (maze[newPos.y][newPos.x] === WALL) {
      setWallCollisions(prev => prev + 1);
      return;
    }

    // Check for backtracking
    const newPosKey = `${newPos.x},${newPos.y}`;
    if (visitedCells.has(newPosKey)) {
      setBacktrackCount(prev => prev + 1);
    }

    // Update visited cells and heatmap
    setVisitedCells(prev => new Set([...prev, newPosKey]));
    setHeatmap(prev => {
      const newHeatmap = [...prev];
      newHeatmap[newPos.y][newPos.x]++;
      return newHeatmap;
    });

    // Track movement history
    setMovementHistory(prev => [...prev, directionKey]);
    setMoveCount(prev => prev + 1);

    // Update actual path
    setActualPath(prev => [...prev, newPos]);

    // Update position
    setPlayerPos(newPos);

    // Check if halfway point and update metrics
    if (moveCount === Math.floor(MAZE_SIZE * MAZE_SIZE / 2)) {
      setFirstHalfMetrics({
        moves: moveCount,
        collisions: wallCollisions,
        time: Date.now() - startTime,
      });
    }

    // Check for maze completion
    if (newPos.x === MAZE_SIZE - 2 && newPos.y === MAZE_SIZE - 2) {
      const endTime = Date.now();
      const totalTime = endTime - startTime;
      
      // Calculate final path deviation
      const finalDeviation = calculatePathDeviation(optimalPath, [...actualPath, newPos]);
      setPathDeviation(finalDeviation);
      
      // Calculate metrics
      const metrics: MazeMetrics & { 
        optimalPath: Point[];
        actualPath: Point[];
        pathDeviation: number;
      } = {
        completionTime: totalTime,
        totalMoves: moveCount + 1,
        wallCollisions,
        backtrackCount,
        pathLength: movementHistory.length + 1,
        optimalPathLength: optimalPath.length,
        pathEfficiency: optimalPath.length / (movementHistory.length + 1),
        pathDeviation: finalDeviation,
        optimalPath,
        actualPath: [...actualPath, newPos],
        averageTimePerMove: totalTime / (moveCount + 1),
        movementPatterns: movePatterns,
        heatmap,
        performanceOverTime: {
          firstHalf: {
            speed: firstHalfMetrics.moves > 0 ? firstHalfMetrics.time / firstHalfMetrics.moves : 0,
            accuracy: firstHalfMetrics.moves > 0 ? 1 - (firstHalfMetrics.collisions / firstHalfMetrics.moves) : 0,
          },
          secondHalf: {
            speed: (totalTime - firstHalfMetrics.time) / (moveCount - firstHalfMetrics.moves),
            accuracy: 1 - ((wallCollisions - firstHalfMetrics.collisions) / (moveCount - firstHalfMetrics.moves)),
          },
        },
      };

      setGameState("gameOver");
      // Calculate score based on metrics
      const timeBonus = Math.max(0, Math.floor((60 - totalTime / 1000) * 10));
      const efficiencyBonus = Math.floor(metrics.pathEfficiency * 500);
      const accuracyBonus = Math.floor((1 - metrics.wallCollisions / metrics.totalMoves) * 300);
      const finalScore = Math.max(100, timeBonus + efficiencyBonus + accuracyBonus);
      setScore(finalScore);
      
      // Clear storage and complete game
      clearMazeStorage();
      setTimeout(() => onComplete(finalScore, metrics), 500);
    }
  }, [gameState, maze, playerPos, moveCount, wallCollisions, movementHistory, visitedCells, movePatterns, startTime, firstHalfMetrics, heatmap, onComplete, optimalPath, actualPath]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (gameState !== "playing") return;
      
      switch (event.key) {
        case "ArrowUp": handleMove({ x: 0, y: -1 }, event.key); break;
        case "ArrowDown": handleMove({ x: 0, y: 1 }, event.key); break;
        case "ArrowLeft": handleMove({ x: -1, y: 0 }, event.key); break;
        case "ArrowRight": handleMove({ x: 1, y: 0 }, event.key); break;
        case "r": resetGame(); break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove, gameState, resetGame]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F3F4F6] py-4">
      <h2 className="text-3xl font-bold text-[#1E3A8A] mb-2">Maze Navigator</h2>

      {gameState === "ready" && (
        <div className="text-center space-y-6">
          <div className="bg-[#F3F4F6] p-4 rounded-lg">
            <p className="mb-4">Navigate through the maze using arrow keys. Reach the exit before time runs out!</p>
            <p>You have 60 seconds. Try to find the most efficient path!</p>
          </div>
          <Button onClick={startGame} className="w-full py-6 text-lg bg-[#1E3A8A] hover:bg-[#1E40AF]">
            Start Game
          </Button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="text-center mb-4">
            <div className="flex justify-between items-center w-full max-w-md mb-2">
              <span className="font-bold">Time: {timeLeft}s</span>
              <span className="font-bold">Moves: {moveCount}</span>
            </div>
            <p className="text-[#1E3A8A]">Use Arrow Keys to Move</p>
            <p className="text-sm text-gray-500">Press 'R' to reset the maze</p>
          </div>
          <canvas 
            ref={canvasRef} 
            className="border-4 border-[#1E3A8A] bg-[#F3F4F6]" 
            style={{ width: MAZE_SIZE * CELL_SIZE, height: MAZE_SIZE * CELL_SIZE }} 
          />
        </>
      )}

      {gameState === "gameOver" && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#1E3A8A]">Game Complete!</h2>
          <div className="bg-[#F3F4F6] p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-lg font-semibold">Your Score</p>
              <p className="text-4xl font-bold text-[#6D28D9]">{score}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Total Moves</p>
                <p className="text-xl font-bold text-[#14B8A6]">{moveCount}</p>
              </div>
              <div>
                <p className="font-medium">Wall Collisions</p>
                <p className="text-xl font-bold text-[#14B8A6]">{wallCollisions}</p>
              </div>
            </div>
          </div>
          <Button onClick={() => startGame()} className="w-full py-6 text-lg bg-[#1E3A8A] hover:bg-[#1E40AF]">
            Try Again
          </Button>
          <Button onClick={() => onComplete(score, {
            completionTime: Date.now() - startTime,
            totalMoves: moveCount,
            wallCollisions,
            backtrackCount,
            pathLength: movementHistory.length,
            optimalPathLength: optimalPath.length,
            pathEfficiency: optimalPath.length / movementHistory.length,
            averageTimePerMove: (Date.now() - startTime) / moveCount,
            movementPatterns: movePatterns,
            heatmap,
            performanceOverTime: {
              firstHalf: {
                speed: firstHalfMetrics.moves > 0 ? firstHalfMetrics.time / firstHalfMetrics.moves : 0,
                accuracy: firstHalfMetrics.moves > 0 ? 1 - (firstHalfMetrics.collisions / firstHalfMetrics.moves) : 0,
              },
              secondHalf: {
                speed: moveCount > firstHalfMetrics.moves ? 
                  (Date.now() - startTime - firstHalfMetrics.time) / (moveCount - firstHalfMetrics.moves) : 0,
                accuracy: moveCount > firstHalfMetrics.moves ? 
                  1 - ((wallCollisions - firstHalfMetrics.collisions) / (moveCount - firstHalfMetrics.moves)) : 0,
              },
            },
            pathDeviation: pathDeviation,
            optimalPath,
            actualPath: [...actualPath, { x: MAZE_SIZE - 2, y: MAZE_SIZE - 2 }],
          })} className="w-full py-6 text-lg bg-[#6D28D9] hover:bg-[#5B21B6]">
            Next Game
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  );
}
