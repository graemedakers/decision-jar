import { vi } from 'vitest';

export class MockNextResponse extends Response {
    static json(data: any, init?: any) {
        const body = JSON.stringify(data);
        const res = new Response(body, init);
        return Object.assign(res, {
            json: async () => data
        });
    }
    static next() { return new Response(); }
    static redirect(url: string) { return Response.redirect(url); }
}

export const NextResponse = MockNextResponse;
export class NextRequest extends Request { }
