"use client";

import { useEffect } from "react";

export default function WidgetClient({ ships }) {
    useEffect(() => {
        window.FleetYardsFleetchartConfig = {
            details: true,
            grouped: true,
            fleetchart: false,
            fleetchartGrouped: false,
            fleetchartScale: 50,
            groupedButton: true,
            fleetchartSlider: true,
            ships,
        };

        const existingScript = document.querySelector('script[data-fleetyards-widget="true"]');
        if (existingScript) return;

        const script = document.createElement("script");
        script.src = `https://fleetyards.net/embed-v2.js#${Date.now()}`;
        script.async = true;
        script.dataset.fleetyardsWidget = "true";
        (document.head || document.body).appendChild(script);
    }, [ships.join("|")]);

    return (
        <main className="fleet-widget-page">
            <div id="fleetyards-view" />
        </main>
    );
}
