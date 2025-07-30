// This file is machine-generated - edit with care!

'use server';

/**
 * @fileOverview Generates content for a sticky note using AI.
 *
 * - generateNoteContent - A function that generates content for a note.
 * - GenerateNoteContentInput - The input type for the generateNoteContent function.
 * - GenerateNoteContentOutput - The return type for the generateNoteContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateNoteContentInputSchema = z.object({
  topic: z
    .string()
    .describe('The topic or theme for which content should be generated.'),
});
export type GenerateNoteContentInput = z.infer<typeof GenerateNoteContentInputSchema>;

const GenerateNoteContentOutputSchema = z.object({
  content: z
    .string()
    .describe('The generated content for the sticky note based on the topic.'),
});
export type GenerateNoteContentOutput = z.infer<typeof GenerateNoteContentOutputSchema>;

export async function generateNoteContent(input: GenerateNoteContentInput): Promise<GenerateNoteContentOutput> {
  return generateNoteContentFlow(input);
}

const generateNoteContentPrompt = ai.definePrompt({
  name: 'generateNoteContentPrompt',
  input: {schema: GenerateNoteContentInputSchema},
  output: {schema: GenerateNoteContentOutputSchema},
  prompt: `You are a creative assistant helping to generate content for sticky notes.

  Based on the given topic, generate concise and relevant content suitable for a sticky note.

  Topic: {{{topic}}}`,
});

const generateNoteContentFlow = ai.defineFlow(
  {
    name: 'generateNoteContentFlow',
    inputSchema: GenerateNoteContentInputSchema,
    outputSchema: GenerateNoteContentOutputSchema,
  },
  async input => {
    const {output} = await generateNoteContentPrompt(input);
    return output!;
  }
);
