import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Explore Tools & Ideas",
    description: "Discover date night planners, weekend itineraries, catering tools, and more ways to use your Decision Jar.",
};

export default function ExploreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
