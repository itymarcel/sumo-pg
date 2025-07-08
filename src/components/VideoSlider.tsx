import React, { useState, useEffect, useRef, useCallback } from 'react';
import { projects } from '../data/projects';
import VideoSlide from './VideoSlide';
import IntroSlide from './IntroSlide';
import AudioEnableOverlay from './AudioEnableOverlay';

const VideoSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const slides = [
    { type: 'intro' as const },
    ...projects.map(project => ({ type: 'video' as const, project }))
  ];

  const handleUserInteraction = useCallback(() => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
    }
  }, [userHasInteracted]);

  useEffect(() => {
    const handleClick = () => handleUserInteraction();
    const handleKeyDown = () => handleUserInteraction();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUserInteraction]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create intersection observer to track which slide is visible
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Find the entry with the highest intersection ratio
        let mostVisibleEntry = entries[0];
        let highestRatio = 0;

        entries.forEach((entry) => {
          if (entry.intersectionRatio > highestRatio) {
            highestRatio = entry.intersectionRatio;
            mostVisibleEntry = entry;
          }
        });

        // Only update if the most visible slide has significant visibility
        if (mostVisibleEntry && highestRatio > 0.5) {
          const slideIndex = parseInt(mostVisibleEntry.target.getAttribute('data-slide-index') || '0');
          if (slideIndex !== currentIndex) {
            setCurrentIndex(slideIndex);
          }
        }
      },
      {
        root: container,
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: '0px'
      }
    );

    // Observer slides with a small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      const slideElements = container.querySelectorAll('[data-slide-index]');
      slideElements.forEach((slide) => {
        observerRef.current?.observe(slide);
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [currentIndex]);

  return (
    <>
      <div 
        ref={containerRef}
        className="h-screen w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.type === 'intro' ? 'intro' : slide.project.id}
            data-slide-index={index}
            className="h-screen w-full snap-start"
          >
            {slide.type === 'intro' ? (
              <IntroSlide 
                isActive={index === currentIndex}
                userHasInteracted={userHasInteracted}
              />
            ) : (
              <VideoSlide
                project={slide.project}
                isActive={index === currentIndex}
                userHasInteracted={userHasInteracted}
                slideIndex={index}
                currentIndex={currentIndex}
              />
            )}
          </div>
        ))}
      </div>
      
      <AudioEnableOverlay 
        show={!userHasInteracted}
        onEnable={handleUserInteraction}
      />
    </>
  );
};

export default VideoSlider;