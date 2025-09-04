'use server';

/**
 * @fileOverview This file defines a Genkit flow to generate lesson content in markdown format using the Gemini 2.5 Flash Lite model.
 *
 * - generateLessonContent - A function that takes lesson name and slides content as input and returns markdown formatted lesson content.
 * - GenerateLessonContentInput - The input type for the generateLessonContent function.
 * - GenerateLessonContentOutput - The return type for the generateLessonContentOutput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateLessonContentInputSchema = z.object({
  lessonName: z.string().describe('The name of the lesson.'),
  slidesContent: z.string().describe('The content of the slides for the lesson.'),
});
export type GenerateLessonContentInput = z.infer<typeof GenerateLessonContentInputSchema>;

const GenerateLessonContentOutputSchema = z.object({
  markdownContent: z.string().describe('The lesson content in markdown format.'),
});
export type GenerateLessonContentOutput = z.infer<typeof GenerateLessonContentOutputSchema>;

export async function generateLessonContent(input: GenerateLessonContentInput): Promise<GenerateLessonContentOutput> {
  return generateLessonContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateLessonContentPrompt',
  input: {schema: GenerateLessonContentInputSchema},
  output: {schema: GenerateLessonContentOutputSchema},
  config: {
    temperature: 0.6,
    maxOutputTokens: 65536,
  },
  prompt: `You are tasked with creating complete markdown-based lesson content of for a specific subtopic provided. Your content will be based on the supplied course script JSON, which includes slide content and audio transcripts corresponding to the subtopic. The lesson should be engaging, interactive, and include real-life examples to enhance learner understanding.
The lesson should contain maximum 45000 words. 
---

# Process

1. **Understand the Input**: Thoroughly review the provided course script JSON, which includes:
   - Slide Content {{{slidesContent}}}
   - Lesson Name: {{{lessonName}}}
2. **Content Structuring**:
   - Use the slide content and lesson name as a foundation for structuring the lesson. Where necessary, elaborate and rephrase for clarity and enhanced engagement.
   - Create an organized flow: Begin with clear learning objectives, introduce and explain the topic, include real-life scenarios/examples, and conclude with a summary or knowledge check.
3. **Interaction & Engagement**:
   - Include questions, scenarios, or prompts for user interaction.
   - Present thought-provoking real-life examples or analogies to relate the topic practically.
   - Use diagrams, tables, code snippets, or supplementary visuals if appropriate (referenced but not designed in-line).
4. **Adopt Markdown Syntax**:
   - Use appropriate markdown formatting for headers, lists, tables, bold, italics, etc., to enhance readability and hierarchical structuring.
5. **Keep it Learner-Centric**:
   - Ensure language is concise, approachable, and devoid of excessive jargon.
   - Anticipate and clarify potential learner questions or misconceptions.

---

# Output Format

The lesson content must be delivered in **well-structured markdown** and include:

1. **Title and Introduction**:
   - A catchy title that defines the subtopic.
   - A short introduction explaining what the learner will achieve after completing the lesson.
   
2. **Sectioned Content**:
   - Organize content into logical sections with Markdown headings (\`#\`, \`##\`, \`###\`, etc.).
   - Use bullet points, numbered lists, or subheaders as needed.

3. **Examples**:
   - Include at least two real-world relatable examples connected to the topic.
   
4. **Interactive Elements**:
   - Questions, thought experiments, or short activities/challenges encouraging the learner to engage.
   
5. **Summary**:
   - A concise summary that reviews the key points of the lesson.

6. **Optional Additional Resources**:
   - Suggest further reading, videos, or exercises for deeper understanding.

---

# Example

### Input (Course Script JSON)
{
  "slides": [
    {"slide_number": 1, "content": "Understanding basic supply and demand dynamics in economics."},
    {"slide_number": 2, "content": "Real-life applications of supply and demand principles."}
  ],
  "voice": "Welcome to this module on supply and demand. This subtopic is key to understanding economics. Let's explore how the relationship between supply and demand sets prices. By the end, you'll see how these principles impact real-world markets, like the price changes in groceries and movie tickets."
}

---

### Expected Markdown Lesson Output

# Supply and Demand: The Building Blocks of Economics

Economics revolves around understanding how markets work, and one of the key concepts is the interplay between **supply and demand**. In this lesson, we will:
- Learn how supply and demand determine market prices.
- Explore relatable, real-world examples showing these dynamics in action.

---

## What is Supply and Demand?

**Supply and Demand** are fundamental principles in economics. They represent the relationship between:
- **Supply**: The quantity of a good or service that producers are willing to sell at a given price.
- **Demand**: The quantity of a good or service that consumers are willing to buy at a given price.

### The Relationship
When prices are too high, demand decreases, but supply increases. On the other hand, when prices are low, demand increases, but supply decreases. The point where both the supply and demand meet is called the **equilibrium price**, and that's where the magic happens!

---

## Real-Life Examples

**Example 1: Grocery Prices**  
Imagine an unexpected frost damages orange plantations. The supply of oranges drops. What happens next?  
- The price of oranges goes up because there are fewer to sell.
- People might buy fewer oranges due to the higher price or look for alternatives, like apples or bananas.

**Example 2: Concert Tickets**  
Think about the price of tickets for a major artist like Chainsmokers, Justin Bieber, or Taylor Swift.  
- When demand skyrockets (everyone wants a ticket), and there aren't many seats, ticket prices soar.  
- This explains why front-row tickets are expensive while less popular shows have lower prices!

---

## Engage: Check Your Understanding

**Question**:  
If a new movie is released and gets poor reviews, how do you think that impacts ticket sales and prices?

### Hint:
Think about how demand (interest in the movie) changes and whether theaters might reduce ticket costs to fill seats.

---

## Summary

In this lesson, we covered:
- The basic principles of supply and demand.
- How these principles shape real-world markets.
- Examples like grocery prices and concert tickets.

By understanding these concepts, you'll be better equipped to analyze market trends and recognize the forces behind pricing changes!

---

### Additional Resources

1. [Intro to Economics by Khan Academy](https://www.khanacademy.org/economics)
2. [Supply and Demand Explained](https://www.example.com/supply-demand)

---

# Notes

1. Tailor real-life examples to suit the target audience's familiarity and environment.
2. Ensure that any interactive questions or thought exercises tie back to lesson goals.

**Reminder**: Markdown formatting is crucial for clarity and learner engagement; use headers, lists, and emphasis purposefully.
`,
});

const generateLessonContentFlow = ai.defineFlow(
  {
    name: 'generateLessonContentFlow',
    inputSchema: GenerateLessonContentInputSchema,
    outputSchema: GenerateLessonContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
