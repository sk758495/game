"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowRight, Timer } from "lucide-react"

interface WordPuzzleProps {
  onComplete: (score: number, metrics: WordPuzzleMetrics) => void
}

interface WordPuzzleMetrics {
  totalTime: number;
  wordsAttempted: number;
  wordsCompleted: number;
  incorrectAttempts: number;
  accuracy: number;
  averageTimePerWord: number;
  wordAttempts: Array<{
    word: string;
    attempts: number;
    timeTaken: number;
    isCorrect: boolean;
  }>;
  performanceOverTime: {
    firstHalf: {
      accuracy: number;
      speed: number;
    };
    secondHalf: {
      accuracy: number;
      speed: number;
    };
  };
  longestStreak: number;
  currentStreak: number;
}

const WORDS = [
  "CRICKET",
  "CHAI",
  "SCHOOL",
  "MARKET",
  "TEMPLE",
  "GARDEN",
  "FAMILY",
  "FRIEND",
  "WATER",
  "LUNCH",
  "DINNER",
  "STREET",
  "HOUSE",
  "PHONE",
  "MOVIE",
  "MUSIC",
  "DANCE",
  "BOOK",
  "SHOP",
  "TRAIN",
  "AUTO",
  "PARK",
  "FOOD",
  "SWEET",
  "SPICE",
  "MANGO",
  "RICE",
  "MILK",
  "ROAD",
  "CITY",
  "BEACH",
  "RAIN",
  "SUMMER",
  "WINTER",
  "MORNING"
]

// Session storage keys for word puzzle game
const WORD_PUZZLE_KEYS = {
  CURRENT_WORD: "word_puzzle_current_word",
  SHUFFLED_WORD: "word_puzzle_shuffled_word",
  USER_INPUT: "word_puzzle_user_input",
  SCORE: "word_puzzle_score",
  TIME_LEFT: "word_puzzle_time_left",
  GAME_STATE: "word_puzzle_game_state"
}

const shuffleWord = (word: string) => {
  return word
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

export default function WordPuzzle({ onComplete }: WordPuzzleProps) {
  const [currentWord, setCurrentWord] = useState("")
  const [shuffledWord, setShuffledWord] = useState("")
  const [userInput, setUserInput] = useState("")
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60)
  const [gameState, setGameState] = useState<"ready" | "playing" | "complete">("ready")
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [wordStartTime, setWordStartTime] = useState<number>(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [incorrectAttempts, setIncorrectAttempts] = useState(0)
  const [wordAttempts, setWordAttempts] = useState<WordPuzzleMetrics['wordAttempts']>([])
  const [currentStreak, setCurrentStreak] = useState(0)
  const [longestStreak, setLongestStreak] = useState(0)
  const [firstHalfStats, setFirstHalfStats] = useState({
    attempts: 0,
    correct: 0,
    time: 0
  })

  // Load saved state from session storage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedCurrentWord = sessionStorage.getItem(WORD_PUZZLE_KEYS.CURRENT_WORD)
        const savedShuffledWord = sessionStorage.getItem(WORD_PUZZLE_KEYS.SHUFFLED_WORD)
        const savedUserInput = sessionStorage.getItem(WORD_PUZZLE_KEYS.USER_INPUT)
        const savedScore = sessionStorage.getItem(WORD_PUZZLE_KEYS.SCORE)
        const savedTimeLeft = sessionStorage.getItem(WORD_PUZZLE_KEYS.TIME_LEFT)
        const savedGameState = sessionStorage.getItem(WORD_PUZZLE_KEYS.GAME_STATE) as "ready" | "playing" | "complete" | null

        if (savedCurrentWord) setCurrentWord(savedCurrentWord)
        if (savedShuffledWord) setShuffledWord(savedShuffledWord)
        if (savedUserInput) setUserInput(savedUserInput)
        if (savedScore) setScore(parseInt(savedScore))
        if (savedTimeLeft) setTimeLeft(parseInt(savedTimeLeft))
        if (savedGameState) setGameState(savedGameState)

        // If we have a saved game but no current word, generate a new one
        if (savedGameState === "playing" && !savedCurrentWord) {
          nextWord()
        }
      } catch (error) {
        console.error("Error loading Word Puzzle game from session storage:", error)
        // Continue with default state if there's an error
      }
    }
  }, [])

  // Update session storage when state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(WORD_PUZZLE_KEYS.CURRENT_WORD, currentWord)
      sessionStorage.setItem(WORD_PUZZLE_KEYS.SHUFFLED_WORD, shuffledWord)
      sessionStorage.setItem(WORD_PUZZLE_KEYS.USER_INPUT, userInput)
      sessionStorage.setItem(WORD_PUZZLE_KEYS.SCORE, score.toString())
      sessionStorage.setItem(WORD_PUZZLE_KEYS.TIME_LEFT, timeLeft.toString())
      sessionStorage.setItem(WORD_PUZZLE_KEYS.GAME_STATE, gameState)
    }
  }, [currentWord, shuffledWord, userInput, score, timeLeft, gameState])

  // Timer effect
  useEffect(() => {
    if (gameState === "playing") {
      const timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setGameState("complete")
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [gameState])

  const startGame = () => {
    const startTime = Date.now()
    setGameStartTime(startTime)
    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
    setTotalAttempts(0)
    setIncorrectAttempts(0)
    setWordAttempts([])
    setCurrentStreak(0)
    setLongestStreak(0)
    setFirstHalfStats({
      attempts: 0,
      correct: 0,
      time: 0
    })
    nextWord()
    clearSessionStorage()
  }

  const resetGame = () => {
    setGameState("ready")
    setScore(0)
    setTimeLeft(60)
    nextWord()
    
    // Clear session storage
    clearSessionStorage()
  }

  const clearSessionStorage = () => {
    if (typeof window !== 'undefined') {
      Object.values(WORD_PUZZLE_KEYS).forEach(key => {
        sessionStorage.removeItem(key)
      })
    }
  }

  const nextWord = useCallback(() => {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)]
    setCurrentWord(word)
    setShuffledWord(shuffleWord(word))
    setUserInput("")
    setWordStartTime(Date.now())
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const currentTime = Date.now()
    const timeTaken = currentTime - (wordStartTime || currentTime)
    setTotalAttempts(prev => prev + 1)

    const isCorrect = userInput.toUpperCase() === currentWord
    
    // Update streaks
    if (isCorrect) {
      const newStreak = currentStreak + 1
      setCurrentStreak(newStreak)
      setLongestStreak(prev => Math.max(prev, newStreak))
    } else {
      setCurrentStreak(0)
      setIncorrectAttempts(prev => prev + 1)
    }

    // Record attempt
    setWordAttempts(prev => [...prev, {
      word: currentWord,
      attempts: isCorrect ? 1 : 0,
      timeTaken,
      isCorrect
    }])

    // Update first half stats if in first half of game time
    if (timeLeft > 30) {
      setFirstHalfStats(prev => ({
        attempts: prev.attempts + 1,
        correct: prev.correct + (isCorrect ? 1 : 0),
        time: prev.time + timeTaken
      }))
    }

    if (isCorrect) {
      setScore(score + 1)
      nextWord()
    } else {
      alert("Incorrect! Try again.")
    }
  }

  const handleComplete = () => {
    const gameEndTime = Date.now()
    const totalGameTime = gameEndTime - gameStartTime
    const playTime = Math.min(totalGameTime, 60000) // Cap at 60 seconds

    // Calculate final metrics
    const metrics: WordPuzzleMetrics = {
      totalTime: totalGameTime,
      wordsAttempted: totalAttempts,
      wordsCompleted: score,
      incorrectAttempts,
      accuracy: score / Math.max(totalAttempts, 1),
      averageTimePerWord: playTime / Math.max(score, 1),
      wordAttempts,
      performanceOverTime: {
        firstHalf: {
          accuracy: firstHalfStats.correct / Math.max(firstHalfStats.attempts, 1),
          speed: firstHalfStats.time / Math.max(firstHalfStats.attempts, 1)
        },
        secondHalf: {
          accuracy: (score - firstHalfStats.correct) / 
            Math.max(totalAttempts - firstHalfStats.attempts, 1),
          speed: (playTime - firstHalfStats.time) / 
            Math.max(totalAttempts - firstHalfStats.attempts, 1)
        }
      },
      longestStreak,
      currentStreak
    }

    clearSessionStorage()
    onComplete(score * 100, metrics)
  }

  return (
    <Card className="w-full p-6 shadow-xl bg-white">
      <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2 text-center">Word Puzzle</h1>
      <p className="text-gray-600 text-center mb-4">Game 6 of 6: Unscramble the words</p>

      {gameState === "ready" && (
        <div className="text-center space-y-4">
          <p>Unscramble as many words as you can before time runs out!</p>
          <Button onClick={startGame} className="w-full bg-[#6D28D9] hover:bg-[#5B21B6]">
            Start Game
          </Button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold">Score: {score}</span>
            <div className="flex items-center">
              <Timer className="w-5 h-5 mr-1 text-[#1E3A8A]" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
          </div>

          <div className="text-center mb-4">
            <p className="text-2xl font-bold text-[#6D28D9]">{shuffledWord}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Enter your guess"
              className="text-center"
            />
            <Button type="submit" className="w-full bg-[#14B8A6] hover:bg-[#0D9488]">
              Submit
            </Button>
          </form>
        </>
      )}

      {gameState === "complete" && (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-[#1E3A8A]">Game Complete!</h2>
          <p className="text-xl font-bold">Words Unscrambled: {score}</p>
          <p className="text-xl font-bold">Score: {score * 100}</p>
          <Button onClick={handleComplete} className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF]">
            Complete Challenge Series
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  )
}

