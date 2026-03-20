"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function NavigationProgress() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);

  useEffect(() => {
    if (prevPathname.current !== pathname) {
      // Page changed — complete the bar
      setWidth(100);
      timerRef.current = setTimeout(() => {
        setLoading(false);
        setWidth(0);
      }, 300);
      prevPathname.current = pathname;
    }
  }, [pathname]);

  // On click of any sidebar link, start the bar
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href === pathname || href.startsWith("http") || href.startsWith("#")) return;

      // Internal navigation — start bar
      if (timerRef.current) clearTimeout(timerRef.current);
      setLoading(true);
      setWidth(0);
      requestAnimationFrame(() => {
        setWidth(65);
      });
    }

    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [pathname]);

  if (!loading && width === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 z-50 h-[2px] bg-zinc-900 transition-all"
      style={{
        width: `${width}%`,
        opacity: width === 100 ? 0 : 1,
        transitionDuration: width === 100 ? "200ms" : "400ms",
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    />
  );
}
