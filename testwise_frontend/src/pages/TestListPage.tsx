import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';



// Define the type for a single test object from our API
interface Test {
  id: string;
  title: string;
  description: string | null;
  status: 'Draft' | 'Published' | 'Archived';
  createdAt: string;
}

export default function TestListPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/tests');
        if (response.data.success) {
          setTests(response.data.data);
        }
      } catch (err) {
        setError('Failed to fetch tests. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTests();
  }, []);

  if (isLoading) {
    return <div>Loading tests...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Tests</CardTitle>
          <CardDescription>A list of all the tests you have created.</CardDescription>
        </div>
        <Button onClick={() => navigate('/dashboard/tests/new')}>Create New Test</Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tests.length > 0 ? (
              tests.map((test) => (
                <TableRow key={test.id}>
                  <TableCell className="font-medium">{test.title}</TableCell>
                  <TableCell>{test.status}</TableCell>
                  <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => navigate(`/tests/${test.id}/take`)}
                        // Only show for published tests
                        disabled={test.status !== 'Published'}
                    >
                        Take Test
                    </Button>
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate(`/dashboard/tests/${test.id}/edit`)}
                    >
                        View/Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  You haven't created any tests yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}