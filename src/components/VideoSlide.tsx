import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { Project } from '../types/Project';

interface VideoSlideProps {
  project: Project;
  isActive: boolean;
  userHasInteracted: boolean;
  slideIndex: number;
  currentIndex: number;
  isGlobalMuted: boolean;
}

const VideoSlide: React.FC<VideoSlideProps> = ({ 
  project, 
  isActive, 
  userHasInteracted,
  slideIndex,
  currentIndex,
  isGlobalMuted
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTriedToPlay = useRef(false);

  // Intelligent preloading strategy:
  // - Always load current video (distance 0)
  // - Preload next video (distance 1) 
  // - Don't load videos more than 1 slide away
  const distance = Math.abs(slideIndex - currentIndex);
  const shouldLoadVideo = distance <= 1;

  const handleVideoLoad = useCallback((eventType: string) => {
    console.log(`Video ${eventType}: ${project.title} (slide ${slideIndex})`);
    setIsLoading(false);
    setIsVideoLoaded(true);
  }, [project.title, slideIndex]);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>, eventType: string) => {
    const target = e.target as HTMLElement;
    const isSourceError = target.tagName === 'SOURCE';
    
    console.warn(`Video ${eventType} for ${project.title} (${isSourceError ? 'source' : 'video'} error):`, e);
    
    // Only set error state for actual video errors, not source errors during cleanup
    if (!isSourceError || shouldLoadVideo) {
      setIsLoading(false);
      setHasError(true);
      
      // Attempt recovery after a delay for transient network issues
      setTimeout(() => {
        if (shouldLoadVideo && videoRef.current && hasError) {
          console.log(`Retrying video load for ${project.title}`);
          setHasError(false);
          setIsLoading(true);
          videoRef.current.load();
        }
      }, 3000);
    } else {
      console.log(`Ignoring source error during cleanup for ${project.title}`);
    }
  }, [project.title, shouldLoadVideo, hasError]);

  const handleVideoSuspend = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log(`Video suspend for ${project.title} (normal behavior):`, e);
    // Don't treat suspend as an error - it's normal when loading is paused
  }, [project.title]);

  const playVideo = useCallback(async () => {
    if (!videoRef.current || !userHasInteracted || !isVideoLoaded) return;

    try {
      videoRef.current.muted = isGlobalMuted;
      videoRef.current.volume = isGlobalMuted ? 0 : 1;
      await videoRef.current.play();
      hasTriedToPlay.current = true;
      console.log(`Successfully playing ${isGlobalMuted ? 'muted' : 'with audio'}: ${project.title}`);
    } catch (error) {
      console.warn('Video autoplay failed:', error);
      try {
        videoRef.current.muted = true;
        await videoRef.current.play();
        console.warn(`Fallback to muted play: ${project.title}`);
      } catch (mutedError) {
        console.warn('Muted video play failed:', mutedError);
      }
    }
  }, [userHasInteracted, isVideoLoaded, project.title, isGlobalMuted]);

  const pauseVideo = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      console.log(`Pausing video: ${project.title}`);
      videoRef.current.pause();
    }
  }, [project.title]);

  useEffect(() => {
    if (isActive && isVideoLoaded && userHasInteracted) {
      const timer = setTimeout(() => {
        playVideo();
      }, 1);
      return () => clearTimeout(timer);
    } else {
      pauseVideo();
    }
  }, [isActive, isVideoLoaded, userHasInteracted, playVideo, pauseVideo]);

  // Cleanup when video should not be loaded anymore
  useEffect(() => {
    if (!shouldLoadVideo && videoRef.current) {
      console.log(`Unloading video: ${project.title} (slide ${slideIndex})`);
      
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.load();
      
      // Reset component state
      setIsLoading(true);
      setIsVideoLoaded(false);
      setHasError(false);
      hasTriedToPlay.current = false;
    } else if (shouldLoadVideo && !isVideoLoaded && !hasError) {
      console.log(`Should load video: ${project.title} (slide ${slideIndex}, distance: ${distance})`);
    }
  }, [shouldLoadVideo, project.title, slideIndex, distance, isVideoLoaded, hasError]);

  // const handleVideoClick = useCallback((e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   if (!userHasInteracted) return;
    
  //   if (videoRef.current) {
  //     playVideo();
  //   }
  // }, [userHasInteracted, playVideo, pauseVideo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Try to play all video elements in the DOM
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(async (video) => {
      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
        console.log('Touch activated video:', video.currentSrc);
      } catch (error) {
        // Fallback to muted if unmuted fails
        try {
          video.muted = true;
          await video.play();
          console.log('Touch activated video (muted):', video.currentSrc);
        } catch (mutedError) {
          console.warn('Touch could not activate video:', video.currentSrc, mutedError);
        }
      }
    });
  }

  const handleOverlayClick = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  return (
    <div 
      className="relative h-full w-full bg-black overflow-hidden cursor-default"
      onTouchStart={handleTouchStart}>
      {/* Fullscreen Video Background */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          preload={distance === 0 ? "auto" : "metadata"}
          onLoadedMetadata={() => handleVideoLoad('loadedmetadata')}
          onCanPlay={() => handleVideoLoad('canplay')}
          onLoadedData={() => handleVideoLoad('loadeddata')}
          onError={(e) => handleVideoError(e, 'error')}
          onStalled={(e) => handleVideoError(e, 'stalled')}
          onSuspend={handleVideoSuspend}
          onAbort={(e) => handleVideoError(e, 'abort')}
          // onClick={handleVideoClick}
        >
          <source src={project.videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Loading State */}
      {isLoading && shouldLoadVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black">
          <Loader className="animate-spin text-white" size={16} />
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-black text-white">
          <div className="text-center">
            <p className="text-lg mb-2">Failed to load video</p>
            <p className="text-sm opacity-70">{project.title}</p>
          </div>
        </div>
      )}

      {/* Overlay Content */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Title and Subtitle - Always Visible */}
        <div className="absolute top-4 left-4 right-4 text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-1 leading-tight">
            {project.title}
          </h2>
          {project.subtitle && (
            <p className="text-lg md:text-xl opacity-80 leading-tight">
              {project.subtitle}
            </p>
          )}
        </div>

        {/* Services and Client Info - Toggleable */}
        <div 
          className={`absolute flex items-center justify-center left-0 bottom-0 w-full h-full text-white transition-all duration-300 ${
            showDetails ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
        >
          <div className="bg-white rounded-lg p-4 max-w-md text-black">
            <div className="mb-4">
              <h4 className="font-bold mb-2">Services</h4>
              <ul className="text-sm space-y-1">
                {project.services.map((service, index) => (
                  <li key={index} className="opacity-90">
                    • {service}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-2">Client</h4>
              <p className="text-sm opacity-90">{project.client}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Invisible Click Handler for Toggle */}
      <div 
        className="absolute inset-0 cursor-default"
        onClick={handleOverlayClick}
      />
    </div>
  );
};

export default VideoSlide;