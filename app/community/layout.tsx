import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Community Jars | Join & Discover",
    description: "Browse public decision jars. Join communities for foodies, hikers, book clubs, and more. Share ideas and decide together.",
    openGraph: {
        title: "Discover Community Jars | Decision Jar",
        description: "Join public jars to share ideas and decisions with people who share your interests.",
    },
};

export default function CommunityLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
