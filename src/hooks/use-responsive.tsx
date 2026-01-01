import * as React from "react";

// Breakpoints matching Tailwind defaults
const BREAKPOINTS = {
  sm: 640,  // Mobile
  md: 768,  // Tablet
  lg: 1024, // Desktop
  xl: 1280, // Large Desktop
};

export type ScreenSize = 'mobile' | 'tablet' | 'desktop' | 'large';

export function useResponsive() {
  const [screenSize, setScreenSize] = React.useState<ScreenSize>('desktop');
  const [width, setWidth] = React.useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1024);

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setWidth(w);
      
      if (w < BREAKPOINTS.sm) {
        setScreenSize('mobile');
      } else if (w < BREAKPOINTS.md) {
        setScreenSize('mobile');
      } else if (w < BREAKPOINTS.lg) {
        setScreenSize('tablet');
      } else if (w < BREAKPOINTS.xl) {
        setScreenSize('desktop');
      } else {
        setScreenSize('large');
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    screenSize,
    width,
    isMobile: screenSize === 'mobile',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop' || screenSize === 'large',
    isTouchDevice: screenSize === 'mobile' || screenSize === 'tablet',
  };
}
