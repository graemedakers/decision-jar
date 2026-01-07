
import { describe, it, expect } from 'vitest';
import { apiSuccess, apiError } from '@/lib/api-response';

describe('API Response Helpers', () => {
    it('apiSuccess returns correct format', async () => {
        const response = apiSuccess({ foo: 'bar' });
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toEqual({
            success: true,
            data: { foo: 'bar' }
        });
    });

    it('apiError returns correct format', async () => {
        const response = apiError('Something went wrong', 400, 'ERR_CODE');
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json.success).toBe(false);
        expect(json.error).toBe('Something went wrong');
        expect(json.code).toBe('ERR_CODE');
        expect(json.timestamp).toBeDefined();
    });
});
