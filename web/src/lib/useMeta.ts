import { useEffect } from "react";

const setTag = (selector: string, attr: string, value: string) => {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const [, key, val] = /\[(.+?)="(.+?)"\]/.exec(selector) ?? [];
    if (key && val) el.setAttribute(key, val);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value);
};

/** Per-page SEO: sets the document title + description + og tags. */
export function useMeta(title: string, description?: string) {
  useEffect(() => {
    document.title = title;
    if (description) {
      setTag('meta[name="description"]', "content", description);
      setTag('meta[property="og:description"]', "content", description);
    }
    setTag('meta[property="og:title"]', "content", title);
  }, [title, description]);
}
