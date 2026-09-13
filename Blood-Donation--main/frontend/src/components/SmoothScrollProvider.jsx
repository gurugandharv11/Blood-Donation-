import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const SmoothScrollProvider = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Check if Lenis and GSAP are loaded
    const windowLenis = window.Lenis;
    const gsap = window.gsap;
    const ScrollTrigger = window.ScrollTrigger;

    let lenisInstance = null;

    if (windowLenis && gsap && ScrollTrigger) {
      gsap.registerPlugin(ScrollTrigger);

      // 1. Initialize Lenis Smooth Scroll Engine
      lenisInstance = new windowLenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Buttery smooth exponential physics
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.1,
        touchMultiplier: 1.8,
        infinite: false,
      });

      // Sync Lenis with GSAP ScrollTrigger
      lenisInstance.on('scroll', ScrollTrigger.update);

      const tickerFn = (time) => {
        lenisInstance.raf(time * 1000);
      };

      gsap.ticker.add(tickerFn);
      gsap.ticker.lagSmoothing(0);

      // 2. Setup GSAP ScrollTrigger Animations
      setTimeout(() => {
        // Scroll Reveal for Section Headers
        gsap.utils.toArray('.section-header, .section-title, .hero-title, .hero-subtitle').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 35 },
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 88%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // Scroll Reveal for Feature & Donor Cards (Staggered)
        gsap.utils.toArray('.feature-card, .donor-card, .stat-card, .quick-search-box').forEach((card, idx) => {
          gsap.fromTo(
            card,
            { opacity: 0, y: 50, scale: 0.96 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.9,
              delay: (idx % 3) * 0.15,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
              },
            }
          );
        });

        // Parallax 3D Depth Movement for Hero 3D Card
        const heroVisual = document.querySelector('.hero-3d-visual-wrapper');
        if (heroVisual) {
          gsap.to(heroVisual, {
            y: 80,
            rotationX: 8,
            ease: 'none',
            scrollTrigger: {
              trigger: '.hero-section',
              start: 'top top',
              end: 'bottom top',
              scrub: true,
            },
          });
        }

        // Scroll-driven 3D Blood Drop Rotation
        const bloodDrop = document.querySelector('.floating-drop-group');
        if (bloodDrop) {
          gsap.to(bloodDrop, {
            rotation: 25,
            scale: 1.08,
            ease: 'none',
            scrollTrigger: {
              trigger: 'body',
              start: 'top top',
              end: 'bottom bottom',
              scrub: 1.5,
            },
          });
        }
      }, 100);

      // Clean up on unmount or route change
      return () => {
        if (lenisInstance) {
          lenisInstance.destroy();
        }
        gsap.ticker.remove(tickerFn);
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      };
    }
  }, [location.pathname]);

  // Scroll to top smoothly on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return <>{children}</>;
};
