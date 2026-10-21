import path from "path";

// Upload collections store files in <UPLOADS_DIR>/<slug>, defaulting to the project root (./media, ./avatars).
export function uploadDir(slug: string) {
    return path.resolve(process.env.UPLOADS_DIR || ".", slug);
}
