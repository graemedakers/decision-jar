import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'Terms of Service for Spin the Jar.',
    robots: {
        index: false
    }
};

export default function TermsPage() {
    return (
        <main className="min-h-screen bg-slate-950 text-slate-300 py-24 px-6">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">1. Acceptance of Terms</h2>
                    <p>By accessing and using Spin the Jar, you accept and agree to be bound by the terms and provision of this agreement.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">2. Use License</h2>
                    <p>Permission is granted to temporarily download one copy of the materials (information or software) on Spin the Jar's website for personal, non-commercial transitory viewing only.</p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold text-white">3. Disclaimer</h2>
                    <p>The materials on Spin the Jar's website are provided on an 'as is' basis. Spin the Jar makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
                </section>
            </div>
        </main>
    );
}
