import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import apiClient from '@/api/axios';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- Define Types ---
interface Session {
  id: string;
  status: 'In Progress' | 'Completed' | 'Expired';
  startedAt: string;
  completedAt: string | null;
  score: string | null;
  taker: {
    email: string;
  };
}

interface ResultsData {
  testTitle: string;
  sessions: Session[];
}

export default function TestResultsPage() {
  const { testId } = useParams<{ testId: string }>();
  const [results, setResults] = useState<ResultsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiClient.get(`/tests/${testId}/results`);
        if (response.data.success) {
          setResults(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch test results.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [testId]);
  
  const getStatusVariant = (status: Session['status']) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'In Progress': return 'secondary';
      default: return 'outline';
    }
  };

  if (isLoading) return <div>Loading results...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" size="icon">
             <Link to="/dashboard/tests"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <CardDescription>Results for</CardDescription>
            <CardTitle>{results?.testTitle}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Taker Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Completed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results && results.sessions.length > 0 ? (
              results.sessions.map((session) => (
                <TableRow key={session.id}>
                  <TableCell className="font-medium">{session.taker.email}</TableCell>
                  <TableCell><Badge variant={getStatusVariant(session.status)}>{session.status}</Badge></TableCell>
                  <TableCell>{session.score ? `${session.score}%` : 'N/A'}</TableCell>
                  <TableCell>
                    {session.completedAt ? new Date(session.completedAt).toLocaleString() : 'N/A'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  No one has taken this test yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}