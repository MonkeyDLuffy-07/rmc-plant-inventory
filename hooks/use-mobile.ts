import * as React from "react";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(
    undefined,
  );

  React.useEffect(() => {
    // Guard for environments where window is not defined (SSR, tests)
    if (typeof window === "undefined") {
      return;
    }

    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`,
    );

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches);
    };

    // Initial value
    setIsMobile(mql.matches);

    // Modern browsers: addEventListener
    mql.addEventListener("change", onChange);

    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, []);

  return !!isMobile;
}
