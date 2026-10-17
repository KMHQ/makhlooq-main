import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import config from "../../payload.config";
import { importMap } from "./admin/importMap";
import "@payloadcms/next/css";

type Args = {
    children: React.ReactNode;
};

const serverFunction = async function (args: any) {
    "use server";
    return handleServerFunctions({
        ...args,
        config,
        importMap,
    });
};

export default function Layout({ children }: Args) {
    return (
        <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            (function() {
              if (typeof window === 'undefined') return;
              
              function cleanLoomStyles() {
                const styles = document.querySelectorAll('head style');
                styles.forEach(s => {
                  if (s.textContent && s.textContent.includes('body[unresolved]')) {
                    s.remove();
                  }
                });
              }

              // Watch for dynamic Loom style injections
              const observer = new MutationObserver(cleanLoomStyles);
              observer.observe(document.head, { childList: true, subtree: true });
              
              // Run once immediately
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', cleanLoomStyles);
              } else {
                cleanLoomStyles();
              }
            })();
          `,
                }}
            />
            {children}
        </RootLayout>
    );
}
