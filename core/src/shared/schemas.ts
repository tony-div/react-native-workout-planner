import type { WorkoutPlan } from './types';

export const DEFAULT_EQUIPMENT = ['barbell', 'dumbbell', 'machines', 'bands', 'bodyweight'];

export const workoutRequestSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['daysPerWeek'],
  properties: {
    primaryGoal: { type: 'string', enum: ['hypertrophy', 'strength'] },
    trainingLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    daysPerWeek: { type: 'number', minimum: 1, maximum: 7 },
    programDurationWeeks: { type: 'number', minimum: 1, maximum: 52 },
    equipmentAvailable: {
      type: 'array',
      items: { type: 'string' },
      minItems: 1,
    },
    demographics: {
      type: 'object',
      additionalProperties: false,
      properties: {
        gender: { type: 'string' },
        bodyWeight: { type: 'number', minimum: 1 },
        age: { type: 'number', minimum: 1 },
        trainingAge: { type: 'number', minimum: 0 },
      },
    },
    limitations: {
      type: 'object',
      additionalProperties: false,
      properties: {
        injuries: { type: 'array', items: { type: 'string' } },
        mobilityDifficulties: { type: 'array', items: { type: 'string' } },
      },
    },
    currentRPE: { type: 'number', minimum: 1, maximum: 10 },
    currentPlan: { type: 'object' },
    naturalLanguageRequest: { type: 'string' },
  },
} as const;

export const workoutPlanSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'planName',
    'primaryGoal',
    'trainingLevel',
    'daysPerWeek',
    'durationWeeks',
    'rationale',
    'interSetRecoveryPolicy',
    'progressiveOverload',
    'days',
  ],
  properties: {
    planName: { type: 'string' },
    primaryGoal: { type: 'string', enum: ['hypertrophy', 'strength', 'general_fitness'] },
    trainingLevel: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
    daysPerWeek: { type: 'number', minimum: 1, maximum: 7 },
    durationWeeks: { anyOf: [{ type: 'number', minimum: 1 }, { type: 'null' }] },
    rationale: { type: 'string' },
    interSetRecoveryPolicy: { type: 'string' },
    progressiveOverload: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['ruleName', 'description'],
        properties: {
          ruleName: { type: 'string' },
          description: { type: 'string' },
        },
      },
    },
    days: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['dayLabel', 'focus', 'exercises'],
        properties: {
          dayLabel: { type: 'string' },
          focus: { type: 'string' },
          warmup: { type: 'array', items: { type: 'string' } },
          exercises: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              additionalProperties: false,
              required: ['exerciseName', 'equipment', 'sets'],
              properties: {
                exerciseName: { type: 'string' },
                equipment: { type: 'string' },
                notes: { type: 'string' },
                sets: {
                  type: 'array',
                  minItems: 1,
                  items: {
                    type: 'object',
                    additionalProperties: false,
                    required: ['setNumber', 'reps', 'targetWeightKg', 'targetRpe', 'restSeconds'],
                    properties: {
                      setNumber: { type: 'number', minimum: 1 },
                      reps: { type: 'number', minimum: 1, maximum: 30 },
                      targetWeightKg: {
                        anyOf: [{ type: 'number', minimum: 0 }, { type: 'null' }],
                      },
                      targetRpe: { type: 'number', minimum: 5, maximum: 10 },
                      restSeconds: { type: 'number', minimum: 20, maximum: 360 },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
} as const;

export const planResponseSchemaText = JSON.stringify(workoutPlanSchema);

export function isWorkoutPlan(value: unknown): value is WorkoutPlan {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const plan = value as Partial<WorkoutPlan>;
  return (
    typeof plan.planName === 'string' &&
    Array.isArray(plan.days) &&
    plan.days.length > 0 &&
    typeof plan.interSetRecoveryPolicy === 'string' &&
    Array.isArray(plan.progressiveOverload)
  );
}
