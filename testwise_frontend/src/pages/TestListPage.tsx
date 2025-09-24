import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

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

  useEffect(() => {
    fetchTests();
  }, []);

  // --- NEW: Function to handle status changes ---
  const handleStatusChange = async (testId: string, action: 'publish' | 'archive') => {
    try {
      await apiClient.post(`/tests/${testId}/${action}`);
      toast.success(`Test has been successfully ${action}ed.`);
      // Refresh the list to show the new status
      fetchTests();
    } catch (err: any) {
      toast.error(`Failed to ${action} test.`, {
        description: err.response?.data?.message,
      });
    }
  };

  // --- NEW: Helper for badge color ---
  const getStatusVariant = (status: Test['status']) => {
    switch (status) {
      case 'Published': return 'default';
      case 'Archived': return 'secondary';
      case 'Draft': return 'outline';
      default: return 'outline';
    }
  };

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
                  <TableCell>
                    {/* --- UPDATED: Status Badge --- */}
                    <Badge variant={getStatusVariant(test.status)}>{test.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(test.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    {/* --- UPDATED: Actions Dropdown Menu --- */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/tests/${test.id}/results`)}>
                          View Results
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/dashboard/tests/${test.id}/edit`)}>
                          Edit
                        </DropdownMenuItem>
                        {test.status !== 'Published' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(test.id, 'publish')}>
                            Publish
                          </DropdownMenuItem>
                        )}
                        {test.status !== 'Archived' && (
                          <DropdownMenuItem onClick={() => handleStatusChange(test.id, 'archive')}>
                            Archive
                          </DropdownMenuItem>
                        )}
                         <DropdownMenuItem 
                            className="text-destructive" 
                            // Add a delete handler here in the future
                            onClick={() => toast.info("Delete action not yet implemented.")}
                          >
                            Delete
                          </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
