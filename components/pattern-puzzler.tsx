"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Timer, ArrowRight, Brain } from "lucide-react"

interface PatternPuzzlerProps {
  onComplete: (score: number) => void
}

// Colors for the tiles
const TILE_COLORS = ["#1E3A8A", "#6D28D9", "#14B8A6"]

// Session storage keys for Pattern Puzzler
const PATTERN_STORAGE_KEYS = {
  GAME_STATE: "pattern_game_state",
  PATTERN: "pattern_sequence",
  PLAYER_INPUT: "pattern_player_input",
  LEVEL: "pattern_level",
  TIME_LEFT: "pattern_time_left",
  SCORE: "pattern_score",
  HIGHEST_LEVEL: "pattern_highest_level",
  ACTIVE_TILE: "pattern_active_tile"
}

export default function PatternPuzzler({ onComplete }: PatternPuzzlerProps) {
  const [gameState, setGameState] = useState<"ready" | "playing" | "showing" | "input" | "gameOver">(() => {
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem(PATTERN_STORAGE_KEYS.GAME_STATE);
      return (savedState as "ready" | "playing" | "showing" | "input" | "gameOver") || "ready";
    }
    return "ready";
  });
  
  const [pattern, setPattern] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const savedPattern = sessionStorage.getItem(PATTERN_STORAGE_KEYS.PATTERN);
      return savedPattern ? JSON.parse(savedPattern) : [];
    }
    return [];
  });
  
  const [playerInput, setPlayerInput] = useState<number[]>(() => {
    if (typeof window !== 'undefined') {
      const savedInput = sessionStorage.getItem(PATTERN_STORAGE_KEYS.PLAYER_INPUT);
      return savedInput ? JSON.parse(savedInput) : [];
    }
    return [];
  });
  
  const [level, setLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedLevel = sessionStorage.getItem(PATTERN_STORAGE_KEYS.LEVEL);
      return savedLevel ? parseInt(savedLevel) : 1;
    }
    return 1;
  });
  
  const [timeLeft, setTimeLeft] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTime = sessionStorage.getItem(PATTERN_STORAGE_KEYS.TIME_LEFT);
      return savedTime ? parseInt(savedTime) : 60;
    }
    return 60;
  });
  
  const [score, setScore] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedScore = sessionStorage.getItem(PATTERN_STORAGE_KEYS.SCORE);
      return savedScore ? parseInt(savedScore) : 0;
    }
    return 0;
  });
  
  const [highestLevel, setHighestLevel] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedHighest = sessionStorage.getItem(PATTERN_STORAGE_KEYS.HIGHEST_LEVEL);
      return savedHighest ? parseInt(savedHighest) : 0;
    }
    return 0;
  });
  
  const [activeTile, setActiveTile] = useState<number | null>(() => {
    if (typeof window !== 'undefined') {
      const savedActiveTile = sessionStorage.getItem(PATTERN_STORAGE_KEYS.ACTIVE_TILE);
      return savedActiveTile ? parseInt(savedActiveTile) : null;
    }
    return null;
  });

  // Save game state to session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.GAME_STATE, gameState);
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.PATTERN, JSON.stringify(pattern));
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.PLAYER_INPUT, JSON.stringify(playerInput));
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.LEVEL, level.toString());
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.TIME_LEFT, timeLeft.toString());
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.SCORE, score.toString());
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.HIGHEST_LEVEL, highestLevel.toString());
      sessionStorage.setItem(PATTERN_STORAGE_KEYS.ACTIVE_TILE, activeTile?.toString() || "");
    }
  }, [gameState, pattern, playerInput, level, timeLeft, score, highestLevel, activeTile]);

  // Clear session storage
  const clearSessionStorage = () => {
    if (typeof window !== 'undefined') {
      Object.values(PATTERN_STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
    }
  };

  // Generate a new pattern
  const generatePattern = useCallback(() => {
    const newPattern = [...pattern]
    newPattern.push(Math.floor(Math.random() * 3))
    setPattern(newPattern)
  }, [pattern])

  // Start the game
  const startGame = () => {
    setGameState("playing")
    setPattern([])
    setPlayerInput([])
    setLevel(1)
    setTimeLeft(60)
    setScore(0)
    clearSessionStorage(); // Clear previous session data
    setTimeout(() => {
      generatePattern()
      setGameState("showing")
    }, 1000)
  }

  // Show the pattern to the player
  useEffect(() => {
    if (gameState === "showing" && pattern.length > 0) {
      let currentIndex = 0

      const intervalId = setInterval(() => {
        if (currentIndex < pattern.length) {
          setActiveTile(pattern[currentIndex])
          setTimeout(() => setActiveTile(null), 500)
          currentIndex++
        } else {
          clearInterval(intervalId)
          setGameState("input")
        }
      }, 800)

      return () => clearInterval(intervalId)
    }
  }, [gameState, pattern])

  // Handle tile click
  const handleTileClick = (tileIndex: number) => {
    if (gameState !== "input") return

    const newInput = [...playerInput, tileIndex]
    setPlayerInput(newInput)

    // Highlight the clicked tile briefly
    setActiveTile(tileIndex)
    setTimeout(() => setActiveTile(null), 300)

    // Check if the input matches the pattern so far
    const currentIndex = playerInput.length
    if (tileIndex !== pattern[currentIndex]) {
      // Wrong input
      setGameState("gameOver")
      if (level > highestLevel) {
        setHighestLevel(level)
      }
      return
    }

    // Check if the player has completed the pattern
    if (newInput.length === pattern.length) {
      // Pattern completed successfully
      setPlayerInput([])
      setLevel(level + 1)
      setScore(score + level * 10)

      // Move to next level
      setTimeout(() => {
        generatePattern()
        setGameState("showing")
      }, 1000)
    }
  }

  // Timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout

    if (gameState === "playing" || gameState === "showing" || gameState === "input") {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer)
            setGameState("gameOver")
            if (level > highestLevel) {
              setHighestLevel(level)
            }
            return 0
          }
          return prevTime - 1
        })
      }, 1000)
    }

    return () => clearInterval(timer)
  }, [gameState, level, highestLevel])

  // Move to next game (complete the series)
  const handleComplete = () => {
    clearSessionStorage(); // Clear session data when game is complete
    onComplete(score)
  }

  return (
    <Card className="w-full p-6 shadow-xl bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Pattern Puzzler</h1>
        <p className="text-gray-600">Game 3 of 3: Memorize and repeat the pattern</p>
      </div>

      {gameState === "ready" && (
        <div className="text-center space-y-6">
          <div className="bg-[#F3F4F6] p-4 rounded-lg">
            <p className="mb-4">Watch the pattern of colored tiles, then repeat it in the same order.</p>
            <p className="mb-4">Each level adds one more step to the pattern. How many levels can you complete?</p>
            <p>You have 60 seconds. Test your memory!</p>
          </div>
          <Button onClick={startGame} className="w-full py-6 text-lg bg-[#6D28D9] hover:bg-[#5B21B6]">
            Start Game
          </Button>
        </div>
      )}

      {(gameState === "playing" || gameState === "showing" || gameState === "input") && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Brain className="w-5 h-5 mr-1 text-[#6D28D9]" />
              <span className="font-bold">Level: {level}</span>
            </div>
            <div className="flex items-center">
              <Timer className="w-5 h-5 mr-1 text-[#1E3A8A]" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold">Score: {score}</span>
            </div>
          </div>

          <Progress value={(timeLeft / 60) * 100} className="mb-6" />

          <div className="text-center mb-4">
            <p className="text-lg font-medium">
              {gameState === "showing"
                ? "Watch the pattern..."
                : gameState === "input"
                  ? "Repeat the pattern!"
                  : "Get ready..."}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {[0, 1, 2].map((tileIndex) => (
              <button
                key={tileIndex}
                className={`h-24 rounded-lg transition-all duration-200 ${
                  activeTile === tileIndex ? "scale-105 brightness-125" : ""
                }`}
                style={{
                  backgroundColor: TILE_COLORS[tileIndex],
                  opacity: gameState === "input" ? 1 : 0.7,
                }}
                onClick={() => handleTileClick(tileIndex)}
                disabled={gameState !== "input"}
              >
                <span className="sr-only">Tile {tileIndex + 1}</span>
              </button>
            ))}
          </div>

          <div className="flex justify-center space-x-2">
            {pattern.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${index < playerInput.length ? "bg-[#14B8A6]" : "bg-gray-300"}`}
              />
            ))}
          </div>
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
                <p className="font-medium">Highest Level</p>
                <p className="text-xl font-bold text-[#14B8A6]">{level - 1}</p>
              </div>
              <div>
                <p className="font-medium">Pattern Length</p>
                <p className="text-xl font-bold text-[#14B8A6]">{pattern.length}</p>
              </div>
            </div>
          </div>

          <Button
            onClick={handleComplete}
            className="w-full py-6 text-lg bg-[#6D28D9] hover:bg-[#5B21B6] flex items-center justify-center"
          >
            Complete Challenge Series
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  )
}

