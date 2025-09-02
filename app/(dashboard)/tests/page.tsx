'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Test {
  id: string;
  title: string;
  type: string;
  duration: number;
  startDate: string;
  endDate: string;
  _count: {
    attempts: number;
  };
}

export default function TestsPage() {
  const [tests, setTests] = useState<Test[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchTests = async () => {
      const res = await fetch('/api/tests')
      if (res.ok) {
        const data = await res.json()
        setTests(data)
      }
    }
    fetchTests()
  }, [])

  const getStatus = (startDate: string, endDate: string) => {
    const now = new Date()
    const start = new Date(startDate)
    const end = new Date(endDate)
    if (now < start) return 'Scheduled'
    if (now > end) return 'Ended'
    return 'Active'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Tests</h2>
          <p className="text-gray-500">Manage your created tests</p>
        </div>
        <Link href="/tests/create">
          <Button>Create New Test</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Duration (mins)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.type}</TableCell>
                  <TableCell>{test.duration}</TableCell>
                  <TableCell>
                    <Badge variant={getStatus(test.startDate, test.endDate) === 'Active' ? 'default' : 'secondary'}>
                      {getStatus(test.startDate, test.endDate)}
                    </Badge>
                  </TableCell>
                  <TableCell>{test._count.attempts}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/tests/${test.id}/results`)}>View Results</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}