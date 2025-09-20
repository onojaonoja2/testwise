import { useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import TestForm, { type TestFormValues } from '@/components/forms/TestForm'; // We'll create this next
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function EditTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const [testData, setTestData] = useState<TestFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;

    const fetchTestData = async () => {
      try {
        const response = await apiClient.get(`/tests/${testId}`);
        if (response.data.success) {
          // Map the API response to our form's expected structure
          const fetchedData = response.data.data;
          const formattedData: TestFormValues = {
            title: fetchedData.title,
            description: fetchedData.description || '',
            durationMinutes: fetchedData.durationMinutes,
            questions: fetchedData.questions.map((q: any) => ({
              questionText: q.questionText,
              questionType: q.questionType,
              order: q.order,
              options: q.options ? q.options.map((opt: any) => ({
                optionText: opt.optionText,
                isCorrect: opt.isCorrect,
              })) : [],
            })),
          };
          setTestData(formattedData);
        }
      } catch (err) {
        setError('Failed to load test data.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTestData();
  }, [testId]);

  if (isLoading) {
    return <div>Loading test data...</div>;
  }

  if (error) {
    return <div className="text-destructive">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Test</CardTitle>
        <CardDescription>Update the details of your test below.</CardDescription>
      </CardHeader>
      <CardContent>
        {testData ? (
          <TestForm mode="edit" initialData={testData} testId={testId} />
        ) : (
          <div>Test data could not be loaded.</div>
        )}
      </CardContent>
    </Card>
  );
}