import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Info } from 'lucide-react';
import { projects } from '../data/projects';
import VideoSlide from './VideoSlide';
import AudioEnableOverlay from './AudioEnableOverlay';
import InstructionsOverlay from './InstructionsOverlay';

const VideoSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userHasInteracted, setUserHasInteracted] = useState(false);
  const [isGlobalMuted, setIsGlobalMuted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);
  const [hasShownInstructions, setHasShownInstructions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const slides = projects.map(project => ({ type: 'video' as const, project }));

  const handleUserInteraction = useCallback(() => {
    if (!userHasInteracted) {
      setUserHasInteracted(true);
    }
    setShowOverlay(false);
    
    // Show instructions overlay only once after AudioEnableOverlay is dismissed
    if (!hasShownInstructions) {
      setShowInstructions(true);
      setHasShownInstructions(true);
    }
    
    // Resume the currently active video after closing overlay
    setTimeout(() => {
      const allVideos = document.querySelectorAll('video');
      allVideos.forEach((video, index) => {
        if (index === currentIndex && video.paused) {
          try {
            video.muted = isGlobalMuted;
            video.volume = isGlobalMuted ? 0 : 1;
            video.play();
            console.log('Resumed active video:', video.currentSrc);
          } catch (error) {
            console.warn('Failed to resume video:', error);
          }
        }
      });
    }, 100);
  }, [userHasInteracted, currentIndex, isGlobalMuted, hasShownInstructions]);

  const toggleGlobalMute = useCallback(() => {
    const newMutedState = !isGlobalMuted;
    setIsGlobalMuted(newMutedState);
    
    // Mute/unmute all video elements
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video) => {
      video.muted = newMutedState;
    });
  }, [isGlobalMuted]);

  const showInfoOverlay = useCallback(() => {
    console.log('showInfoOverlay clicked, current showOverlay:', showOverlay);
    setShowOverlay(true);
    console.log('setShowOverlay(true) called');
    
    // Pause all videos
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach((video) => {
      video.pause();
    });
  }, [showOverlay]);

  const scrollToSlide = useCallback((index: number) => {
    const container = containerRef.current;
    if (!container) return;

    const slideElement = container.querySelector(`[data-slide-index="${index}"]`);
    if (slideElement) {
      slideElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, []);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const nextIndex = Math.min(currentIndex + 1, slides.length - 1);
      if (nextIndex !== currentIndex) {
        scrollToSlide(nextIndex);
      }
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      const prevIndex = Math.max(currentIndex - 1, 0);
      if (prevIndex !== currentIndex) {
        scrollToSlide(prevIndex);
      }
    } else if (event.key === 'm' || event.key === 'M') {
      event.preventDefault();
      toggleGlobalMute();
    } else if (event.key === ' ') {
      event.preventDefault();
      showInfoOverlay();
    }
  }, [currentIndex, slides.length, scrollToSlide, toggleGlobalMute, showInfoOverlay]);

  useEffect(() => {
    const handleClick = () => handleUserInteraction();
    
    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeyDown);
    
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleUserInteraction, handleKeyDown]);

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
            key={slide.project.id}
            data-slide-index={index}
            className="h-screen w-full snap-start"
          >
            <VideoSlide
              project={slide.project}
              isActive={index === currentIndex}
              userHasInteracted={userHasInteracted}
              slideIndex={index}
              currentIndex={currentIndex}
              isGlobalMuted={isGlobalMuted}
            />
          </div>
        ))}
      </div>
      
      {/* Control Buttons */}
      {userHasInteracted && (
        <div className="fixed bottom-4 top-auto right-4 md:bottom-auto md:top-6 md:right-6 z-30 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              showInfoOverlay();
            }}
            className="p-1 text-white transition-colors"
          >
            <Info size={24} />
          </button>
          <button
            onClick={toggleGlobalMute}
            className="p-1 text-white transition-colors"
          >
            {isGlobalMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      )}
      
      <AudioEnableOverlay 
        show={showOverlay}
        onEnable={handleUserInteraction}
      />
      
      <InstructionsOverlay 
        show={showInstructions}
      />
    </>
  );
};

export default VideoSlider;