import { GoogleGenerativeAI } from '@google/generative-ai';

import { normalizeWorkoutRequest } from '../shared/normalize';
import { isWorkoutPlan, planResponseSchemaText } from '../shared/schemas';
import type { ServerConfig, WorkoutPlan, WorkoutRequest } from '../shared/types';
import { buildSystemPrompt } from './prompt';

const GEMINI_MODEL = 'gemini-3.1-pro-preview';

function extractTextContent(response: unknown): string {
  const typed = response as {
    response?: {
      text?: () => string;
      candidates?: Array<{
        content?: {
          parts?: Array<{ text?: string }>;
        };
      }>;
    };
  };

  const direct = typed.response?.text?.();
  if (direct && direct.trim().length > 0) {
    return direct;
  }

  const partText = typed.response?.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? '')
    .join('')
    .trim();

  if (partText) {
    return partText;
  }

  throw new Error('Gemini returned an empty response payload');
}

export function parseWorkoutPlanResponse(text: string): WorkoutPlan {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON from model: ${(error as Error).message}`);
  }

  if (!isWorkoutPlan(parsed)) {
    throw new Error('Model response failed WorkoutPlan validation checks');
  }

  return parsed;
}

export function createPlanGenerator(config: ServerConfig) {
  if (!config.geminiApiKey) {
    throw new Error('geminiApiKey is required in server config');
  }

  const genAI = new GoogleGenerativeAI(config.geminiApiKey);
  const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

  return async function generateWorkoutPlan(request: WorkoutRequest): Promise<WorkoutPlan> {
    const normalized = normalizeWorkoutRequest(request);
    const prompt = buildSystemPrompt(normalized);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: JSON.parse(planResponseSchemaText),
      },
    });

    const jsonText = extractTextContent(result);
    return parseWorkoutPlanResponse(jsonText);
  };
}
