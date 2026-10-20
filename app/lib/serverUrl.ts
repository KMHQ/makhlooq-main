// The Payload server URL for live preview.
export function getServerUrl() {
    return process.env.NEXT_PUBLIC_SERVER_URL || "https://kmhq.org";
}
