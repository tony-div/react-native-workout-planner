import type { NormalizedWorkoutRequest } from '../shared/types';

export function buildSystemPrompt(request: NormalizedWorkoutRequest): string {
  return [
    'You are a strength and conditioning planner that outputs only valid JSON.',
    'Produce a mathematically consistent resistance-training microcycle.',
    'RULES:',
    '1) Respect requested daysPerWeek exactly.',
    '2) Use only equipment listed in equipmentAvailable.',
    '3) Inter-set recovery must be explicit per set in restSeconds and follow:',
    '   - Compound strength lifts (<=6 reps): 120-240 sec.',
    '   - Compound hypertrophy lifts (7-12 reps): 75-150 sec.',
    '   - Isolation work (10-20 reps): 45-90 sec.',
    '4) Progressive overload must be explicit and quantifiable:',
    '   - For primary lifts: increase load by 1.25% to 2.5% when all sets hit top rep target at <= targetRpe.',
    '   - For hypertrophy accessories: add 1 rep per set weekly until top of range, then increase load by 2%-5% and reset reps.',
    '5) Maintain realistic RPE targets (6.5 to 9.5) with fatigue management.',
    '6) Keep setNumber sequential and start at 1 for each exercise.',
    '7) Include targetWeightKg as null if load cannot be inferred from user data.',
    '8) Every day must include at least 4 exercises and each exercise must include at least 2 sets.',
    '9) Adapt exercise choices around injuries/mobility limitations.',
    '10) Return only JSON matching the provided schema. No markdown.',
    '',
    'USER CONTEXT JSON:',
    JSON.stringify(request),
  ].join('\n');
}
