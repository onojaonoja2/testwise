import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import apiClient from '@/api/axios';
import { toast } from "sonner"; // Correct import for Sonner

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Timer from '@/components/tests/Timer';

// Define types for the test data we receive
interface Option { id: string; optionText: string; }
interface Question { id: string; questionText: string; questionType: string; order: number; options: Option[]; }
interface TestData { id: string; title: string; description: string; durationMinutes: number; questions: Question[]; }

// Let's simplify the Answer type for clarity
type AnswerPayload = {
  questionId: string;
  selectedOptionId?: string;
  trueFalseAnswer?: boolean;
  shortAnswerText?: string;
};

export default function TakeTestPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [testData, setTestData] = useState<TestData | null>(null);
  // This state holds a map for faster lookups. Key is questionId.
  const [answers, setAnswers] = useState<Record<string, AnswerPayload>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (sessionId) {
        setIsLoading(true);
        try {
          const response = await apiClient.get(`/sessions/${sessionId}`);
          if (response.data.success) {
            const fetchedTest = response.data.data.test;
            const savedResponses: AnswerPayload[] = response.data.data.savedResponses;

            setTestData(fetchedTest);
            
            // Convert the savedResponses array into a map
            const answersMap: Record<string, AnswerPayload> = {};
            savedResponses.forEach(res => {
              answersMap[res.questionId] = res;
            });
            setAnswers(answersMap);

            // Calculate which question to resume on.
            let resumeIndex = 0;
            if (savedResponses.length > 0 && fetchedTest.questions) {
                const answeredQuestionIds = new Set(savedResponses.map((r: AnswerPayload) => r.questionId));
                const firstUnansweredIndex = fetchedTest.questions.findIndex((q: Question) => !answeredQuestionIds.has(q.id));
                
                // If all questions are answered, start at the last one.
                // Otherwise, start at the first unanswered one.
                resumeIndex = firstUnansweredIndex === -1 ? fetchedTest.questions.length - 1 : firstUnansweredIndex;
            }
            setCurrentQuestionIndex(resumeIndex);
          }
        } catch (error) {
            toast.error("Could not load test session.");
            navigate('/dashboard');
        }
        finally { setIsLoading(false); }
      }
    };
    fetchSessionData();
  }, [sessionId, navigate, toast]);

  // --- THIS IS THE NEW, UNIFIED ANSWER HANDLER ---
  const updateAnswer = (payload: AnswerPayload) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [payload.questionId]: payload,
    }));
  };

  // --- THIS IS THE NEW, SIMPLIFIED SUBMIT HANDLER ---
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Convert the answers map back to an array for the API
      const responsePayload = Object.values(answers);
      const response = await apiClient.post(`/sessions/${sessionId}/submit`, { responses: responsePayload });
      
      if (response.data.success) {
        toast.success(`Test Submitted! Final Score: ${response.data.data.score}%`, {
            description: `You answered ${response.data.data.correctCount} out of ${response.data.data.totalQuestions} questions correctly.`
        });
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast.error('Submission Failed', {
          description: err.response?.data?.message || "Could not submit your test."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSelectedValue = (questionId: string) => {
    return answers[questionId];
  };

  // CRITICAL: Add a robust loading and error guard
  if (isLoading) {
    return <div>Loading test session...</div>;
  }
  
  if (!testData) {
    return <div>Error: Test data could not be loaded.</div>;
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / testData.questions.length) * 100;

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
            <RadioGroup
              value={getSelectedValue(currentQuestion.id)?.selectedOptionId}
              onValueChange={(value) => updateAnswer({ questionId: currentQuestion.id, selectedOptionId: value })}
            >
              {currentQuestion.options.map(opt => (
                <div key={opt.id} className="flex items-center space-x-2">
                  <RadioGroupItem value={opt.id} id={opt.id} />
                  <Label htmlFor={opt.id}>{opt.optionText}</Label>
                </div>
              ))}
            </RadioGroup>
          )}
          {currentQuestion.questionType === 'Short Answer' && (
            <Textarea 
              placeholder="Your answer..." 
              value={getSelectedValue(currentQuestion.id)?.shortAnswerText || ''}
              onChange={(e) => updateAnswer({ questionId: currentQuestion.id, shortAnswerText: e.target.value })} 
            />
          )}
          {currentQuestion.questionType === 'True/False' && (
            <RadioGroup 
              value={String(getSelectedValue(currentQuestion.id)?.trueFalseAnswer)}
              onValueChange={(value) => updateAnswer({ questionId: currentQuestion.id, trueFalseAnswer: value === 'true' })}
            >
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
