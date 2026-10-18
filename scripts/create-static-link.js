import fs from "fs";
import path from "path";

console.log("Running postbuild script to fix Hostinger static files...");

const nextStaticDir = path.resolve(import.meta.dirname, "..", ".next", "static");
const nextPublicDir = path.resolve(import.meta.dirname, "..", "_next");
const symlinkPath = path.join(nextPublicDir, "static");

try {
    // Ensure the _next directory exists
    if (!fs.existsSync(nextPublicDir)) {
        fs.mkdirSync(nextPublicDir);
    }

    // If the link/folder already exists, remove it first
    if (fs.existsSync(symlinkPath)) {
        fs.rmSync(symlinkPath, { recursive: true, force: true });
    }

    // Try to create a symlink (Works perfectly on Linux/Hostinger)
    try {
        fs.symlinkSync(nextStaticDir, symlinkPath, "dir");
        console.log("✅ Successfully created symlink from .next/static to _next/static");
    } catch (symlinkErr) {
        console.log("⚠️ Symlink failed, falling back to copying files...", symlinkErr.message);
        // Fallback: Copy files directly (useful for Windows without admin rights)
        fs.cpSync(nextStaticDir, symlinkPath, { recursive: true });
        console.log("✅ Successfully copied .next/static to _next/static");
    }
} catch (err) {
    console.error("❌ Error during static file fix:", err);
}
