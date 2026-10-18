// The Payload server URL for live preview: the runtime value injected by the layout, else the build-time env.
export function getServerUrl() {
    return (typeof window !== "undefined" && window.__SERVER_URL__) || process.env.NEXT_PUBLIC_SERVER_URL || "https://kmhq.org";
}
