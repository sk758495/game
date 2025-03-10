"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Trophy, ArrowRight } from "lucide-react";

// Define the color palette with proper typing
const COLORS = {
  red: "#E53E3E",
  blue: "#1E3A8A",
  green: "#10B981",
  yellow: "#F59E0B",
  orange: "#FB923C",
} as const;

// Color names for the game
const COLOR_NAMES = Object.keys(COLORS) as Array<keyof typeof COLORS>;

type GameState = "instructions" | "ready" | "playing" | "complete";

interface StroopGameProps {
  onComplete: (score: number, metrics: StroopMetrics) => void;
}

// Cognitive metrics interface
interface StroopMetrics {
  totalTrials: number;
  correctResponses: number;
  incorrectResponses: number;
  streak: number;
  bestStreak: number;
  avgReactionTime: number;
  reactionTimes: number[];
  congruentTrials: {
    count: number;
    correct: number;
    avgReactionTime: number;
    reactionTimes: number[];
  };
  incongruentTrials: {
    count: number;
    correct: number;
    avgReactionTime: number;
    reactionTimes: number[];
  };
  interferenceEffect: number; // Difference in reaction time between incongruent and congruent trials
  errorRate: number;
  performanceOverTime: {
    firstHalf: {
      accuracy: number;
      avgReactionTime: number;
    };
    secondHalf: {
      accuracy: number;
      avgReactionTime: number;
    };
  };
}

// Trial data to track detailed metrics
interface TrialData {
  wordShown: keyof typeof COLORS;
  colorShown: keyof typeof COLORS;
  isCongruent: boolean;
  response: keyof typeof COLORS;
  isCorrect: boolean;
  reactionTime: number;
  timestamp: number;
}

// Session storage keys
const SESSION_KEYS = {
  GAME_STATE: "stroop_game_state",
  SCORE: "stroop_score",
  TIME_LEFT: "stroop_time_left",
  CURRENT_WORD: "stroop_current_word",
  CURRENT_COLOR: "stroop_current_color",
  STREAK: "stroop_streak",
  BEST_STREAK: "stroop_best_streak",
  TRIAL_DATA: "stroop_trial_data"
};

export default function StroopGame({ onComplete }: StroopGameProps) {
  const [gameState, setGameState] = useState<GameState>("instructions");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState<keyof typeof COLORS>("red");
  const [currentColor, setCurrentColor] = useState<keyof typeof COLORS>("red");
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  
  // Store detailed trial data for metrics
  const [trialData, setTrialData] = useState<TrialData[]>([]);
  const [totalTrials, setTotalTrials] = useState(0);

  // Load saved state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedGameState = sessionStorage.getItem(SESSION_KEYS.GAME_STATE);
        const savedScore = sessionStorage.getItem(SESSION_KEYS.SCORE);
        const savedTimeLeft = sessionStorage.getItem(SESSION_KEYS.TIME_LEFT);
        const savedCurrentWord = sessionStorage.getItem(SESSION_KEYS.CURRENT_WORD);
        const savedCurrentColor = sessionStorage.getItem(SESSION_KEYS.CURRENT_COLOR);
        const savedStreak = sessionStorage.getItem(SESSION_KEYS.STREAK);
        const savedBestStreak = sessionStorage.getItem(SESSION_KEYS.BEST_STREAK);
        const savedTrialData = sessionStorage.getItem(SESSION_KEYS.TRIAL_DATA);

        if (savedGameState) setGameState(savedGameState as GameState);
        if (savedScore) setScore(parseInt(savedScore));
        if (savedTimeLeft) setTimeLeft(parseInt(savedTimeLeft));
        if (savedCurrentWord) setCurrentWord(savedCurrentWord as keyof typeof COLORS);
        if (savedCurrentColor) setCurrentColor(savedCurrentColor as keyof typeof COLORS);
        if (savedStreak) setStreak(parseInt(savedStreak));
        if (savedBestStreak) setBestStreak(parseInt(savedBestStreak));
        if (savedTrialData) setTrialData(JSON.parse(savedTrialData));
      } catch (error) {
        console.error("Error loading Stroop game state:", error);
      }
    }
  }, []);

  // Save state changes to session storage
  useEffect(() => {
    if (typeof window !== "undefined" && gameState !== "complete") {
      sessionStorage.setItem(SESSION_KEYS.GAME_STATE, gameState);
      sessionStorage.setItem(SESSION_KEYS.SCORE, score.toString());
      sessionStorage.setItem(SESSION_KEYS.TIME_LEFT, timeLeft.toString());
      sessionStorage.setItem(SESSION_KEYS.CURRENT_WORD, currentWord.toString());
      sessionStorage.setItem(SESSION_KEYS.CURRENT_COLOR, currentColor.toString());
      sessionStorage.setItem(SESSION_KEYS.STREAK, streak.toString());
      sessionStorage.setItem(SESSION_KEYS.BEST_STREAK, bestStreak.toString());
      sessionStorage.setItem(SESSION_KEYS.TRIAL_DATA, JSON.stringify(trialData));
    }
  }, [gameState, score, timeLeft, currentWord, currentColor, streak, bestStreak, trialData]);

  // Clear session storage only when game is complete
  useEffect(() => {
    if (gameState === "complete" && typeof window !== "undefined") {
      // Calculate final metrics before clearing
      const metrics = calculateMetrics();
      
      // Call onComplete with final score and metrics
      onComplete(score, metrics);

      // Clear session storage
      Object.values(SESSION_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
    }
  }, [gameState, score, trialData]);

  const generateChallenge = useCallback(() => {
    const randomWordIndex = Math.floor(Math.random() * COLOR_NAMES.length);
    const randomColorIndex = Math.floor(Math.random() * COLOR_NAMES.length);
    const shouldBeDifferent = Math.random() < 0.7;
    const finalColorIndex = shouldBeDifferent && randomWordIndex === randomColorIndex
        ? (randomColorIndex + 1) % COLOR_NAMES.length
      : randomColorIndex;

    const wordToShow = COLOR_NAMES[randomWordIndex];
    const colorToShow = COLOR_NAMES[finalColorIndex];

    setCurrentWord(wordToShow);
    setCurrentColor(colorToShow);
    setStartTime(Date.now());
  }, []);

  // Start the game
  const startGame = () => {
    setGameState("playing");
    setScore(0);
    setTimeLeft(30);
    setStreak(0);
    setTrialData([]);
    setTotalTrials(0);
    generateChallenge();
    
    // Start timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameState("complete");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  };

  const handleColorSelect = (selectedColor: keyof typeof COLORS) => {
    if (!startTime) return;
    
    const reactionTime = Date.now() - startTime;
    const isCorrect = selectedColor === currentColor;
    const isCongruent = currentWord === currentColor;
    
    // Record this trial
    const trial: TrialData = {
      wordShown: currentWord,
      colorShown: currentColor,
      isCongruent,
      response: selectedColor,
      isCorrect,
      reactionTime,
      timestamp: Date.now(),
    };
    
    setTrialData(prev => [...prev, trial]);
    setTotalTrials(prev => prev + 1);

    // Update score and streak
    if (isCorrect) {
      setScore(score + 1);
      setStreak(streak + 1);
      if (streak + 1 > bestStreak) {
        setBestStreak(streak + 1);
      }
    } else {
      setStreak(0);
    }
    
    // Generate next challenge
    generateChallenge();
  };

  // Calculate all the cognitive metrics
  const calculateMetrics = (): StroopMetrics => {
    // Basic metrics
    const correctResponses = trialData.filter(trial => trial.isCorrect).length;
    const incorrectResponses = trialData.length - correctResponses;
    const allReactionTimes = trialData.map(trial => trial.reactionTime);
    const avgReactionTime = allReactionTimes.length > 0 
      ? allReactionTimes.reduce((sum, time) => sum + time, 0) / allReactionTimes.length 
      : 0;
    
    // Congruent trials
    const congruentTrials = trialData.filter(trial => trial.isCongruent);
    const congruentCorrect = congruentTrials.filter(trial => trial.isCorrect).length;
    const congruentReactionTimes = congruentTrials.map(trial => trial.reactionTime);
    const avgCongruentRT = congruentReactionTimes.length > 0
      ? congruentReactionTimes.reduce((sum, time) => sum + time, 0) / congruentReactionTimes.length
      : 0;
    
    // Incongruent trials
    const incongruentTrials = trialData.filter(trial => !trial.isCongruent);
    const incongruentCorrect = incongruentTrials.filter(trial => trial.isCorrect).length;
    const incongruentReactionTimes = incongruentTrials.map(trial => trial.reactionTime);
    const avgIncongruentRT = incongruentReactionTimes.length > 0
      ? incongruentReactionTimes.reduce((sum, time) => sum + time, 0) / incongruentReactionTimes.length
      : 0;
    
    // Interference effect
    const interferenceEffect = avgIncongruentRT - avgCongruentRT;
    
    // Error rate
    const errorRate = trialData.length > 0 ? incorrectResponses / trialData.length : 0;
    
    // Performance over time (first half vs second half)
    const halfwayIndex = Math.floor(trialData.length / 2);
    const firstHalf = trialData.slice(0, halfwayIndex);
    const secondHalf = trialData.slice(halfwayIndex);
    
    const firstHalfAccuracy = firstHalf.length > 0
      ? firstHalf.filter(trial => trial.isCorrect).length / firstHalf.length
      : 0;
    const secondHalfAccuracy = secondHalf.length > 0
      ? secondHalf.filter(trial => trial.isCorrect).length / secondHalf.length
      : 0;
    
    const firstHalfRT = firstHalf.length > 0
      ? firstHalf.reduce((sum, trial) => sum + trial.reactionTime, 0) / firstHalf.length
      : 0;
    const secondHalfRT = secondHalf.length > 0
      ? secondHalf.reduce((sum, trial) => sum + trial.reactionTime, 0) / secondHalf.length
      : 0;
    
    return {
      totalTrials: trialData.length,
      correctResponses,
      incorrectResponses,
      streak,
      bestStreak,
      avgReactionTime,
      reactionTimes: allReactionTimes,
      congruentTrials: {
        count: congruentTrials.length,
        correct: congruentCorrect,
        avgReactionTime: avgCongruentRT,
        reactionTimes: congruentReactionTimes,
      },
      incongruentTrials: {
        count: incongruentTrials.length,
        correct: incongruentCorrect,
        avgReactionTime: avgIncongruentRT,
        reactionTimes: incongruentReactionTimes,
      },
      interferenceEffect,
      errorRate,
      performanceOverTime: {
        firstHalf: {
          accuracy: firstHalfAccuracy,
          avgReactionTime: firstHalfRT,
        },
        secondHalf: {
          accuracy: secondHalfAccuracy,
          avgReactionTime: secondHalfRT,
        },
      },
    };
  };

  const handleNextGame = () => {
    if (typeof window !== "undefined") {
      Object.values(SESSION_KEYS).forEach((key) => {
        sessionStorage.removeItem(key);
      });
    }
    
    // Calculate final metrics and pass to onComplete callback
    const metrics = calculateMetrics();
    onComplete(score, metrics);
  };

  return (
    <Card className="w-full p-6 shadow-xl bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Stroop Challenge</h1>
        <p className="text-gray-600">Select the <strong>color</strong> of the text, not what it says!</p>
      </div>

      {gameState === "instructions" && (
        <div className="text-center space-y-6">
          <div className="bg-[#F3F4F6] p-4 rounded-lg">
            <p className="mb-4">
              The Stroop effect demonstrates how our brains process conflicting information. Your task is to identify
              the <strong>color</strong> of the text, ignoring what the word actually says.
            </p>
            <p>You have 30 seconds. How many can you get right?</p>
          </div>
          <Button onClick={startGame} className="w-full py-6 text-lg bg-[#1E3A8A] hover:bg-[#1E40AF]">
            Start Game
          </Button>
        </div>
      )}

      {gameState === "playing" && (
        <>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <Trophy className="w-5 h-5 mr-1 text-[#E53E3E]" />
              <span className="font-bold">{score}</span>
            </div>
            <div className="flex items-center">
              <Timer className="w-5 h-5 mr-1 text-[#1E3A8A]" />
              <span className="font-bold">{timeLeft}s</span>
            </div>
            <div className="flex items-center">
              <span className="text-sm">Streak: {streak}</span>
            </div>
          </div>

          <Progress value={(timeLeft / 30) * 100} className="mb-6" />

          <div className="flex justify-center items-center h-32 mb-8 bg-[#F3F4F6] rounded-lg">
            <span className="text-5xl font-bold" style={{ color: COLORS[currentColor] }}>
              {currentWord.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {COLOR_NAMES.map((color) => (
              <Button
                key={color}
                onClick={() => handleColorSelect(color)}
                className="py-6"
                style={{ backgroundColor: COLORS[color] }}
              >
                <span className="sr-only">{color}</span>
              </Button>
            ))}
          </div>
        </>
      )}

      {gameState === "complete" && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#1E3A8A]">Game Complete!</h2>

          <div className="bg-[#F3F4F6] p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-lg font-semibold">Your Score</p>
              <p className="text-4xl font-bold text-[#E53E3E]">{score}</p>
            </div>

            <div className="text-sm grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">Total Trials</p>
                <p className="text-xl font-bold text-[#10B981]">{totalTrials}</p>
              </div>
              <div>
              <p className="font-medium">Best Streak</p>
                <p className="text-xl font-bold text-[#10B981]">{bestStreak}</p>
              </div>
            </div>
          </div>

          <Button onClick={handleNextGame} className="w-full py-6 text-lg bg-[#1E3A8A] hover:bg-[#1E40AF]">
            Next Game
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </Card>
  );
}
