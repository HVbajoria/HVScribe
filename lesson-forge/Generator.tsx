'use client';

import { useState, useTransition, ChangeEvent, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import * as XLSX from 'xlsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { getEstimatedTime, generateContent, summarizeContent, type LessonInput, type GeneratedLesson } from '@/app/generate/actions';
import { UploadCloud, FileText, Wand2, Download, CheckCircle2, RotateCcw, Copy, ClipboardList } from 'lucide-react';

type Status = 'idle' | 'estimating' | 'generating' | 'summarizing' | 'completed' | 'error';

const manualInputSchema = z.object({
  lessonName: z.string().min(3, 'Lesson name must be at least 3 characters.'),
  slidesContent: z.string().min(10, 'Slides content must be at least 10 characters.'),
});

export function Generator() {
  const [status, setStatus] = useState<Status>('idle');
  const [generatedLessons, setGeneratedLessons] = useState<GeneratedLesson[]>([]);
  const [estimatedTime, setEstimatedTime] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof manualInputSchema>>({
    resolver: zodResolver(manualInputSchema),
    defaultValues: {
      lessonName: '',
      slidesContent: '',
    },
  });

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if ((status === 'generating' || status === 'summarizing') && estimatedTime > 0) {
      const startTime = Date.now();
      timer = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        const currentProgress = Math.min((elapsedTime / estimatedTime) * 100, 100);
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(timer);
        }
      }, 100);
    }
    return () => clearInterval(timer);
  }, [status, estimatedTime]);
  
  const handleGeneration = (lessons: LessonInput[]) => {
    if (lessons.length === 0) {
      toast({ variant: 'destructive', title: 'No lessons found', description: 'Please provide lessons to generate.' });
      return;
    }

    startTransition(async () => {
      try {
        setStatus('estimating');
        setProgress(0);
        setGeneratedLessons([]);
        
        const time = await getEstimatedTime(lessons.length);
        setEstimatedTime(time);
        
        const totalLessons = lessons.length;
        const allGeneratedLessons: GeneratedLesson[] = [];

        for (let i = 0; i < totalLessons; i++) {
          const lesson = lessons[i];
          
          // Step 1: Generate Content
          setStatus('generating');
          const { markdownContent } = await generateContent(lesson);
          
          const lessonWithContent = { ...lesson, markdownContent, summarizedContent: '' }; // Add placeholder for summary
          allGeneratedLessons.push(lessonWithContent);
          setGeneratedLessons([...allGeneratedLessons]);
          setProgress(((i + 0.5) / totalLessons) * 100);

          // Step 2: Summarize Content
          setStatus('summarizing');
          const { summarizedContent } = await summarizeContent({lessonName: lesson.lessonName, textualContent: markdownContent, slidesContent: lesson.slidesContent});

          const fullyGeneratedLesson = { ...lessonWithContent, summarizedContent };
          allGeneratedLessons[i] = fullyGeneratedLesson;

          setGeneratedLessons([...allGeneratedLessons]);
          setProgress(((i + 1) / totalLessons) * 100);
        }

        setStatus('completed');
        setProgress(100);
      } catch (e: any) {
        setStatus('error');
        toast({ variant: 'destructive', title: 'Generation Failed', description: e.message });
      }
    });
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
        toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a .xlsx file.' });
        return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const lessons: LessonInput[] = jsonData.map(row => {
          const lessonName = row['Lesson Name'] || row['lessonName'] || row['lesson_name'];
          const slides = row['Slides'] || row['slides'];
          
          if (!lessonName || !slides) {
            throw new Error('Excel file must contain "Lesson Name" and "Slides" columns.');
          }
          return { lessonName: String(lessonName), slidesContent: String(slides) };
        });

        handleGeneration(lessons);

      } catch (err: any) {
        toast({ variant: 'destructive', title: 'File Processing Error', description: err.message });
      } finally {
        e.target.value = '';
      }
    };
    reader.readAsArrayBuffer(file);
  };
  
  const onManualSubmit = (values: z.infer<typeof manualInputSchema>) => {
    handleGeneration([{ ...values }]);
  };

  const handleDownload = () => {
    const worksheetData = generatedLessons.map(lesson => ({
      'Lesson Name': lesson.lessonName,
      'Slides': lesson.slidesContent,
      'Textual Content': lesson.markdownContent,
      'Summarized Content': lesson.summarizedContent,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Lessons');

    XLSX.writeFile(workbook, 'HVscribe_lessons.xlsx');
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({ title: 'Copied to clipboard!' });
  };
  
  const reset = () => {
    setStatus('idle');
    setGeneratedLessons([]);
    setEstimatedTime(0);
    setProgress(0);
    form.reset();
  }
  
  const getLoaderIcon = () => {
      switch(status) {
          case 'generating':
              return <Wand2 className="h-16 w-16 text-primary animate-pulse" />;
          case 'summarizing':
              return <ClipboardList className="h-16 w-16 text-primary animate-spin-slow" />;
          default:
            return <Wand2 className="h-16 w-16 text-primary animate-pulse" />;
      }
  }

  const renderContent = () => {
    if (isPending || status === 'estimating' || status === 'generating' || status === 'summarizing') {
      const totalLessons = Math.round(estimatedTime/20);
      const currentLessonNum = generatedLessons.length + (status === 'summarizing' ? 1 : 0);
      return (
        <Card className="w-full text-center animate-fade-in">
            <CardContent className="p-12">
                <div className="flex flex-col items-center gap-4">
                    {getLoaderIcon()}
                    <h2 className="font-headline text-3xl font-bold">
                        {status === 'estimating' && 'Estimating time...'}
                        {status === 'generating' && 'Scribing Your Lessons...'}
                        {status === 'summarizing' && 'Summarizing Content...'}
                    </h2>
                    <p className="text-muted-foreground">
                        {status === 'estimating' && 'Our AI is hard at work. Please wait a moment.'}
                        {(status === 'generating' || status === 'summarizing') && `Processing lesson ${currentLessonNum} of ${totalLessons}...`}
                    </p>
                    {(status === 'generating' || status === 'summarizing') && (
                        <div className="w-full max-w-md pt-4">
                            <Progress value={progress} className="w-full" />
                            <p className="text-sm mt-2 text-muted-foreground">
                                {Math.round(progress)}% complete. Estimated time remaining: {Math.max(0, Math.round(estimatedTime * (1 - progress/100)))}s
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
      )
    }

    if (status === 'completed') {
       return (
          <Card className="animate-fade-in">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-2xl flex items-center gap-2">
                    <CheckCircle2 className="h-6 w-6 text-green-500" />
                    Generation Complete!
                  </CardTitle>
                  <CardDescription>{generatedLessons.length} {generatedLessons.length === 1 ? 'lesson has' : 'lessons have'} been generated.</CardDescription>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                    <Button onClick={handleDownload} variant="accent">
                        <Download className="mr-2 h-4 w-4" />
                        Download Excel
                    </Button>
                    <Button variant="outline" onClick={reset}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Start Over
                    </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {generatedLessons.map((lesson, index) => (
                  <AccordionItem value={`item-${index}`} key={index}>
                    <AccordionTrigger className="font-headline text-left">
                        <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                            {lesson.lessonName}
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Tabs defaultValue="textual" className="w-full">
                        <TabsList>
                          <TabsTrigger value="textual">Textual Content</TabsTrigger>
                          <TabsTrigger value="summarized">Summarized Content</TabsTrigger>
                        </TabsList>
                        <TabsContent value="textual">
                           <div className="relative prose prose-zinc dark:prose-invert max-w-none rounded-md border bg-background/50 p-4 prose-p:text-base prose-headings:font-headline prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(lesson.markdownContent)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {lesson.markdownContent}
                            </ReactMarkdown>
                          </div>
                        </TabsContent>
                        <TabsContent value="summarized">
                          <div className="relative max-w-none rounded-md border bg-background/50 p-4">
                            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => handleCopy(lesson.summarizedContent)}>
                                <Copy className="h-4 w-4" />
                            </Button>
                            <pre className="whitespace-pre-wrap font-sans text-sm">
                              {lesson.summarizedContent}
                            </pre>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        );
    }
    
    // idle or error status
    return (
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Create Your Lessons</CardTitle>
              <CardDescription>Choose your preferred method to provide lesson content.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-primary/5">
                  <TabsTrigger value="upload">Upload Excel</TabsTrigger>
                  <TabsTrigger value="manual">Manual Input</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-6">
                  <label htmlFor="file-upload" className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
                    <UploadCloud className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 font-semibold">Drag & drop your .xlsx file here</p>
                    <p className="text-sm text-muted-foreground">or click to select a file</p>
                    <Input id="file-upload" type="file" className="sr-only" onChange={handleFileUpload} accept=".xlsx" />
                    <p className="mt-4 text-xs text-muted-foreground">Columns must be "Lesson Name" and "Slides".</p>
                  </label>
                </TabsContent>
                <TabsContent value="manual" className="mt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onManualSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="lessonName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-headline">Lesson Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Introduction to Photosynthesis" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="slidesContent"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-headline">Slides Content</FormLabel>
                            <FormControl>
                              <Textarea placeholder="Paste your slides content here..." {...field} rows={8} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={isPending} variant="accent">
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate Lesson
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
    );
  };

  return <div className="w-full">{renderContent()}</div>;
}
