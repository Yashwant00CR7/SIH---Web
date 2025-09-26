'use server';
/**
 * @fileOverview This file implements the Genkit flow for the VoiceAssistantStockTrends story.
 *
 * It allows scientists to query fish stock trends in specific regions using voice input.
 * - getFishStockTrend - A function that retrieves the stock trend of a fish species in a given region.
 * - GetFishStockTrendInput - The input type for the getFishStockTrend function.
 * - GetFishStockTrendOutput - The return type for the getFishStockTrend function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GetFishStockTrendInputSchema = z.object({
  fishName: z.string().describe('The name of the fish species.'),
  region: z.string().describe('The region to check the stock trend in.'),
});
export type GetFishStockTrendInput = z.infer<typeof GetFishStockTrendInputSchema>;

const GetFishStockTrendOutputSchema = z.object({
  stockTrend: z.string().describe('The stock trend of the fish species in the given region.'),
  confidence: z.number().describe('Confidence level of the stock trend data (0-1).'),
});
export type GetFishStockTrendOutput = z.infer<typeof GetFishStockTrendOutputSchema>;

export async function getFishStockTrend(input: GetFishStockTrendInput): Promise<GetFishStockTrendOutput> {
  return getFishStockTrendFlow(input);
}

const getFishStockTrendPrompt = ai.definePrompt({
  name: 'getFishStockTrendPrompt',
  input: {schema: GetFishStockTrendInputSchema},
  output: {schema: GetFishStockTrendOutputSchema},
  prompt: `You are an AI assistant helping marine scientists monitor fish populations.
  Based on available data, determine the stock trend of {{fishName}} in {{region}}.
  Provide a stockTrend string (increasing, decreasing, stable) and a confidence level between 0 and 1.
  Ensure the output matches the specified JSON schema.
  Consider factors like fishing activity, environmental changes, and historical data.
  If there is not enough information available, then set the stockTrend to unknown and set confidence to zero.
  `,
});

const getFishStockTrendFlow = ai.defineFlow(
  {
    name: 'getFishStockTrendFlow',
    inputSchema: GetFishStockTrendInputSchema,
    outputSchema: GetFishStockTrendOutputSchema,
  },
  async input => {
    const {output} = await getFishStockTrendPrompt(input);
    return output!;
  }
);

