import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import TestForm from '@/components/forms/TestForm';

export default function CreateTestPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Test</CardTitle>
        <CardDescription>Fill out the details below to create your test.</CardDescription>
      </CardHeader>
      <CardContent>
        <TestForm mode="create" />
      </CardContent>
    </Card>
  );
}