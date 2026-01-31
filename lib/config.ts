export const PRICING = {
    MONTHLY: "AU$3.99",
    ORIGINAL_MONTHLY: "AU$5.99",
    LIFETIME: "AU$59.99",
    TRIAL_DAYS: 14,
    CURRENCY: "AUD"
};

export const APP_NAME = "Spin the Jar";
export const BASE_DOMAIN = "spinthejar.com";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || `https://${BASE_DOMAIN}`;
export const EMAIL_FROM = process.env.EMAIL_FROM || `${APP_NAME} <onboarding@${BASE_DOMAIN}>`;

