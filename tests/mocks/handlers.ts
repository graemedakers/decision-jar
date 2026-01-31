import { http, HttpResponse } from 'msw';

export const handlers = [
    // --- Smart Prompt Mocks ---
    http.post('/api/intent/classify', async () => {
        return HttpResponse.json({
            intent: {
                intentAction: 'BULK_GENERATE',
                quantity: 5,
                topic: 'Test Topic'
            }
        });
    }),

    http.post('/api/ideas/bulk-generate', async () => {
        return HttpResponse.json({
            success: true,
            count: 5,
            ideas: []
        });
    }),

    http.post('/api/ideas', async () => {
        return HttpResponse.json({
            id: 'new-idea-id',
            description: 'New Idea',
            category: 'ACTIVITY'
        });
    }),

    // --- Concierge Mocks ---
    http.post('/api/concierge/chat', async () => {
        return HttpResponse.json({
            response: "Hello! How can I help you?",
            suggestions: ["Suggestion 1", "Suggestion 2"]
        });
    }),

    // --- Jar Data Mocks ---
    http.get('/api/jar/:id', async () => {
        return HttpResponse.json({
            id: 'test-jar-id',
            name: 'Test Jar',
            ideas: [
                { id: '1', description: 'Idea 1' },
                { id: '2', description: 'Idea 2' }
            ]
        });
    }),

    // --- User Usage Mock ---
    http.get('/api/user/ai-usage', async () => {
        return HttpResponse.json({
            remaining: 10,
            dailyLimit: 20,
            isPro: true
        });
    }),

    // --- Auth Mocks ---
    http.get('/api/auth/me', async () => {
        return HttpResponse.json({
            user: {
                id: 'user-123',
                email: 'test@example.com',
                name: 'Test User',
                isPremium: true,
                hasPaid: true,
                activeJarId: 'jar-456'
            }
        });
    })
];
