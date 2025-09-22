import { useState } from 'react';
import apiClient from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestForm, { type TestFormValues } from '@/components/forms/TestForm';

export default function CreateTestPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleCreateTest(data: TestFormValues) {
    setIsSubmitting(true);
    try {
      await apiClient.post('/tests', data);
      toast.success('Your test has been created successfully.');
      navigate('/dashboard/tests');
    } catch (error: any) {
      toast.error('Failed to create the test.', {
        description: error.response?.data?.message || 'An unexpected error occurred.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Test</CardTitle>
        <CardDescription>Fill out the details below to create your test.</CardDescription>
      </CardHeader>
      <CardContent>
        <TestForm onSubmit={handleCreateTest} isSubmitting={isSubmitting} />
      </CardContent>
    </Card>
  );
}