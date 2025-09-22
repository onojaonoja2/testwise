import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '@/api/axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestForm, { type TestFormValues } from '@/components/forms/TestForm';

export default function EditTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<TestFormValues | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTest = async () => {
      try {
        const response = await apiClient.get(`/tests/${testId}`);
        if (response.data.success) {
          // The form component expects a specific shape, so we ensure the data matches.
          const { title, description, durationMinutes, questions } = response.data.data;
          setInitialData({ title, description, durationMinutes, questions });
        }
      } catch (error) {
        toast.error('Failed to fetch test data.');
        navigate('/dashboard/tests');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTest();
  }, [testId, navigate]);

  async function handleUpdateTest(data: TestFormValues) {
    setIsSubmitting(true);
    try {
      await apiClient.put(`/tests/${testId}`, data);
      toast.success('Your test has been updated successfully.');
      navigate('/dashboard/tests');
    } catch (error: any) {
      toast.error('Failed to update the test.', {
        description: error.response?.data?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Edit Test</CardTitle>
        </CardHeader>
        <CardContent>Loading form data...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Test</CardTitle>
        <CardDescription>Update the details of your test below.</CardDescription>
      </CardHeader>
      <CardContent>
        {initialData ? (
          <TestForm
            initialData={initialData}
            onSubmit={handleUpdateTest}
            isSubmitting={isSubmitting}
          />
        ) : (
          <div>Could not load test data for editing.</div>
        )}
      </CardContent>
    </Card>
  );
}