import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '@/api/axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

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
  const [resumeSessionInfo, setResumeSessionInfo] = useState<{ sessionId: string } | null>(null);
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

  const handleStartTest = async (testId: string) => {
    try {
      const response = await apiClient.post(`/tests/${testId}/start`);
      const { sessionState, sessionId, testData } = response.data.data;

      if (sessionState === 'new') {
        // Happy path: new session created
        toast.success("Test started!", { description: "Good luck!" });
        navigate(`/dashboard/take-test/${sessionId}`, { state: { testData } });
      } else if (sessionState === 'in-progress') {
        // User has a session in progress, show the dialog
        setResumeSessionInfo({ sessionId });
      }
    } catch (err: any) {
      toast.error('Could not start test.', {
          description: err.response?.data?.message,
        });
    }
  };

  const resumeSession = () => {
    if (resumeSessionInfo) {
      // To resume, we need to fetch the test data again, as it wasn't sent
      // in the 'in-progress' response. A better approach might be to create a new
      // endpoint like GET /sessions/:sessionId/resume that provides the test data.
      // For now, we will just navigate, and the TakeTestPage will need to handle fetching.
      toast({ title: "Resuming test..." });
      navigate(`/dashboard/take-test/${resumeSessionInfo.sessionId}`);
      setResumeSessionInfo(null);
    }
  };

  const abandonAndStartNew = async () => {
      // This requires a new backend endpoint to abandon the old session.
      // For now, this will be non-functional but illustrates the UX.
      toast({
          variant: 'destructive',
          title: "Feature not implemented",
          description: "Abandoning sessions is not yet supported."
      });
      setResumeSessionInfo(null);
  }

  if (isLoading) return <div>Loading available tests...</div>;
  if (error) return <div className="text-destructive">{error}</div>;

  return (
    <>
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
                      <Button size="sm" onClick={() => handleStartTest(test.id)}>
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

      {/* The Alert Dialog for resuming */}
      <AlertDialog open={!!resumeSessionInfo} onOpenChange={() => setResumeSessionInfo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Test in Progress</AlertDialogTitle>
            <AlertDialogDescription>
              You already have a session for this test in progress. Would you like to resume where you left off?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={resumeSession}>Resume</AlertDialogAction>
            {/* <AlertDialogAction className="bg-destructive" onClick={abandonAndStartNew}>Abandon & Start New</AlertDialogAction> */}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}