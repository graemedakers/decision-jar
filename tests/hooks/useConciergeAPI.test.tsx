import { renderHook, act, waitFor } from '@testing-library/react';
import { useConciergeAPI } from '@/hooks/concierge/useConciergeAPI';
import { vi, describe, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/tests/mocks/server';

describe('useConciergeAPI', () => {
    it('should add an idea successfully', async () => {
        const { result } = renderHook(() => useConciergeAPI());

        let response: any;
        await act(async () => {
            response = await result.current.apiAddIdea({
                description: 'New Idea',
                details: 'Details',
                category: 'ACTIVITY',
                cost: '$',
                duration: '60',
                activityLevel: 'MEDIUM',
                indoor: true,
                isPrivate: false,
                timeOfDay: 'ANY'
            });
        });

        expect(response.success).toBe(true);
        expect(response.data.id).toBe('new-idea-id');
    });

    it('should handle API errors gracefully', async () => {
        // Force error on add idea
        server.use(
            http.post('/api/ideas', () => {
                return new HttpResponse(null, { status: 500 });
            })
        );

        const { result } = renderHook(() => useConciergeAPI());

        let response: any;
        await act(async () => {
            response = await result.current.apiAddIdea({
                description: 'Break it',
                details: '',
                category: 'ACTIVITY',
                cost: '$',
                duration: '60',
                activityLevel: 'MEDIUM',
                indoor: true,
                isPrivate: false,
                timeOfDay: 'ANY'
            });
        });

        expect(response.success).toBe(false);
        expect(response.error).toBeDefined();
    });
});
