"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Brain } from "lucide-react"

interface UserFormProps {
  onSubmit: (data: { name: string; age: number; education: string }) => void
}

export default function UserForm({ onSubmit }: UserFormProps) {
  const [name, setName] = useState("")
  const [age, setAge] = useState("")
  const [education, setEducation] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name && age && education) {
      onSubmit({
        name,
        age: parseInt(age),
        education,
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-xl p-8 border-t-4 border-[#1E3A8A]">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <Brain className="w-12 h-12 text-[#6D28D9]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E3A8A]">Welcome to the Challenge</h2>
        <p className="text-gray-600 mt-2">Please tell us a bit about yourself</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-[#1E3A8A] mb-1">
            Your Name
          </label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            required
            className="w-full border-[#14B8A6] focus:ring-[#6D28D9]"
          />
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-[#1E3A8A] mb-1">
            Age
          </label>
          <Input
            id="age"
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="Enter your age"
            required
            min="5"
            max="100"
            className="w-full border-[#14B8A6] focus:ring-[#6D28D9]"
          />
        </div>

        <div>
          <label htmlFor="education" className="block text-sm font-medium text-[#1E3A8A] mb-1">
            Education Level
          </label>
          <Select value={education} onValueChange={setEducation}>
            <SelectTrigger className="border-[#14B8A6] focus:ring-[#6D28D9]">
              <SelectValue placeholder="Select your education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary School</SelectItem>
              <SelectItem value="secondary">Secondary School</SelectItem>
              <SelectItem value="highschool">High School</SelectItem>
              <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
              <SelectItem value="masters">Master's Degree</SelectItem>
              <SelectItem value="doctorate">Doctorate</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit"
          className="w-full bg-[#6D28D9] hover:bg-[#6D28D9]/90 text-lg py-6"
          disabled={!name || !age || !education}
        >
          Begin Challenge Series
        </Button>
      </form>
    </Card>
  )
}

