import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { ClientConfig, ServerConfig } from '../shared/types';

export interface InitEnvOptions {
  outputPath?: string;
  overwrite?: boolean;
}

export const DEFAULT_EXERCISE_LIST = [
  'Push-Up',
  'Pike Push-Up',
  'Dumbbell Shoulder Press',
  'Dumbbell Lateral Raise',
  'Cable Shoulder Press',
  'Face Pull',
  'Chin-Up',
  'Underhand Pull-Up',
  'Dumbbell Curl',
  'Hammer Curl',
  'Cable Curl',
  'Rope Cable Curl',
  'Bench Dip',
  'Diamond Push-Up',
  'Dumbbell Overhead Extension',
  'Dumbbell Kickback',
  'Cable Pushdown',
  'Rope Pushdown',
  'Dead Hang',
  'Fingertip Plank',
  'Dumbbell Wrist Curl',
  'Reverse Dumbbell Curl',
  'Cable Wrist Curl',
  'Rope Hammer Curl',
  'Wide Push-Up',
  'Flat Dumbbell Bench Press',
  'Dumbbell Fly',
  'Cable Chest Press',
  'Cable Fly',
  'Crunch',
  'Plank',
  'Weighted Crunch',
  'Dumbbell Side Bend',
  'Cable Crunch',
  'Cable Woodchopper',
  'Pull-Up',
  'Inverted Row',
  'Dumbbell Row',
  'One-Arm Dumbbell Row',
  'Lat Pulldown',
  'Seated Cable Row',
  'Plank Shoulder Tap',
  'Dumbbell Shrug',
  'Upright Row',
  'Cable Shrug',
  'Superman Hold',
  'Bird Dog',
  'Deadlift',
  'Good Morning',
  'Cable Pull Through',
  'Cable Deadlift',
  'Air Squat',
  'Forward Lunge',
  'Goblet Squat',
  'Dumbbell Lunge',
  'Cable Squat',
  'Cable Leg Extension',
  'Standing Calf Raise',
  'Jump Rope',
  'Dumbbell Calf Raise',
  'Seated Dumbbell Calf Raise',
  'Cable Standing Calf Raise',
  'Cable Toe Press',
];

const DEFAULT_ENV_TEMPLATE = [
  'GEMINI_API_KEY=your_gemini_api_key_here',
  'API_BASE_URL=http://localhost:3000',
  '# EXERCISE_LIST: comma-separated; leave empty to use built-in default list',
  'EXERCISE_LIST=',
].join('\n');

export function createServerConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ServerConfig {
  const geminiApiKey = env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable');
  }
  const exerciseList = env.EXERCISE_LIST
    ? env.EXERCISE_LIST.split(',').map((e) => e.trim()).filter(Boolean)
    : DEFAULT_EXERCISE_LIST;
  return { geminiApiKey, geminiModel: env.GEMINI_MODEL, exerciseList };
}

export function createClientConfigFromEnv(env: NodeJS.ProcessEnv = process.env): ClientConfig {
  const apiBaseUrl = env.API_BASE_URL;
  if (!apiBaseUrl) {
    throw new Error('Missing API_BASE_URL environment variable');
  }
  return { apiBaseUrl };
}

export function getEnvTemplate(): string {
  return `${DEFAULT_ENV_TEMPLATE}\n`;
}

export function initializeEnvFile(options: InitEnvOptions = {}): string {
  const outputPath = resolve(process.cwd(), options.outputPath ?? '.env.example');

  if (!options.overwrite) {
    try {
      writeFileSync(outputPath, getEnvTemplate(), { encoding: 'utf8', flag: 'wx' });
      return outputPath;
    } catch (error) {
      const err = error as NodeJS.ErrnoException;
      if (err.code === 'EEXIST') {
        throw new Error(`File already exists at ${outputPath}. Pass overwrite=true to replace it.`);
      }
      throw error;
    }
  }

  writeFileSync(outputPath, getEnvTemplate(), { encoding: 'utf8' });
  return outputPath;
}
