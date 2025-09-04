'use server';
/**
 * @fileOverview Summarizes textual content into the Bajoria format using GenAI.
 *
 * - summarizeContentForBajoriaFormat - A function that summarizes content for Bajoria format.
 * - SummarizeContentForBajoriaFormatInput - The input type for the summarizeContentForBajoriaFormat function.
 * - SummarizeContentForBajoriaFormatOutput - The return type for the summarizeContentForBajoriaFormat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeContentForBajoriaFormatInputSchema = z.object({
  lessonName: z.string().describe('The name of the lesson.'),
  textualContent: z
    .string()
    .describe('The textual content to be summarized in Bajoria format.'),
  slides: z.string().describe('The slides for the lesson'),
});
export type SummarizeContentForBajoriaFormatInput = z.infer<
  typeof SummarizeContentForBajoriaFormatInputSchema
>;

const SummarizeContentForBajoriaFormatOutputSchema = z.object({
  summary: z.string().describe('The summarized content in Bajoria format.'),
});
export type SummarizeContentForBajoriaFormatOutput = z.infer<
  typeof SummarizeContentForBajoriaFormatOutputSchema
>;

export async function summarizeContentForBajoriaFormat(
  input: SummarizeContentForBajoriaFormatInput
): Promise<SummarizeContentForBajoriaFormatOutput> {
  return summarizeContentForBajoriaFormatFlow(input);
}

const PromptInputSchema = z.object({
  jsonData: z.string(),
});

const summarizeContentPrompt = ai.definePrompt({
  name: 'summarizeContentPrompt',
  input: {schema: PromptInputSchema},
  output: {schema: SummarizeContentForBajoriaFormatOutputSchema},
  config: {
    temperature: 0.1,
    topP: 0.98,
    maxOutputTokens: 65536,
  },
  prompt: `**Instruction:**
Generate a detailed unstop format ouput in **Unstop format** for a course based on the provided JSON data.

**Input Data:**

{{jsonData}}

The untstop format data should be generated only from the script (JSON slides and/or textual lesson content), ensuring clarity, logical structure, and technical accuracy while using an engaging and interactive tone to promote learner interest.

The content must not exceed **45,000 words**.
The Unstop Format will be used by an AI system to deliver an interactive Q\&A experience for learners.

---

### Steps to Follow

1. **Extract and Organize Content**
   * Use only the **transcript** of dialogues/voiceovers provided in the JSON script.
   * Summarize **visual elements** such as slides, diagrams, or charts in the JSON script.
   * Include all **code snippets** exactly as given in the JSON script.
   * Preserve and expand upon the **main textual lesson content** if provided.

2. **Structure the Material**
   * Break content into logical **sections** based on flow, topics, and learning objectives.
   * Add **clear headings and subheadings** to guide learners.

3. **Narrative and Style**
   * Write in a **learner-centric, engaging tone** while ensuring **technical precision**.
   * Add **examples, scenarios, or placeholders** for visuals/code where appropriate.
   * Avoid deviating from the provided script while making the content **digestible and clear**.

4. **Formatting Requirements**
   * The output **must strictly follow** the Unstop format provided below.
   * Do not add or remove sections.
   * Do not change section titles.
   * Keep explanations clear, concise, and consistent with the flow of the lesson.

---

### Unstop Format (STRICT)
"
<<Unstop>>

Here is the current lesson:

---

### [Module Title]
[Short, engaging introduction to the module topic.]

### What You\'ll Learn
[Key learning objectives in bullet points or a short paragraph.]

### Instructional Content
[Organized main content with subheadings. Include code snippets, visuals, and examples.]

#### Example Subsection Title
[Sample explanation or code block here.]

### Why It Matters
[Explain the real-world significance and applications of the module.]

### Learn by Doing
[Optional sample exercise or challenge for learners.]
"

---

### Notes

* **Strict Format Compliance**: Do not modify the structure of the Unstop format.
* **Clarity for All Levels**: Ensure explanations are accessible to learners of varying backgrounds.
* **Accuracy**: Preserve code, formulas, and technical details exactly as given in the JSON.
* **Examples & Visuals**: Use direct snippets or placeholders for diagrams/visuals when needed.
* **Tone**: Engaging, motivational, and precise — inspire learners while teaching.`,
});

const summarizeContentForBajoriaFormatFlow = ai.defineFlow(
  {
    name: 'summarizeContentForBajoriaFormatFlow',
    inputSchema: SummarizeContentForBajoriaFormatInputSchema,
    outputSchema: SummarizeContentForBajoriaFormatOutputSchema,
  },
  async input => {
    const jsonData = JSON.stringify(input);
    let summary = '';
    for (let i = 0; i < 3; i++) {
      const {output} = await summarizeContentPrompt({jsonData});
      if (output?.summary?.includes('<<Unstop>>')) {
        summary = output.summary;
        break;
      }
    }

    if (!summary) {
      return {summary: 'Need to Retry'};
    }

    return {summary};
  }
);
