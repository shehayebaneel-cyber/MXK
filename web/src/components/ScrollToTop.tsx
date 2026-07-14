import { useEffect } from "react";
import { useLocation } from "react-router-dom";

if (typeof history !== "undefined" && "scrollRestoration" in history) history.scrollRestoration = "manual";

/** Start every new page at the top; jump to a #section when the URL has a hash. */
export function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (el) { el.scrollIntoView({ behavior: "smooth" }); return; }
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname, hash]);
  return null;
}
