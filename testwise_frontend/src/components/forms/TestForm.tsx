import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

// Schemas can be exported and reused
export const optionSchema = z.object({
  optionText: z.string().min(1, 'Option text is required.'),
  isCorrect: z.boolean().default(false),
});

export const questionSchema = z.object({
  questionText: z.string().min(1, 'Question text is required.'),
  questionType: z.enum(['Multiple Choice', 'True/False', 'Short Answer']),
  order: z.number(),
  options: z.array(optionSchema).optional(),
});

export const testFormSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  description: z.string().optional(),
  durationMinutes: z.coerce.number().min(1, 'Duration must be at least 1 minute.'),
  questions: z.array(questionSchema).min(1, 'At least one question is required.'),
});

export type TestFormValues = z.infer<typeof testFormSchema>;

interface TestFormProps {
  initialData?: Partial<TestFormValues>;
  onSubmit: (data: TestFormValues) => void;
  isSubmitting: boolean;
}

export default function TestForm({ initialData, onSubmit, isSubmitting }: TestFormProps) {
  const navigate = useNavigate();

  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: initialData || {
      title: '',
      description: '',
      durationMinutes: 30,
      questions: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'questions',
  });

  const addQuestion = () => append({ questionText: '', questionType: 'Multiple Choice', order: fields.length + 1, options: [{ optionText: '', isCorrect: true }] });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => ( <FormItem><FormLabel>Test Title</FormLabel><FormControl><Input placeholder="e.g., Basic Algebra Quiz" {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="description" render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the test..." {...field} /></FormControl><FormMessage /></FormItem> )}/>
            <FormField control={form.control} name="durationMinutes" render={({ field }) => ( <FormItem><FormLabel>Duration (minutes)</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem> )}/>
        </div>
        <Separator />
        <div>
            <h3 className="text-lg font-medium mb-4">Questions</h3>
            <div className="space-y-6">
                {fields.map((question, index) => ( <QuestionField key={question.id} questionIndex={index} control={form.control} removeQuestion={remove} /> ))}
            </div>
            <Button type="button" variant="outline" onClick={addQuestion} className="mt-6">Add Question</Button>
        </div>
        <Separator />
        <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => navigate('/dashboard/tests')}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Test'}</Button>
        </div>
      </form>
    </Form>
  );
}

// Sub-component for a single Question
function QuestionField({ questionIndex, control, removeQuestion }: { questionIndex: number; control: any; removeQuestion: (index: number) => void; }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });
  
  const questionType = control._getWatch(`questions.${questionIndex}.questionType`);

  const addOption = () => {
    append({ optionText: '', isCorrect: false });
  };
  
  return (
    <div key={questionIndex} className="p-4 border rounded-md space-y-4 relative">
        <Button type="button" variant="destructive" size="sm" className="absolute -top-3 -right-3" onClick={() => removeQuestion(questionIndex)}>X</Button>
        <FormField control={control} name={`questions.${questionIndex}.questionText`} render={({ field }) => (
            <FormItem>
                <FormLabel>Question {questionIndex + 1}</FormLabel>
                <FormControl><Textarea placeholder="What is...?" {...field} /></FormControl>
                <FormMessage />
            </FormItem>
        )}/>
        <FormField control={control} name={`questions.${questionIndex}.questionType`} render={({ field }) => (
            <FormItem>
                <FormLabel>Question Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a type" /></SelectTrigger></FormControl>
                    <SelectContent>
                        <SelectItem value="Multiple Choice">Multiple Choice</SelectItem>
                        <SelectItem value="True/False">True/False</SelectItem>
                        <SelectItem value="Short Answer">Short Answer</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )}/>

        {/* Conditionally render options for Multiple Choice */}
        {questionType === 'Multiple Choice' && (
            <div className="pl-4 space-y-2">
                 <h4 className="text-sm font-medium">Options</h4>
                {fields.map((option, optionIndex) => (
                    <div key={option.id} className="flex items-center gap-2">
                        <FormField control={control} name={`questions.${questionIndex}.options.${optionIndex}.optionText`} render={({ field }) => (
                            <FormItem className="flex-grow">
                                <FormControl><Input placeholder={`Option ${optionIndex + 1}`} {...field} /></FormControl>
                            </FormItem>
                        )}/>
                        <Button type="button" variant="ghost" size="sm" onClick={() => remove(optionIndex)}>Remove</Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" size="sm" onClick={addOption} className="mt-2">Add Option</Button>
            </div>
        )}
    </div>
  )
}