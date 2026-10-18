import { NextResponse, type NextRequest } from "next/server";

const ALLOWED_HOSTS = new Set(["api.fleetyards.net", "fleetyards.net"]);

export async function GET(request: NextRequest) {
    const urlStr = request.nextUrl.searchParams.get("url");
    try {
        if (!urlStr) {
            return new NextResponse("Missing URL", { status: 400 });
        }

        if (!ALLOWED_HOSTS.has(new URL(urlStr).hostname)) {
            return new NextResponse("Forbidden hostname", { status: 403 });
        }

        const response = await fetch(urlStr, {
            headers: { Accept: "*/*", "User-Agent": "Makhlooq-App/1.0" },
        });

        if (!response.ok) {
            return new NextResponse(`Failed to fetch model: ${response.status}`, { status: response.status });
        }

        return new NextResponse(await response.arrayBuffer(), {
            headers: {
                "Content-Type": response.headers.get("content-type") || "application/octet-stream",
                "Cache-Control": "public, max-age=31536000, immutable",
                "Access-Control-Allow-Origin": "*",
            },
        });
    } catch (error) {
        console.error("Model proxy error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
