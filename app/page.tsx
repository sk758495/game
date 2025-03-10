"use client"

import { useState, useEffect } from "react"
import UserForm from "@/components/user-form"
import GameSeries from "@/components/game-series"
import { Button } from "@/components/ui/button"
import { Brain, Trophy, Clock, Sparkles, Mail, Phone, MapPin, Users, GraduationCap, Target } from "lucide-react"
import { Input } from '@/components/ui/input'
import { Textarea } from "@/components/ui/textarea"
import Link from 'next/link'

// Add session storage keys
const LANDING_PAGE_KEYS = {
  SHOW_FORM: "landing_show_form",
  SHOW_GAME: "landing_show_game"
};

export default function LandingPage() {
  const [showForm, setShowForm] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Clear session storage and handle initial mount
  useEffect(() => {
    // Clear any existing session storage on fresh page load
    window.sessionStorage.clear();
    setMounted(true);
  }, []);

  // Save states to session storage
  useEffect(() => {
    if (mounted) {
      window.sessionStorage.setItem(LANDING_PAGE_KEYS.SHOW_FORM, showForm.toString());
      window.sessionStorage.setItem(LANDING_PAGE_KEYS.SHOW_GAME, showGame.toString());
    }
  }, [showForm, showGame, mounted]);

  // Handle game start
  const handleStartGame = () => {
    setShowForm(true);
    setShowGame(false);
  };

  // Handle form submission
  const handleFormSubmit = (userData: any) => {
    setShowForm(false);
    setShowGame(true);
  };

  // Initial loading state
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B1437] flex items-center justify-center">
        <div className="text-white text-center">
          <Brain className="w-12 h-12 text-[#14B8A6] mx-auto mb-4 animate-pulse" />
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1437] overflow-hidden">
      {/* Simple background with gradient */}
      <div className="fixed inset-0">
        <div className="absolute inset-0 bg-[#0B1437]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0B1437]/50 to-[#0B1437]/80" />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-100/80 backdrop-blur-sm border-b border-gray-200/20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-6 h-6 text-[#14B8A6]" />
              <span className="text-gray-800 font-bold">IQ Level</span>
            </div>
            <div className="flex items-center space-x-6">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#games" className="text-gray-600 hover:text-gray-900 transition-colors">Games</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 transition-colors">About</a>
              <Button 
                variant="outline" 
                className="bg-gray-200/80 border-gray-300 text-gray-700 hover:bg-gray-300/80"
                onClick={handleStartGame}
              >
                Play Now
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {showForm ? (
        <div className="container mx-auto px-4 pt-24 relative z-10">
          <UserForm onSubmit={handleFormSubmit} />
        </div>
      ) : showGame ? (
        <div className="container mx-auto px-4 pt-24 relative z-10">
      <GameSeries />
        </div>
      ) : (
        <div className="w-full">
          {/* Hero Section */}
          <div className="relative w-full flex flex-col pt-16">
            {/* Content layer */}
            <div className="container mx-auto px-8 py-4 z-10 relative">
              <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-3 leading-tight tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
                  IQ Level Challenge Series
                </h1>
                <p className="text-lg md:text-xl text-[#F3F4F6] mb-4 leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
                  Test and enhance your IQ through engaging games that measure memory, attention, and problem-solving abilities
                </p>
                
                {/* Start Game Button */}
                <div className="flex justify-center">
                  <Button 
                    className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-6 text-lg"
                    onClick={handleStartGame}
                  >
                    Start Game
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="container mx-auto px-4 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <FeatureCard 
                icon={Brain}
                title="Cognitive Enhancement"
                description="Improve memory, attention, and problem-solving skills"
              />
              <FeatureCard 
                icon={Trophy}
                title="Track Progress"
                description="Monitor your performance with detailed metrics"
              />
              <FeatureCard 
                icon={Clock}
                title="Quick Sessions"
                description="Complete engaging challenges in minutes"
              />
              <FeatureCard 
                icon={Sparkles}
                title="Scientific Approach"
                description="Based on established cognitive testing methods"
              />
            </div>

            {/* Games Preview */}
            <div className="bg-[#1E3A8A]/30 backdrop-blur-md rounded-lg p-6 border border-white/10 mb-12">
              <h2 className="text-2xl font-bold text-[#14B8A6] mb-4">
                What to Expect
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GamePreview
                  number="01"
                  title="Stroop Challenge"
                  description="Test your attention and processing speed"
                />
                <GamePreview
                  number="02"
                  title="Tower of Hanoi"
                  description="Challenge your problem-solving abilities"
                />
                <GamePreview
                  number="03"
                  title="Pattern Puzzler"
                  description="Enhance your pattern recognition skills"
                />
                <GamePreview
                  number="04"
                  title="Maze Navigator"
                  description="Improve your spatial reasoning"
                />
                <GamePreview
                  number="05"
                  title="Memory Match"
                  description="Boost your visual memory"
                />
                <GamePreview
                  number="06"
                  title="Word Puzzle"
                  description="Develop your verbal cognitive skills"
                />
              </div>
            </div>

            {/* About Us Section */}
            <div id="about" className="bg-[#1E3A8A]/30 backdrop-blur-md rounded-lg p-6 border border-white/10 mb-12">
              <h2 className="text-2xl font-bold text-[#14B8A6] mb-4">
                About Us
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Our Team</div>
                  <h3 className="text-lg font-bold text-white mb-2">Expert Scientists & Developers</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Expert cognitive scientists and developers working together to create engaging brain training experiences.
                  </p>
                </div>

                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Research-Based</div>
                  <h3 className="text-lg font-bold text-white mb-2">Scientific Foundation</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Built on established cognitive science principles and continuously updated with the latest research findings.
                  </p>
                </div>

                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Our Mission</div>
                  <h3 className="text-lg font-bold text-white mb-2">Accessible Enhancement</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Making cognitive enhancement accessible to everyone through engaging and scientifically-validated games.
                  </p>
                </div>
              </div>
            </div>

            {/* Below About Us Section */}
            <div className="bg-[#1E3A8A]/30 backdrop-blur-md rounded-lg p-6 border border-white/10 mb-12">
              <h2 className="text-2xl font-bold text-[#14B8A6] mb-4">
                Why Choose IQ Level?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Comprehensive Assessment</div>
                  <h3 className="text-lg font-bold text-white mb-2">Detailed Performance Metrics</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Get in-depth analysis of your cognitive performance across multiple dimensions, including memory, attention, and problem-solving abilities.
                  </p>
                </div>

                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Personalized Experience</div>
                  <h3 className="text-lg font-bold text-white mb-2">Adaptive Difficulty</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Our games adapt to your skill level, ensuring an optimal challenge that keeps you engaged and continuously improving.
                  </p>
                </div>

                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Progress Tracking</div>
                  <h3 className="text-lg font-bold text-white mb-2">Performance Analytics</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Monitor your improvement over time with detailed progress reports and performance trends across all cognitive domains.
                  </p>
                </div>

                <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
                  <div className="text-sm text-[#14B8A6] font-medium mb-2">Scientific Validation</div>
                  <h3 className="text-lg font-bold text-white mb-2">Research-Backed Methods</h3>
                  <p className="text-[#F3F4F6] text-sm leading-relaxed">
                    Our cognitive assessment tools are developed in collaboration with cognitive scientists and validated through rigorous research.
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <footer className="py-8 border-t border-white/10 bg-[#1E3A8A]/20">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Brand */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Brain className="w-8 h-8 text-[#14B8A6]" />
                      <span className="text-white font-bold text-xl">IQ Level</span>
                    </div>
                    <p className="text-white/70">
                      Enhancing cognitive abilities through science-based games and exercises.
                    </p>
                  </div>

                  {/* Quick Links */}
                  <div>
                    <h4 className="text-white font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2">
                      <li><a href="#" className="text-white/70 hover:text-white transition-colors">Home</a></li>
                      <li><a href="#about" className="text-white/70 hover:text-white transition-colors">About Us</a></li>
                      <li>
                        <button 
                          onClick={handleStartGame} 
                          className="text-white/70 hover:text-white transition-colors"
                        >
                          Start Game
                        </button>
                      </li>
                    </ul>
                  </div>

                  {/* Contact */}
                  <div>
                    <h4 className="text-white font-semibold mb-4">Contact Us</h4>
                    <div className="text-white/70">
                      <a href="mailto:Sales@jashmainfosoft.com" className="hover:text-white transition-colors">Sales@jashmainfosoft.com</a>
                    </div>
                  </div>
                </div>

                {/* Get in touch banner at the bottom */}
                <div className="mt-8 mb-6">
                  <div className="bg-gradient-to-r from-[#1E3A8A]/40 to-[#6D28D9]/40 backdrop-blur-sm border border-white/10 rounded-lg">
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-center space-x-2 text-white/80">
                        <Mail className="w-4 h-4 text-[#14B8A6]" />
                        <span>Get in touch:</span>
                        <a href="mailto:Sales@jashmainfosoft.com" className="text-[#14B8A6] hover:text-white transition-colors font-medium">
                          Sales@jashmainfosoft.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <div className="flex flex-col md:flex-row justify-between items-center">
                    <div className="text-white/50 text-sm mb-4 md:mb-0">
                      © 2024 IQ Level. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                      <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Privacy Policy</a>
                      <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Terms of Service</a>
                      <a href="#" className="text-white/50 hover:text-white transition-colors text-sm">Cookie Policy</a>
                    </div>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </div>
      )}
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#1E3A8A]/30 rounded-lg p-6 backdrop-blur-sm border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
      <Icon className="w-12 h-12 text-[#14B8A6] mb-4" />
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-[#F3F4F6] leading-relaxed">{description}</p>
    </div>
  )
}

function GamePreview({ 
  number, 
  title, 
  description 
}: { 
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-[#1E3A8A]/30 rounded-lg p-5 border border-white/10 hover:bg-[#1E3A8A]/40 transition-colors">
      <div className="text-sm text-[#14B8A6] font-medium mb-2">Game {number}</div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-[#F3F4F6] text-sm leading-relaxed">{description}</p>
    </div>
  )
}

