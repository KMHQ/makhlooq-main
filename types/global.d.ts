declare global {
    interface Window {
        /** Injected by app/(app)/layout.tsx for Payload live preview. */
        __SERVER_URL__?: string;
    }
}

export {};
