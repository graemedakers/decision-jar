import { NextResponse } from "next/server";
import { getJars } from "@/app/actions/jars";

export async function GET() {
    try {
        const result = await getJars();
        if (result.success) {
            return NextResponse.json(result.data);
        } else {
            return NextResponse.json({ error: result.error }, { status: result.status || 500 });
        }
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
