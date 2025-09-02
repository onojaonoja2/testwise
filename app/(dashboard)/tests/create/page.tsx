'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CreateTestPage() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [type, setType] = useState('multiple-choice')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shareableLink, setShareableLink] = useState<string | null>(null)

  const [questions, setQuestions] = useState([
    { id: 1, text: '', points: 1, type: 'multiple-choice', options: [{ id: 1, text: '', isCorrect: true }] },
  ])

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: questions.length + 1,
        text: '',
        points: 1,
        type: 'multiple-choice',
        options: [{ id: 1, text: '', isCorrect: true }],
      },
    ])
  }

  const handleQuestionChange = (qIndex, field, value) => {
    const newQuestions = [...questions]
    newQuestions[qIndex][field] = value
    setQuestions(newQuestions)
  }

  const handleRemoveQuestion = (qIndex) => {
    const newQuestions = questions.filter((_, index) => index !== qIndex)
    setQuestions(newQuestions)
  }

  const handleAddOption = (qIndex) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options.push({
      id: newQuestions[qIndex].options.length + 1,
      text: '',
      isCorrect: false,
    })
    setQuestions(newQuestions)
  }

  const handleOptionChange = (qIndex, oIndex, value) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options[oIndex].text = value
    setQuestions(newQuestions)
  }

  const handleRemoveOption = (qIndex, oIndex) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options = newQuestions[qIndex].options.filter(
      (_, index) => index !== oIndex
    )
    setQuestions(newQuestions)
  }

  const handleCorrectChange = (qIndex, oIndex) => {
    const newQuestions = [...questions]
    newQuestions[qIndex].options.forEach((option, index) => {
      option.isCorrect = index === oIndex
    })
    setQuestions(newQuestions)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Basic validation
    if (
      questions.some(
        (q) =>
          !q.text ||
          (q.type === 'multiple-choice' && q.options.some((o) => !o.text))
      )
    ) {
      setError('Please fill out all question and option fields.')
      return
    }

    const res = await fetch('/api/tests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title,
        description,
        duration,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        questions,
      }),
    })

    if (res.ok) {
      const test = await res.json()
      setShareableLink(`${window.location.origin}/tests/take/${test.id}`)
    } else {
      const { message } = await res.json()
      setError(message)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Create New Test</h2>
        <p className="text-gray-500">Set up your test parameters and questions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Details</CardTitle>
          <CardDescription>Configure the basic settings for your test</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Test Title</Label>
                <Input id="title" placeholder="Enter test title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what this test is about"
                  className="h-24"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    placeholder="Enter test duration"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="type">Test Type</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select test type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                      <SelectItem value="essay">Essay</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500">{error}</p>}

            {/* Questions Section */}
            <Card>
              <CardHeader>
                <CardTitle>Questions</CardTitle>
                <CardDescription>Add questions and options for your test</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className="p-4 border rounded-md space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">Question {qIndex + 1}</h4>
                      <Button variant="destructive" size="sm" onClick={() => handleRemoveQuestion(qIndex)}>Remove</Button>
                    </div>
                    <div>
                      <Label>Question Text</Label>
                      <Textarea
                        placeholder="Enter the question"
                        value={q.text}
                        onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Points</Label>
                      <Input
                        type="number"
                        min={1}
                        value={q.points}
                        onChange={(e) => handleQuestionChange(qIndex, 'points', parseInt(e.target.value))}
                      />
                    </div>

                    <div>
                      <Label>Question Type</Label>
                      <Select value={q.type} onValueChange={(value) => handleQuestionChange(qIndex, 'type', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select question type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="multiple-choice">Multiple Choice</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {q.type === 'multiple-choice' && (
                      <div className="space-y-2">
                        <Label>Options</Label>
                        {q.options.map((o, oIndex) => (
                          <div key={o.id} className="flex items-center space-x-2">
                            <Input
                              type="radio"
                              name={`correct-option-${qIndex}`}
                              checked={o.isCorrect}
                              onChange={() => handleCorrectChange(qIndex, oIndex)}
                            />
                            <Input
                              placeholder={`Option ${oIndex + 1}`}
                              value={o.text}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            />
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveOption(qIndex, oIndex)}>Remove</Button>
                          </div>
                        ))}
                        <Button variant="outline" size="sm" onClick={() => handleAddOption(qIndex)}>Add Option</Button>
                      </div>
                    )}
                  </div>
                ))}
                <Button onClick={handleAddQuestion}>Add Question</Button>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full">Create Test</Button>
          </form>
          {shareableLink && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <Label>Shareable Test Link:</Label>
              <div className="flex items-center space-x-2">
                <Input type="text" value={shareableLink} readOnly />
                <Button onClick={() => navigator.clipboard.writeText(shareableLink)}>Copy</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}