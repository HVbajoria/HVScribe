'use server';

/**
 * @fileOverview This file defines a Genkit flow to estimate the processing time for lesson generation.
 *
 * - estimateProcessingTime - A function that estimates the processing time.
 * - EstimateProcessingTimeInput - The input type for the estimateProcessingTime function.
 * - EstimateProcessingTimeOutput - The return type for the estimateProcessingTime function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EstimateProcessingTimeInputSchema = z.object({
  numberOfLessons: z.number().describe('The number of lessons to generate.'),
});
export type EstimateProcessingTimeInput = z.infer<typeof EstimateProcessingTimeInputSchema>;

const EstimateProcessingTimeOutputSchema = z.object({
  estimatedTimeSeconds: z
    .number()
    .describe('The estimated processing time in seconds.'),
});
export type EstimateProcessingTimeOutput = z.infer<typeof EstimateProcessingTimeOutputSchema>;

export async function estimateProcessingTime(
  input: EstimateProcessingTimeInput
): Promise<EstimateProcessingTimeOutput> {
  return estimateProcessingTimeFlow(input);
}

const estimateProcessingTimePrompt = ai.definePrompt({
  name: 'estimateProcessingTimePrompt',
  input: {schema: EstimateProcessingTimeInputSchema},
  output: {schema: EstimateProcessingTimeOutputSchema},
  config: {
    model: 'googleai/gemini-2.0-flash-lite',
  },
  prompt: `You are an expert at estimating processing times for AI lesson generation.

  Given the number of lessons to generate, provide an estimated time in seconds.
  Assume that each lesson takes approximately 10 seconds to generate.
  Return only a number, representing the total estimated time in seconds.

  Number of lessons: {{{numberOfLessons}}}`,
});

const estimateProcessingTimeFlow = ai.defineFlow(
  {
    name: 'estimateProcessingTimeFlow',
    inputSchema: EstimateProcessingTimeInputSchema,
    outputSchema: EstimateProcessingTimeOutputSchema,
  },
  async input => {
    // Call the prompt to get the estimated time.
    const {output} = await estimateProcessingTimePrompt(input);

    // Return the estimated time.
    return output!;
  }
);
