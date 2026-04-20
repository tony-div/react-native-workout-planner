import type { Request, Response } from 'express';

import { createWorkoutHandler } from '../src/server/handler';

const mockGenerateContent = jest.fn();

jest.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: mockGenerateContent,
    }),
  })),
}));

const samplePlan = {
  planName: '4-Day Strength Builder',
  primaryGoal: 'strength',
  trainingLevel: 'intermediate',
  daysPerWeek: 4,
  durationWeeks: 8,
  rationale: 'Progressive barbell-based plan with controlled volume.',
  interSetRecoveryPolicy: 'Compounds 150-210s, accessories 60-90s.',
  progressiveOverload: [
    {
      ruleName: 'Top set progression',
      description: 'Increase 2.5% when all reps achieved at target RPE.',
    },
  ],
  days: [
    {
      dayLabel: 'Day 1',
      focus: 'Lower Strength',
      exercises: [
        {
          exerciseName: 'Back Squat',
          equipment: 'barbell',
          sets: [
            {
              setNumber: 1,
              reps: 5,
              targetWeightKg: 100,
              targetRpe: 8,
              restSeconds: 180,
            },
            {
              setNumber: 2,
              reps: 5,
              targetWeightKg: 100,
              targetRpe: 8,
              restSeconds: 180,
            },
          ],
        },
        {
          exerciseName: 'Romanian Deadlift',
          equipment: 'barbell',
          sets: [
            {
              setNumber: 1,
              reps: 8,
              targetWeightKg: 80,
              targetRpe: 8,
              restSeconds: 120,
            },
            {
              setNumber: 2,
              reps: 8,
              targetWeightKg: 80,
              targetRpe: 8,
              restSeconds: 120,
            },
          ],
        },
        {
          exerciseName: 'Leg Press',
          equipment: 'machines',
          sets: [
            {
              setNumber: 1,
              reps: 10,
              targetWeightKg: null,
              targetRpe: 8,
              restSeconds: 90,
            },
            {
              setNumber: 2,
              reps: 10,
              targetWeightKg: null,
              targetRpe: 8,
              restSeconds: 90,
            },
          ],
        },
        {
          exerciseName: 'Calf Raise',
          equipment: 'machines',
          sets: [
            {
              setNumber: 1,
              reps: 12,
              targetWeightKg: null,
              targetRpe: 8,
              restSeconds: 60,
            },
            {
              setNumber: 2,
              reps: 12,
              targetWeightKg: null,
              targetRpe: 8,
              restSeconds: 60,
            },
          ],
        },
      ],
    },
  ],
};

function createMockResponse() {
  const response: Partial<Response> = {};
  response.status = jest.fn().mockReturnValue(response);
  response.json = jest.fn().mockReturnValue(response);
  return response as Response;
}

describe('createWorkoutHandler', () => {
  beforeEach(() => {
    mockGenerateContent.mockReset();
  });

  it('returns a JSON workout plan with 200 status', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => JSON.stringify(samplePlan),
      },
    });

    const handler = createWorkoutHandler({ geminiApiKey: 'test-key' });
    const req = { body: { daysPerWeek: 4, trainingLevel: 'intermediate' } } as Request;
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(samplePlan);
  });

  it('returns 400 with error payload when model response is invalid JSON', async () => {
    mockGenerateContent.mockResolvedValue({
      response: {
        text: () => 'not-valid-json',
      },
    });

    const handler = createWorkoutHandler({ geminiApiKey: 'test-key' });
    const req = { body: { daysPerWeek: 4 } } as Request;
    const res = createMockResponse();

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: expect.stringContaining('Invalid JSON') }),
    );
  });
});
