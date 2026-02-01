
import { getSession } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";

type AuthSuccess = {
    authorized: true;
    user: {
        id: string;
        email?: string | null;
        [key: string]: any;
    };
    session: any;
};

type AuthFailure = {
    authorized: false;
    error: string;
    status: number;
};

export async function checkActionAuth(): Promise<AuthSuccess | AuthFailure> {
    const session = await getSession();
    if (!session?.user?.id) {
        return { authorized: false, error: "Unauthorized", status: 401 };
    }

    const limitRes = await checkRateLimit({
        id: session.user.id,
        email: session.user.email || ""
    });

    if (!limitRes.allowed) {
        return { authorized: false, error: limitRes.error || "Too Many Requests", status: 429 };
    }

    return { authorized: true, user: session.user, session };
}
