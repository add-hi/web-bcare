// src/hooks/useIdle.js
"use client";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * @param {object} opts
 * @param {number} opts.timeout ms sampai dianggap idle (default 60_000)
 * @param {boolean} opts.considerHiddenIdle jika tab hidden langsung dianggap idle (default false)
 * @param {boolean} opts.syncAcrossTabs sinkronkan aktif/idle antar tab (default true)
 */
export default function useIdle({
    timeout = 60_000,
    considerHiddenIdle = false,
    syncAcrossTabs = true,
} = {}) {
    const [isIdle, setIsIdle] = useState(false);
    const [lastActive, setLastActive] = useState(Date.now());
    const timerRef = useRef(null);

    const startTimer = useCallback(() => {
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setIsIdle(true), timeout);
    }, [timeout]);

    const markActive = useCallback(() => {
        setIsIdle(false);
        setLastActive(Date.now());
        startTimer();
        if (syncAcrossTabs) {
            // ping antar tab supaya activity di satu tab dianggap aktif di tab lain
            localStorage.setItem("__activity_ping__", String(Date.now()));
        }
    }, [startTimer, syncAcrossTabs]);

    // Daftarkan event aktivitas user
    useEffect(() => {
        
        const handler = () => markActive();
        const events = ["mousemove", "mousedown", "keydown", "touchstart", "wheel", "scroll"];
        events.forEach((e) => window.addEventListener(e, handler, { passive: true }));

        const onVisibility = () => {
            if (considerHiddenIdle && document.hidden) {
                clearTimeout(timerRef.current);
                setIsIdle(true);
            } else {
                handler();
            }
        };
        document.addEventListener("visibilitychange", onVisibility);

        // initial timer
        startTimer();

        return () => {
            clearTimeout(timerRef.current);
            events.forEach((e) => window.removeEventListener(e, handler));
            document.removeEventListener("visibilitychange", onVisibility);
        };
    }, [markActive, startTimer, considerHiddenIdle]);

    // Sinkron antar tab
    useEffect(() => {
        if (!syncAcrossTabs) return;
        const onStorage = (e) => {
            if (e.key === "__activity_ping__") markActive();
        };
        window.addEventListener("storage", onStorage);
        return () => window.removeEventListener("storage", onStorage);
    }, [markActive, syncAcrossTabs]);

    const resetIdle = useCallback(() => {
        setIsIdle(false);
        markActive();
    }, [markActive]);

    return {
        isIdle,
        lastActive,                // timestamp ms
        idleForMs: Date.now() - lastActive,
        resetIdle,
        // helper cepat untuk tahu tab aktif atau enggak
        isTabActive: typeof document !== "undefined" ? !document.hidden && document.hasFocus() : true,
    };
}
