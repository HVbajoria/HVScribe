import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({apiKey: 'AIzaSyBriJxaQXHm-aOQxWcQdovHx4zg-5UpULA'})],
  model: 'googleai/gemini-2.0-flash-lite',
});
