import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPost = vi.fn();
vi.mock('../../client.js', () => ({
  createClient: () => ({ post: mockPost }),
}));

import { onboardStep } from '../../commands/onboard.js';

describe('onboard command', () => {
  beforeEach(() => vi.clearAllMocks());

  it('sends onboarding message and returns agent response', async () => {
    mockPost.mockResolvedValue({
      response: 'What cuisines do you enjoy?',
      step: 1,
      totalSteps: 5,
    });
    const output: string[] = [];
    const result = await onboardStep('I love Japanese food', (msg: string) => output.push(msg));
    expect(mockPost).toHaveBeenCalledWith('/recommendations', expect.objectContaining({
      message: 'I love Japanese food',
      constraints: { onboarding: true },
    }));
    expect(result).toBeDefined();
  });

  it('handles completed onboarding', async () => {
    mockPost.mockResolvedValue({
      response: 'All set! Your taste profile is ready.',
      onboardingComplete: true,
    });
    const output: string[] = [];
    await onboardStep('cozy and quiet', (msg: string) => output.push(msg));
    expect(output.some(l => l.includes('ready') || l.includes('All set'))).toBe(true);
  });
});
