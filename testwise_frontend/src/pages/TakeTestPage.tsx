import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Define types for the test data we receive
interface Option { id: string; optionText: string; }
interface Question { id: string; questionText: string; questionType: string; order: number; options: Option[]; }
interface TestData { id: string; title: string; description: string; durationMinutes: number; questions: Question[]; }

// Define type for a single answer
interface Answer {
  questionId: string;
  selectedOptionId?: string;
  shortAnswerText?: string;
  trueFalseAnswer?: boolean;
}

export default function TakeTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  const [testData, setTestData] = useState<TestData | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<{ score: string, totalQuestions: number } | null>(null);

  useEffect(() => {
    const startTestSession = async () => {
      if (!testId) return;
      try {
        const response = await apiClient.post(`/tests/${testId}/start`);
        const { sessionId, test } = response.data.data;
        setSessionId(sessionId);
        setTestData(test);
        // Initialize answers array
        setAnswers(test.questions.map((q: Question) => ({ questionId: q.id })));
      } catch (error: any) {
        toast.error("Failed to start test session", {
          description: error.response?.data?.message || "Please try again later.",
        });
        navigate('/dashboard'); // Redirect if session fails to start
      } finally {
        setIsLoading(false);
      }
    };
    startTestSession();
  }, [testId, navigate]);

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prevAnswers =>
      prevAnswers.map(ans =>
        ans.questionId === questionId ? { ...ans, ...value } : ans
      )
    );
  };
  
  const handleSubmit = async () => {
    if (!sessionId) return;
    setIsSubmitting(true);
    try {
        const response = await apiClient.post(`/sessions/${sessionId}/submit`, { responses: answers });
        setResults(response.data.data);
    } catch (error: any) {
        toast.error("Submission Failed", { description: error.response?.data?.message || "Could not submit your test." });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isLoading) return <div>Preparing your test...</div>;
  if (!testData) return <div>Could not load test data.</div>;

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;

  // Render the test results dialog
  if (results) {
    return (
        <Dialog open={true} onOpenChange={() => navigate('/dashboard')}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Test Completed!</DialogTitle>
                    <DialogDescription>Here are your results for the test: "{testData.title}"</DialogDescription>
                </DialogHeader>
                <div className="text-center py-8">
                    <p className="text-xl">Your Score:</p>
                    <p className="text-6xl font-bold">{results.score}%</p>
                    <p className="text-muted-foreground">({(Number(results.score) / 100 * results.totalQuestions).toFixed(0)} out of {results.totalQuestions} questions correct)</p>
                </div>
                <DialogFooter>
                    <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
  }

  // Render the main test-taking UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{testData.title}</CardTitle>
          <CardDescription>Question {currentQuestionIndex + 1} of {testData.questions.length}</CardDescription>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CardContent className="min-h-[200px]">
          <h2 className="text-lg font-semibold mb-4">{currentQuestion.questionText}</h2>
          {currentQuestion.questionType === 'Multiple Choice' && (
            <RadioGroup onValueChange={(value) => handleAnswerChange(currentQuestion.id, { selectedOptionId: value })}>
              {currentQuestion.options.map(opt => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <Label htmlFor={opt.id}>{opt.optionText}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {currentQuestion.questionType === 'Short Answer' && (
             <Textarea placeholder="Your answer..." onChange={(e) => handleAnswerChange(currentQuestion.id, { shortAnswerText: e.target.value })} />
          )}
          {currentQuestion.questionType === 'True/False' && (
            <RadioGroup onValueChange={(value) => handleAnswerChange(currentQuestion.id, { trueFalseAnswer: value === 'true' })}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id="true" />
                  <Label htmlFor="true">True</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id="false" />
                  <Label htmlFor="false">False</Label>
                </div>
            </RadioGroup>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentQuestionIndex(prev => prev - 1)} disabled={currentQuestionIndex === 0}>
            Previous
          </Button>
          {currentQuestionIndex < testData.questions.length - 1 ? (
            <Button onClick={() => setCurrentQuestionIndex(prev => prev + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Finish & Submit'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}