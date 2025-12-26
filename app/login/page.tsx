import { LoginForm } from "@/components/auth/LoginForm";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login | Decision Jar",
    description: "Sign in to your account to access your shared jars and ideas.",
};

export default function LoginPage() {
    return <LoginForm />;
}
