"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Heart, Star, Sun, Moon, Cloud, Flower2, LucideIcon, ArrowRight } from 'lucide-react'

interface MemoryGameProps {
  onComplete: (score: number, metrics: MemoryMetrics) => void
}

interface MemoryMetrics {
  totalTime: number;
  memorizeTime: number;
  totalMoves: number;
  correctMatches: number;
  incorrectAttempts: number;
  matchAccuracy: number;
  averageTimePerMove: number;
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
  matchSequence: Array<{
    moveNumber: number;
    timeStamp: number;
    isCorrect: boolean;
    timeTaken: number;
  }>;
  memorizeEffectiveness: number; // Ratio of first-attempt correct matches
  pairMatchTimes: number[]; // Time taken to find each pair
}

type MemoryCard = {
  id: number
  icon: LucideIcon
  isMatched: boolean
  isFlipped: boolean
  color: string
}

// Session storage keys for Memory Game
const MEMORY_STORAGE_KEYS = {
  CARDS: "memory_cards",
  MATCHES: "memory_matches",
  IS_CHECKING: "memory_is_checking",
  GAME_STATE: "memory_game_state",
  MEMORIZE_TIME: "memory_memorize_time"
}

type GameState = "ready" | "memorizing" | "playing" | "complete"

// Define card icons and colors
const CARD_CONFIGS = [
  { icon: Heart, color: "text-rose-500" },
  { icon: Star, color: "text-amber-500" },
  { icon: Sun, color: "text-yellow-500" },
  { icon: Moon, color: "text-purple-500" },
  { icon: Cloud, color: "text-sky-500" },
  { icon: Flower2, color: "text-emerald-500" }
];

// Creates a new shuffled deck of cards
const createCards = () => {
  const cards: MemoryCard[] = []

  CARD_CONFIGS.forEach(({ icon, color }, index) => {
    // Create a pair of cards for each icon
    cards.push(
      { id: index * 2, icon, color, isMatched: false, isFlipped: false },
      { id: index * 2 + 1, icon, color, isMatched: false, isFlipped: false }
    )
  })

  // Shuffle the cards
  return cards.sort(() => Math.random() - 0.5)
}

// CSS styles for the memory game
const MEMORY_GAME_STYLES = `
  .memory-card {
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;
    transform-style: preserve-3d;
    transition: transform 0.5s;
  }
  
  .memory-card.flipped {
    transform: rotateY(180deg);
  }
  
  .card-face {
    position: absolute;
    width: 100%;
    height: 100%;
    backface-visibility: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
  }
  
  .card-face.back {
    transform: rotateY(180deg);
  }
  
  @media (prefers-reduced-motion) {
    .memory-card {
      transition: none;
    }
    .memory-card.flipped .card-face.front {
      opacity: 0;
    }
    .memory-card.flipped .card-face.back {
      opacity: 1;
    }
    .card-face.back {
      opacity: 0;
      transform: none;
    }
  }
`;

export default function MemoryGame({ onComplete }: MemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>("ready");
  const [cards, setCards] = useState<MemoryCard[]>(createCards());
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [memorizeTimeLeft, setMemorizeTimeLeft] = useState(10);
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [moveStartTime, setMoveStartTime] = useState<number>(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [incorrectAttempts, setIncorrectAttempts] = useState(0);
  const [matchSequence, setMatchSequence] = useState<MemoryMetrics['matchSequence']>([]);
  const [pairMatchTimes, setPairMatchTimes] = useState<number[]>([]);
  const [firstHalfStats, setFirstHalfStats] = useState({
    moves: 0,
    correct: 0,
    time: 0
  });
  
  // Add CSS styles
  useEffect(() => {
    const styleId = 'memory-game-styles';
    if (typeof document !== 'undefined' && !document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      styleEl.textContent = MEMORY_GAME_STYLES;
      document.head.appendChild(styleEl);
      
      return () => {
        const element = document.getElementById(styleId);
        if (element) document.head.removeChild(element);
      };
    }
  }, []);
  
  // Load game state from session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedGameState = sessionStorage.getItem(MEMORY_STORAGE_KEYS.GAME_STATE);
        const savedMatches = sessionStorage.getItem(MEMORY_STORAGE_KEYS.MATCHES);
        const savedCards = sessionStorage.getItem(MEMORY_STORAGE_KEYS.CARDS);
        const savedMemorizeTime = sessionStorage.getItem(MEMORY_STORAGE_KEYS.MEMORIZE_TIME);
        
        if (savedGameState) {
          setGameState(savedGameState as GameState);
        }
        
        if (savedMatches) {
          setMatches(parseInt(savedMatches));
        }
        
        if (savedCards) {
          const parsedCards = JSON.parse(savedCards);
          const restoredCards = parsedCards.map((card: any) => {
            const iconConfig = CARD_CONFIGS.find((_, i) => Math.floor(card.id / 2) === i);
            return {
              ...card,
              icon: iconConfig?.icon || Heart
            };
          });
          setCards(restoredCards);
        }

        if (savedMemorizeTime) {
          setMemorizeTimeLeft(parseInt(savedMemorizeTime));
        }
      } catch (error) {
        console.error("Error loading Memory Game from session storage:", error);
      }
    }
  }, []);
  
  // Save game state to session storage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem(MEMORY_STORAGE_KEYS.GAME_STATE, gameState);
        sessionStorage.setItem(MEMORY_STORAGE_KEYS.MATCHES, matches.toString());
        sessionStorage.setItem(MEMORY_STORAGE_KEYS.MEMORIZE_TIME, memorizeTimeLeft.toString());
        
        const serializableCards = cards.map(card => ({
          ...card,
          icon: undefined,
          iconIndex: Math.floor(card.id / 2)
        }));
        sessionStorage.setItem(MEMORY_STORAGE_KEYS.CARDS, JSON.stringify(serializableCards));
        sessionStorage.setItem(MEMORY_STORAGE_KEYS.IS_CHECKING, isChecking.toString());
      } catch (error) {
        console.error("Error saving Memory Game to session storage:", error);
      }
    }
  }, [gameState, matches, cards, isChecking, memorizeTimeLeft]);

  // Memorization phase timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameState === "memorizing" && memorizeTimeLeft > 0) {
      timer = setInterval(() => {
        setMemorizeTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("playing");
            // Flip all cards face down when memorization phase ends
            setCards(cards.map(card => ({ ...card, isFlipped: false })));
            return 10; // Reset for next game
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [gameState, memorizeTimeLeft, cards]);

  // Clear session storage
  const clearSessionStorage = useCallback(() => {
    if (typeof window !== 'undefined') {
      Object.values(MEMORY_STORAGE_KEYS).forEach(key => {
        sessionStorage.removeItem(key);
      });
    }
  }, []);

  const handleCardClick = (clickedIndex: number) => {
    if (isChecking || cards[clickedIndex].isMatched || cards[clickedIndex].isFlipped || gameState !== "playing") {
      return;
    }

    const currentTime = Date.now();
    if (!moveStartTime) {
      setMoveStartTime(currentTime);
    }
    
    const newCards = [...cards];
    newCards[clickedIndex] = {
      ...newCards[clickedIndex],
      isFlipped: true
    };
    setCards(newCards);
    
    const flippedCards = newCards.filter(card => card.isFlipped && !card.isMatched);
    
    if (flippedCards.length === 2) {
      setIsChecking(true);
      setTotalMoves(prev => prev + 1);
      
      const [firstCard, secondCard] = flippedCards;
      const isMatch = Math.floor(firstCard.id / 2) === Math.floor(secondCard.id / 2);
      const moveTime = currentTime - moveStartTime;
      
      // Record move in sequence
      setMatchSequence(prev => [...prev, {
        moveNumber: totalMoves + 1,
        timeStamp: currentTime,
        isCorrect: isMatch,
        timeTaken: moveTime
      }]);

      // Update first half stats if we're in first half of the game
      if (matches < CARD_CONFIGS.length / 2) {
        setFirstHalfStats(prev => ({
          moves: prev.moves + 1,
          correct: prev.correct + (isMatch ? 1 : 0),
          time: prev.time + moveTime
        }));
      }
      
        setTimeout(() => {
        let updatedCards;
        if (isMatch) {
          updatedCards = newCards.map(card => 
            card.isFlipped && !card.isMatched 
              ? { ...card, isMatched: true }
              : card
          );
          setMatches(matches + 1);
          setPairMatchTimes(prev => [...prev, moveTime]);
          
          if (matches + 1 === CARD_CONFIGS.length) {
            const gameEndTime = Date.now();
            const totalGameTime = gameEndTime - gameStartTime;
            const memorizeTime = 10000; // 10 seconds in milliseconds
            const playTime = totalGameTime - memorizeTime;
            
            // Calculate final metrics
            const metrics: MemoryMetrics = {
              totalTime: totalGameTime,
              memorizeTime,
              totalMoves: totalMoves + 1,
              correctMatches: matches + 1,
              incorrectAttempts,
              matchAccuracy: (matches + 1) / (totalMoves + 1),
              averageTimePerMove: playTime / (totalMoves + 1),
              performanceOverTime: {
                firstHalf: {
                  accuracy: firstHalfStats.correct / Math.max(firstHalfStats.moves, 1),
                  speed: firstHalfStats.time / Math.max(firstHalfStats.moves, 1)
                },
                secondHalf: {
                  accuracy: (matches + 1 - firstHalfStats.correct) / 
                    Math.max(totalMoves + 1 - firstHalfStats.moves, 1),
                  speed: (playTime - firstHalfStats.time) / 
                    Math.max(totalMoves + 1 - firstHalfStats.moves, 1)
                }
              },
              matchSequence,
              memorizeEffectiveness: matchSequence.filter(
                (move, index) => index % 2 === 0 && move.isCorrect
              ).length / CARD_CONFIGS.length,
              pairMatchTimes
            };

            setGameState("complete");
            // Calculate score based on metrics
            const accuracyBonus = Math.floor(metrics.matchAccuracy * 500);
            const timeBonus = Math.max(0, Math.floor((120000 - totalGameTime) / 1000) * 5);
            const memoryBonus = Math.floor(metrics.memorizeEffectiveness * 300);
            const finalScore = Math.max(100, accuracyBonus + timeBonus + memoryBonus);
            
            setTimeout(() => onComplete(finalScore, metrics), 500);
          }
      } else {
          updatedCards = newCards.map(card => 
            card.isFlipped && !card.isMatched
              ? { ...card, isFlipped: false }
              : card
          );
          setIncorrectAttempts(prev => prev + 1);
        }
        
        setCards(updatedCards);
        setIsChecking(false);
        setMoveStartTime(0);
      }, 800);
    }
  };

  const startGame = useCallback(() => {
    const newCards = createCards();
    const startTime = Date.now();
    setGameStartTime(startTime);
    setGameState("memorizing");
    setCards(newCards.map(card => ({ ...card, isFlipped: true })));
    setMatches(0);
    setIsChecking(false);
    setMemorizeTimeLeft(10);
    setTotalMoves(0);
    setIncorrectAttempts(0);
    setMatchSequence([]);
    setPairMatchTimes([]);
    setFirstHalfStats({
      moves: 0,
      correct: 0,
      time: 0
    });
    clearSessionStorage();
  }, [clearSessionStorage]);

  const handleComplete = () => {
    // Calculate score based on matches
    const score = matches * 100;
    clearSessionStorage();
    onComplete(score, {
      totalTime: 0,
      memorizeTime: 0,
      totalMoves: 0,
      correctMatches: 0,
      incorrectAttempts: 0,
      matchAccuracy: 0,
      averageTimePerMove: 0,
      performanceOverTime: {
        firstHalf: {
          accuracy: 0,
          speed: 0
        },
        secondHalf: {
          accuracy: 0,
          speed: 0
        }
      },
      matchSequence: [],
      memorizeEffectiveness: 0,
      pairMatchTimes: []
    });
  };

  return (
    <Card className="w-full p-6 shadow-xl bg-white">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-[#1E3A8A] mb-2">Memory Match</h1>
        <p className="text-gray-600">
          Game 5 of 6: Find all matching pairs of cards!
        </p>
      </div>

      {gameState === "ready" && (
        <div className="text-center space-y-6">
          <div className="bg-[#F3F4F6] p-4 rounded-lg">
            <p className="mb-4">
              You'll have 10 seconds to memorize all cards before they flip face down. Then find all matching pairs!
            </p>
          </div>
          <Button onClick={startGame} className="w-full py-6 text-lg bg-[#1E3A8A] hover:bg-[#1E40AF]">
            Start Game
          </Button>
        </div>
      )}

      {(gameState === "memorizing" || gameState === "playing") && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <p className="font-medium">Matches: {matches}/{CARD_CONFIGS.length}</p>
            {gameState === "memorizing" && (
              <p className="text-lg font-bold text-[#6D28D9]">Memorize: {memorizeTimeLeft}s</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3 md:gap-4">
        {cards.map((card, index) => (
              <div key={card.id} className="aspect-square h-24 md:h-28" onClick={() => handleCardClick(index)}>
                <div className={`memory-card ${card.isFlipped || card.isMatched ? 'flipped' : ''}`}>
                  <div className="card-face front bg-[#F3F4F6] border border-[#E5E7EB] hover:border-[#1E3A8A] hover:bg-[#EDF2F7] rounded-md">
                    <div className="text-[#CBD5E1] text-2xl">?</div>
                  </div>
                  <div className={`card-face back ${card.isMatched ? 'bg-indigo-900/50 border-indigo-400/50' : 'bg-indigo-800/50 border-indigo-500/50'} rounded-md`}>
                    <card.icon
                      className={`w-10 h-10 ${card.color} ${card.isMatched ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}`}
                    />
                  </div>
                </div>
              </div>
        ))}
      </div>
        </div>
      )}

      {gameState === "complete" && (
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-bold text-[#1E3A8A]">Game Complete!</h2>

          <div className="bg-[#F3F4F6] p-6 rounded-lg">
            <div className="mb-4">
              <p className="text-lg font-semibold">Your Score</p>
              <p className="text-4xl font-bold text-[#E53E3E]">{matches * 100}</p>
            </div>
            
            <div className="text-sm">
              <p className="font-medium">Matches Found</p>
              <p className="text-xl font-bold text-[#10B981]">{matches}/{CARD_CONFIGS.length}</p>
            </div>
      </div>

      <Button 
            onClick={handleComplete}
            className="w-full py-6 text-lg bg-[#1E3A8A] hover:bg-[#1E40AF] flex items-center justify-center"
          >
            Next Game: Word Puzzle
            <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
      )}
    </Card>
  )
}

