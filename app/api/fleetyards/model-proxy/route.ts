import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        const urlStr = new URL(request.url).searchParams.get("url");
        if (!urlStr) {
            return new NextResponse("Missing URL", { status: 400 });
        }

        const parsed = new URL(urlStr);
        if (parsed.hostname !== "api.fleetyards.net" && parsed.hostname !== "fleetyards.net") {
            return new NextResponse("Forbidden hostname", { status: 403 });
        }

        const response = await fetch(urlStr, {
            headers: {
                Accept: "*/*",
                "User-Agent": "Makhlooq-App/1.0",
            },
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch model: ${response.status}`, { status: response.status });
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";

        // We get the body as an ArrayBuffer and return it directly.
        const body = await response.arrayBuffer();

        return new NextResponse(body, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("Model proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
