import { revalidatePath } from 'next/cache';

/**
 * Creates an afterChange/afterDelete hook that revalidates a specific path.
 */
export const revalidatePathHook = (path: string) => {
  return () => {
    try {
      console.log(`[Revalidation] Hook triggered for path: ${path}`);
      revalidatePath(path);
      console.log(`[Revalidation] Successfully revalidated path: ${path}`);
    } catch (err) {
      console.error(`[Revalidation] Error revalidating path ${path}:`, err);
    }
  };
};

/**
 * Creates an afterChange/afterDelete hook that revalidates all main routes.
 */
export const revalidateAllHook = () => {
  return () => {
    try {
      console.log(`[Revalidation] Hook triggered for all paths`);
      revalidatePath('/');
      revalidatePath('/news');
      revalidatePath('/fleet');
      revalidatePath('/team');
      console.log(`[Revalidation] Successfully revalidated all paths`);
    } catch (err) {
      console.error(`[Revalidation] Error revalidating all paths:`, err);
    }
  };
};
