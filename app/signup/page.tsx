import { SignupForm } from "@/components/auth/SignupForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
    title: "Sign Up | Decision Jar",
    description: "Create a Decision Jar account to start making better collective decisions.",
};

export default function SignupPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-accent/20 rounded-full blur-[120px] animate-pulse-glow" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: "2s" }} />
            </div>

            <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
                <SignupForm />
            </Suspense>
        </main>
    );
}
