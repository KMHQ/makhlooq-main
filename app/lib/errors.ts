export function errorMessage(error: unknown, fallback = "Unexpected error") {
    return error instanceof Error ? error.message : typeof error === "string" ? error : fallback;
}
