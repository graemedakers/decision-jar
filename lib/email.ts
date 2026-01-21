import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
    if (!process.env.RESEND_API_KEY) {
        console.warn("RESEND_API_KEY is not set. Email not sent:", { to, subject });
        return;
    }

    try {
        const data = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'Decision Jar <onboarding@resend.dev>', // Uses env var or defaults to test domain
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

export async function sendPaymentDueEmail(userEmail: string, userName: string | null) {
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ec4899 0%, #f43f5e 100%); color: white; padding: 30px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { background: #fff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
            .button { display: inline-block; background: #ec4899; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; padding: 20px; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔔 Payment Issue</h1>
            </div>
            <div class="content">
                <p>Hi ${userName || 'there'},</p>
                
                <div class="warning">
                    <strong>⚠️ Action Required:</strong> We had trouble processing your payment for Decision Jar Premium.
                </div>
                
                <p>Your subscription is currently <strong>past due</strong>. This typically happens when:</p>
                <ul>
                    <li>Your card has expired</li>
                    <li>There are insufficient funds</li>
                    <li>Your bank declined the charge</li>
                </ul>
                
                <p><strong>What happens next?</strong></p>
                <p>We'll automatically retry the payment over the next few days. However, to avoid any interruption to your Premium access, we recommend updating your payment information now.</p>
                
                <div style="text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing" class="button">
                        Update Payment Method
                    </a>
                </div>
                
                <p>If you have any questions or need assistance, just reply to this email—we're here to help!</p>
                
                <p>Best regards,<br>The Decision Jar Team</p>
            </div>
            <div class="footer">
                <p>Decision Jar | spinthejar.com</p>
                <p>You're receiving this because your subscription requires attention.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    return sendEmail({
        to: userEmail,
        subject: '⚠️ Payment Issue - Action Required',
        html
    });
}

