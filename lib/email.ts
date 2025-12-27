import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email not sent:", { to, subject });
        return;
    }

    try {
        const data = await resend.emails.send({
            from: 'Decision Jar <onboarding@resend.dev>', // Update this with your verified domain
            to: [to],
            subject: subject,
            html: html,
        });
        return data;
    } catch (error) {
        console.error("Failed to send email:", error);
        // Don't throw, just log.
    }
}
