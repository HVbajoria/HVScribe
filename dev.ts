import { config } from 'dotenv';
config();

import '@/ai/flows/generate-lesson-content.ts';
import '@/ai/flows/estimate-processing-time.ts';
import '@/ai/flows/summarize-content-for-bajoria-format.ts';