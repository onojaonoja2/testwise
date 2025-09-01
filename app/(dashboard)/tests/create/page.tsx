'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function CreateTestPage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [duration, setDuration] = useState(60)
  const [type, setType] = useState('multiple-choice')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shareableLink, setShareableLink] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      }),
    })

    if (res.ok) {
      const test = await res.json()
      setShareableLink(`${window.location.origin}/tests/take/${test.id}`)
      // router.push('/dashboard/tests')
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