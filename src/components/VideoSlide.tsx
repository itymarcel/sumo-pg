import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader } from 'lucide-react';
import { Project } from '../types/Project';

interface VideoSlideProps {
  project: Project;
  isActive: boolean;
  userHasInteracted: boolean;
  slideIndex: number;
  currentIndex: number;
}

const VideoSlide: React.FC<VideoSlideProps> = ({ 
  project, 
  isActive, 
  userHasInteracted,
  slideIndex,
  currentIndex
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


  useEffect(() => {
    console.log('distance: ', distance);
    console.log('should: ', shouldLoadVideo)
  }, [distance])

  const handleVideoLoad = useCallback(() => {
    console.log(`Video loaded: ${project.title} (slide ${slideIndex})`);
    setIsLoading(false);
    setIsVideoLoaded(true);
  }, [project.title, slideIndex]);

  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.warn(`Video load error for ${project.title}:`, e);
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
  }, [project.title, shouldLoadVideo, hasError]);

  const playVideo = useCallback(async () => {
    if (!videoRef.current || !userHasInteracted || !isVideoLoaded) return;

    try {
      videoRef.current.muted = false;
      videoRef.current.volume = 1;
      await videoRef.current.play();
      hasTriedToPlay.current = true;
    } catch (error) {
      console.warn('Video autoplay failed:', error);
      try {
        videoRef.current.muted = true;
        await videoRef.current.play();
      } catch (mutedError) {
        console.warn('Muted video play failed:', mutedError);
      }
    }
  }, [userHasInteracted, isVideoLoaded]);

  const pauseVideo = useCallback(() => {
    if (videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
    }
  }, []);

  useEffect(() => {
    if (isActive && isVideoLoaded && userHasInteracted) {
      const timer = setTimeout(() => {
        playVideo();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      pauseVideo();
    }
  }, [isActive, isVideoLoaded, userHasInteracted, playVideo, pauseVideo]);

  // Removed currentTime reset - let videos resume from where they were paused

  // Cleanup when video should not be loaded anymore
  useEffect(() => {
    if (!shouldLoadVideo && videoRef.current) {
      console.log(`Unloading video: ${project.title} (slide ${slideIndex})`);
      // Pause and unload the video, but preserve position
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

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userHasInteracted) return;
    
    if (videoRef.current) {
      if (videoRef.current.paused) {
        playVideo();
      } else {
        pauseVideo();
      }
    }
  }, [userHasInteracted, playVideo, pauseVideo]);

  const handleOverlayClick = useCallback(() => {
    setShowDetails(!showDetails);
  }, [showDetails]);

  return (
    <div className="relative h-full w-full bg-black overflow-hidden">
      {/* Fullscreen Video Background */}
      {shouldLoadVideo && (
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          loop
          playsInline
          preload={distance === 0 ? "auto" : "metadata"}
          onLoadedData={handleVideoLoad}
          onError={handleVideoError}
          onClick={handleVideoClick}
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
        <div className="absolute top-8 left-8 right-8 text-white">
          <h2 className="text-2xl md:text-4xl font-bold mb-2 leading-tight">
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
          className={`absolute bottom-8 left-8 text-white transition-all duration-300 ${
            showDetails ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'
          }`}
        >
          <div className="bg-black bg-opacity-50 backdrop-blur-sm rounded-lg p-4 max-w-md">
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
        className="absolute inset-0 cursor-pointer"
        onClick={handleOverlayClick}
      />
    </div>
  );
};

export default VideoSlide;