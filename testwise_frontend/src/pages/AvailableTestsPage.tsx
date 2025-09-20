import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Define the type for the data from our new endpoint
interface AvailableTest {
  id: string;
  title: string;
  description: string | null;
  durationMinutes: number;
  creator: {
    email: string;
  };
}

export default function AvailableTestsPage() {
  const [tests, setTests] = useState<AvailableTest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPublishedTests = async () => {
      try {
        setIsLoading(true);
        // Hit the new endpoint
        const response = await apiClient.get('/tests/published');
        if (response.data.success) {
          setTests(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch available tests.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPublishedTests();
  }, []);

  if (isLoading) return <div>Loading available tests...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Tests</CardTitle>
        <CardDescription>Select a test to begin your session.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length > 0 ? (
              tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.description}</TableCell>
                  <TableCell className="text-muted-foreground">{test.creator.email}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" onClick={() => navigate(`/tests/${test.id}/take`)}>
                      Start Test
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  There are no published tests available at the moment.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}