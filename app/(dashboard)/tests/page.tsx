'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

// Placeholder data for demonstration
const tests = [
  {
    id: 1,
    title: 'Sample Test 1',
    type: 'Multiple Choice',
    duration: 60,
    status: 'Active',
    startDate: '2024-02-01T10:00',
    endDate: '2024-02-28T23:59',
  },
  // Add more test entries as needed
]

export default function TestsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">My Tests</h2>
          <p className="text-gray-500">Manage your created tests</p>
        </div>
        <Link href="/dashboard/tests/create">
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
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
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
                    <Badge variant={test.status === 'Active' ? 'default' : 'secondary'}>
                      {test.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(test.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(test.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">View Results</Button>
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