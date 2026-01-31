
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConciergeService } from '@/lib/services/concierge-service';
import { getConciergePromptAndMock } from '@/lib/concierge-prompts';
import { reliableGeminiCall } from '@/lib/gemini';
import { batchVerifyRecommendations } from '@/lib/ai-validator';

// Mock dependencies
vi.mock('@/lib/concierge-prompts', () => ({
    getConciergePromptAndMock: vi.fn()
}));
vi.mock('@/lib/gemini', () => ({
    reliableGeminiCall: vi.fn()
}));
vi.mock('@/lib/ai-validator', () => ({
    batchVerifyRecommendations: vi.fn()
}));

describe('ConciergeService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('generateIdeas', () => {
        const mockParams = {
            toolKey: 'MOVIE',
            configId: 'test-config',
            inputs: { watchMode: 'Cinema' },
            targetLocation: 'New York',
            isPrivate: false,
            extraInstructions: 'find good movies'
        };

        it('should return mock data if useMockData is true', async () => {
            const mockResponse = { recommendations: [{ name: 'Mock Movie', website: 'http://test.com' }] };
            (getConciergePromptAndMock as any).mockReturnValue({ mockResponse, prompt: 'prompt' });

            const result = await ConciergeService.generateIdeas({ ...mockParams, useMockData: true });

            expect(result.recommendations.length).toBe(1);
            expect(result.recommendations[0].name).toBe('Mock Movie');
            expect(getConciergePromptAndMock).toHaveBeenCalled();
            expect(reliableGeminiCall).not.toHaveBeenCalled();
        });

        it('should call Gemini and return AI results', async () => {
            (getConciergePromptAndMock as any).mockReturnValue({ prompt: 'prompt', mockResponse: {} });
            (reliableGeminiCall as any).mockResolvedValue({ recommendations: [{ name: 'AI Movie' }] });
            (batchVerifyRecommendations as any).mockResolvedValue([{ name: 'AI Movie' }]); // Return same

            const result = await ConciergeService.generateIdeas(mockParams);

            expect(reliableGeminiCall).toHaveBeenCalled();
            expect(result.recommendations[0].name).toBe('AI Movie');
        });

        it('should fallback to mock data if Gemini call fails repeatedly', async () => {
            (getConciergePromptAndMock as any).mockReturnValue({
                prompt: 'prompt',
                mockResponse: { recommendations: [{ name: 'Fallback Mock' }] }
            });
            // Fail twice logic in service uses recursion for low quality results, but for errors it relies on throw unless wrapped.
            // Wait, looking at code:
            // catch -> if (shouldUseSearch) retry without search. If that fails -> throw.
            // But wait, the catch block throws if useSearch=false. The caller handles it?

            // Actually ConciergeService doesn't catch the final error in the loop for generating?
            // "Fallback to mock if AI failed twice" -> logic is:
            // if ((!jsonResponse.recommendations || ... == 0) && attempt >= 2) -> return mock.

            // Simulate retry logic:
            // 1. First call returns results (length > 3) but validation filters them all out (length < 2).
            //    This triggers retry with attempt + 1.
            // 2. Second call returns empty results.
            //    This matches "attempt >= 2" and empty results -> triggers fallback.

            (reliableGeminiCall as any)
                .mockResolvedValueOnce({ recommendations: [{ name: 'Bad1' }, { name: 'Bad2' }, { name: 'Bad3' }, { name: 'Bad4' }] })
                .mockResolvedValueOnce({ recommendations: [] });

            (batchVerifyRecommendations as any).mockResolvedValue([]);

            // Logic calls recursively if low quality results.
            // We need to ensure logic terminates.
            // It calls `runConciergeSearch(..., attempt + 1)`

            const result = await ConciergeService.generateIdeas(mockParams);

            expect(result.recommendations[0].name).toBe('Fallback Mock');
            // Check that it was called multiple times
            expect(reliableGeminiCall).toHaveBeenCalledTimes(2);
        });

        it('should normalize URLs for Cinema inputs', async () => {
            (getConciergePromptAndMock as any).mockReturnValue({ mockResponse: { recommendations: [{ name: 'Inception', website: '' }] }, prompt: '' });

            // Using mock data path for simplicity to test normalization
            const result = await ConciergeService.generateIdeas({ ...mockParams, useMockData: true });

            // Url should be Google Search link for showtimes
            expect(result.recommendations[0].website).toContain('google.com/search');
            expect(result.recommendations[0].website).toContain('showtimes');
        });
    });
});
