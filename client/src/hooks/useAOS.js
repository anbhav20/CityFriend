import { useEffect } from "react";

/**
 * useAOS — lightweight scroll-animation hook (no external library)
 * 
 * Usage:
 *   1. Call useAOS() once in your top-level component (e.g. Landing.jsx)
 *   2. Add  data-aos="fade-up"  (or fade-left / fade-right / zoom-in) to any element
 *   3. Optionally add  data-aos-delay="200"  (ms) for staggered reveals
 */
const useAOS = () => {
  useEffect(() => {
    // Inject CSS only once
    const STYLE_ID = "__aos_styles__";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        [data-aos] {
          opacity: 0;
          transition: opacity 0.65s ease, transform 0.65s ease;
        }
        [data-aos="fade-up"]    { transform: translateY(40px); }
        [data-aos="fade-down"]  { transform: translateY(-40px); }
        [data-aos="fade-left"]  { transform: translateX(50px); }
        [data-aos="fade-right"] { transform: translateX(-50px); }
        [data-aos="zoom-in"]    { transform: scale(0.88); }
        [data-aos].aos-animate  { opacity: 1 !important; transform: none !important; }
      `;
      document.head.appendChild(style);
    }

    const elements = document.querySelectorAll("[data-aos]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const delay = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
            setTimeout(() => el.classList.add("aos-animate"), delay);
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    elements.forEach((el) => {
      // Trigger immediately if already in viewport (e.g. above-fold)
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        const delay = parseInt(el.getAttribute("data-aos-delay") || "0", 10);
        setTimeout(() => el.classList.add("aos-animate"), delay + 80);
      } else {
        observer.observe(el);
      }
    });

    return () => observer.disconnect();
  }, []);
};

export default useAOS;
