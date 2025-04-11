import { useEffect } from "react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Disable Chrome's scroll restoration
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    // Force immediate scroll to top
    const html = document.documentElement;
    const originalStyle = html.style.scrollBehavior;
    html.style.scrollBehavior = "auto"; // Temporarily disable smooth scrolling
    
    window.scrollTo(0, 0);

    // Restore smooth scrolling after a tiny delay
    const timeoutId = setTimeout(() => {
      html.style.scrollBehavior = originalStyle;
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [pathname]);

  // Also handle initial page load (optional, but ensures consistency)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return null; // This component doesn't render anything
}

export default ScrollToTop;