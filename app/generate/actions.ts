'use server';

import { generateLessonContent } from '@/ai/flows/generate-lesson-content';
import { estimateProcessingTime } from '@/ai/flows/estimate-processing-time';
import { summarizeContentForBajoriaFormat } from '@/ai/flows/summarize-content-for-bajoria-format';

export interface LessonInput {
  lessonName: string;
  slidesContent: string;
}

export interface GeneratedLesson {
  lessonName: string;
  slidesContent: string; // Keep original slides content for excel export
  markdownContent: string;
  summarizedContent: string;
}

export interface SummarizeInput {
  lessonName: string;
  textualContent: string;
  slidesContent: string;
}

export async function getEstimatedTime(numberOfLessons: number): Promise<number> {
  try {
    // We now have two steps per lesson, so we multiply by 2
    const result = await estimateProcessingTime({ numberOfLessons: numberOfLessons * 2 });
    return result.estimatedTimeSeconds;
  } catch (error) {
    console.error('Error estimating processing time:', error);
    // Return a default estimate on error
    return numberOfLessons * 20; // Default estimate adjusted for two steps
  }
}

export async function generateContent(
  lesson: LessonInput
): Promise<{ markdownContent: string }> {
  try {
    const generationResult = await generateLessonContent({
      lessonName: lesson.lessonName,
      slidesContent: lesson.slidesContent,
    });
    return { markdownContent: generationResult.markdownContent };
  } catch (error) {
    console.error(`Error generating content for lesson "${lesson.lessonName}":`, error);
    throw new Error(
      `Failed to generate content for lesson: ${lesson.lessonName}. Please try again.`
    );
  }
}

export async function summarizeContent(
  input: SummarizeInput
): Promise<{ summarizedContent: string }> {
  try {
    const summarizationResult = await summarizeContentForBajoriaFormat({
      lessonName: input.lessonName,
      textualContent: input.textualContent,
      slides: input.slidesContent,
    });
    return { summarizedContent: summarizationResult.summary };
  } catch (error) {
    console.error(`Error summarizing content for lesson "${input.lessonName}":`, error);
    throw new Error(
      `Failed to summarize content for lesson: ${input.lessonName}. Please try again.`
    );
  }
}
