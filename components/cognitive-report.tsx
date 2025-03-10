import { Card } from "@/components/ui/card"
import { Brain, Trophy, Target, TrendingUp, Zap, BarChart2, Activity } from "lucide-react"

interface CognitiveReportProps {
  scores: {
    stroop: number
    hanoi: number
    pattern: number
    maze: number
    memory: number
    word: number
  }
  userData: {
    name: string
    age: number
    education: string
  } | null
  metrics?: {
    stroop?: any
    hanoi?: any
    pattern?: any
    maze?: any
    memory?: any
    word?: any
  }
}

export default function CognitiveReport({ scores, userData, metrics }: CognitiveReportProps) {
  const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
  const maxPossibleScore = 6000 // Assuming each game has a max score of 1000

  const getCognitiveLevel = (score: number) => {
    const percentage = (score / maxPossibleScore) * 100
    if (percentage >= 90) return "Exceptional"
    if (percentage >= 80) return "Advanced"
    if (percentage >= 70) return "Above Average"
    if (percentage >= 50) return "Average"
    if (percentage >= 30) return "Below Average"
    return "Needs Improvement"
  }

  const getAreaStrength = (score: number, maxScore = 1000) => {
    const percentage = (score / maxScore) * 100
    if (percentage >= 80) return "Strong"
    if (percentage >= 60) return "Good"
    if (percentage >= 40) return "Average"
    return "Needs Improvement"
  }

  return (
    <div className="min-h-screen bg-[#0B1437] py-8">
      <div className="container mx-auto px-4 md:px-6 xl:px-0 max-w-screen-xl">
        {/* Header Section */}
        <div className="bg-[#1E3A8A]/30 p-6 rounded-lg border border-white/10 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl xl:text-4xl font-bold text-white">Cognitive Assessment Report</h2>
      {userData && (
                <div className="mt-3">
                  <p className="text-base md:text-lg text-[#F3F4F6]/80">
                    {userData.name} · Age: {userData.age} · {userData.education}
                  </p>
                </div>
              )}
            </div>
            <div className="flex lg:flex-col items-start lg:items-end gap-6 lg:gap-2">
              <div className="text-right">
                <p className="text-sm md:text-base text-[#F3F4F6]/80">Overall Score</p>
                <p className="text-2xl md:text-3xl xl:text-4xl font-bold text-[#14B8A6]">{totalScore}</p>
              </div>
              <div className="text-right">
                <p className="text-sm md:text-base text-[#F3F4F6]/80">Cognitive Level</p>
                <p className="text-lg md:text-xl font-semibold text-white">{getCognitiveLevel(totalScore)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Attention & Processing"
            score={scores.stroop}
            strength={getAreaStrength(scores.stroop)}
            icon={Zap}
            metrics={[
              { label: "Accuracy", value: metrics?.stroop ? `${(100 - metrics.stroop.errorRate * 100).toFixed(1)}%` : "N/A" },
              { label: "Avg Response", value: metrics?.stroop ? `${Math.round(metrics.stroop.avgReactionTime)}ms` : "N/A" },
              { label: "Best Streak", value: metrics?.stroop?.bestStreak || "N/A" }
            ]}
          />
          <MetricCard
            title="Problem Solving"
            score={scores.hanoi}
            strength={getAreaStrength(scores.hanoi)}
            icon={Brain}
            metrics={[
              { label: "Efficiency", value: metrics?.hanoi ? `${(metrics.hanoi.moveEfficiency * 100).toFixed(1)}%` : "N/A" },
              { label: "Planning Time", value: metrics?.hanoi ? `${(metrics.hanoi.planningTime / 1000).toFixed(1)}s` : "N/A" },
              { label: "Invalid Moves", value: metrics?.hanoi?.invalidMoves || "N/A" }
            ]}
          />
          <MetricCard
            title="Pattern Recognition"
            score={scores.pattern}
            strength={getAreaStrength(scores.pattern)}
            icon={Target}
            metrics={[
              { label: "Patterns Found", value: scores.pattern ? Math.round(scores.pattern / 100) : "N/A" },
              { label: "Accuracy", value: "N/A" },
              { label: "Best Level", value: "N/A" }
            ]}
          />
          <MetricCard
            title="Spatial Reasoning"
            score={scores.maze}
            strength={getAreaStrength(scores.maze)}
            icon={Activity}
            metrics={[
              { label: "Path Efficiency", value: metrics?.maze ? `${(metrics.maze.pathEfficiency * 100).toFixed(1)}%` : "N/A" },
              { label: "Wall Collisions", value: metrics?.maze?.wallCollisions || "N/A" },
              { label: "Completion Time", value: metrics?.maze ? `${(metrics.maze.completionTime / 1000).toFixed(1)}s` : "N/A" }
            ]}
          />
          <MetricCard
            title="Visual Memory"
            score={scores.memory}
            strength={getAreaStrength(scores.memory)}
            icon={BarChart2}
            metrics={[
              { label: "Match Accuracy", value: metrics?.memory ? `${(metrics.memory.matchAccuracy * 100).toFixed(1)}%` : "N/A" },
              { label: "Avg Time/Move", value: metrics?.memory ? `${Math.round(metrics.memory.averageTimePerMove)}ms` : "N/A" },
              { label: "Memory Effect", value: metrics?.memory ? `${(metrics.memory.memorizeEffectiveness * 100).toFixed(1)}%` : "N/A" }
            ]}
          />
          <MetricCard
            title="Verbal Skills"
            score={scores.word}
            strength={getAreaStrength(scores.word)}
            icon={TrendingUp}
            metrics={[
              { label: "Words Completed", value: metrics?.word?.wordsCompleted || "N/A" },
              { label: "Accuracy", value: metrics?.word ? `${(metrics.word.accuracy * 100).toFixed(1)}%` : "N/A" },
              { label: "Best Streak", value: metrics?.word?.longestStreak || "N/A" }
            ]}
          />
        </div>

        {/* Learning Progress Section */}
        <div className="bg-[#1E3A8A]/30 rounded-lg border border-white/10 p-6 md:p-8">
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">Learning Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {metrics?.stroop && (
              <ProgressCard
                title="Attention Improvement"
                firstHalf={metrics.stroop.performanceOverTime.firstHalf}
                secondHalf={metrics.stroop.performanceOverTime.secondHalf}
              />
            )}
            {metrics?.memory && (
              <ProgressCard
                title="Memory Development"
                firstHalf={metrics.memory.performanceOverTime.firstHalf}
                secondHalf={metrics.memory.performanceOverTime.secondHalf}
              />
            )}
            {metrics?.maze && (
              <ProgressCard
                title="Spatial Learning"
                firstHalf={metrics.maze.performanceOverTime.firstHalf}
                secondHalf={metrics.maze.performanceOverTime.secondHalf}
              />
            )}
          </div>
        </div>

        <div className="text-sm md:text-base text-[#F3F4F6]/60 mt-8 max-w-3xl mx-auto">
          <p className="text-center">
            This report provides a general assessment of cognitive abilities based on game performance.
            For a comprehensive evaluation, please consult with a qualified professional.
          </p>
        </div>
      </div>
    </div>
  )
}

function MetricCard({ title, score, strength, icon: Icon, metrics }: { 
  title: string;
  score: number;
  strength: string;
  icon: any;
  metrics: Array<{ label: string; value: string | number }>;
}) {
  return (
    <div className="bg-[#1E3A8A]/30 rounded-lg border border-white/10 p-6 h-full">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-white mb-1">{title}</h3>
          <p className="text-sm md:text-base text-[#14B8A6]">{strength}</p>
        </div>
        <Icon className="w-6 h-6 md:w-8 md:h-8 text-[#14B8A6]" />
      </div>
      <p className="text-3xl md:text-4xl font-bold text-white mb-6">{score}</p>
      <div className="space-y-4">
        {metrics.map((metric, index) => (
          <div key={index} className="flex justify-between items-center">
            <span className="text-base text-[#F3F4F6]/70">{metric.label}</span>
            <span className="text-base font-medium text-white">{metric.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ProgressCard({
  title,
  firstHalf,
  secondHalf
}: {
  title: string;
  firstHalf: { accuracy: number; speed: number };
  secondHalf: { accuracy: number; speed: number };
}) {
  const accuracyImprovement = ((secondHalf.accuracy - firstHalf.accuracy) * 100).toFixed(1)
  const speedImprovement = ((firstHalf.speed - secondHalf.speed) / firstHalf.speed * 100).toFixed(1)

  return (
    <div className="bg-[#1E3A8A]/40 rounded-lg border border-white/10 p-6 h-full">
      <h4 className="text-lg md:text-xl font-semibold text-white mb-6">{title}</h4>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-base text-[#F3F4F6]/70">Accuracy Change</span>
          <span className={`text-base font-medium ${Number(accuracyImprovement) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {accuracyImprovement}%
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-base text-[#F3F4F6]/70">Speed Improvement</span>
          <span className={`text-base font-medium ${Number(speedImprovement) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {speedImprovement}%
          </span>
        </div>
      </div>
    </div>
  )
}

