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
  const [progress, setProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasTriedToPlay = useRef(false);

  // Intelligent preloading strategy:
  // - Always load current video (distance 0)
  // - For Safari/iOS: Only load current video to prevent memory issues
  // - For other browsers: Also preload next video (distance 1)
  const distance = Math.abs(slideIndex - currentIndex);
  const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) || /iPad|iPhone|iPod/.test(navigator.userAgent);
  // const shouldLoadVideo = isSafari ? distance === 0 : distance <= 1;
  const shouldLoadVideo = distance <= 1;

  const handleVideoLoad = useCallback((eventType: string) => {
    setIsLoading(false);
    setIsVideoLoaded(true);
  }, [project.title, slideIndex]);

  const handleTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      if (duration > 0) {
        setProgress((currentTime / duration) * 100);
      }
    }
  }, []);

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
    // console.log(`Video suspend for ${project.title} (normal behavior):`, e);
    // Don't treat suspend as an error - it's normal when loading is paused
  }, [project.title]);

  const handleVideoStalled = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log(`Video stalled for ${project.title} (network slow, waiting...)`);
    // Don't immediately treat stalled as an error - it's normal on slow networks
    // Only set error after a longer timeout to give slow networks time
    setTimeout(() => {
      if (videoRef.current && videoRef.current.readyState < 3 && shouldLoadVideo) {
        console.warn(`Video still stalled after timeout for ${project.title}`);
        setHasError(true);
        setIsLoading(false);
      }
    }, 15000); // Wait 15 seconds for slow networks
  }, [project.title, shouldLoadVideo]);

  const handleVideoAbort = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    console.log(`Video abort for ${project.title} (likely user navigation)`);
    // Don't treat abort as an error - it's normal during navigation
    // Only reset loading state if we should still be loading
    if (shouldLoadVideo) {
      setIsLoading(true);
      setIsVideoLoaded(false);
    }
  }, [project.title, shouldLoadVideo]);

  const playVideo = useCallback(async () => {
    if (!videoRef.current || !userHasInteracted || !isVideoLoaded) return;

    try {
      videoRef.current.muted = isGlobalMuted;
      videoRef.current.volume = isGlobalMuted ? 0 : 1;
      await videoRef.current.play();
      hasTriedToPlay.current = true;
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
      videoRef.current.pause();
      videoRef.current.src = '';
      videoRef.current.load();
      
      // Reset component state
      setIsLoading(true);
      setIsVideoLoaded(false);
      setHasError(false);
      setProgress(0);
      hasTriedToPlay.current = false;
    } else if (shouldLoadVideo && !isVideoLoaded && !hasError) {
      // console.log(`Should load video: ${project.title} (slide ${slideIndex}, distance: ${distance})`);
    }
  }, [shouldLoadVideo, project.title, slideIndex, distance, isVideoLoaded, hasError]);

  const handleVideoClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userHasInteracted) return;
    
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      setProgress(0);
      playVideo();
    }
  }, [userHasInteracted, playVideo]);

  const handleTouchStart = (e: React.TouchEvent) => {
    // Try to play all video elements in the DOM
    const allVideos = document.querySelectorAll('video');
    allVideos.forEach(async (video) => {
      try {
        video.muted = false;
        video.volume = 1;
        await video.play();
      } catch (error) {
        // Fallback to muted if unmuted fails
        try {
          video.muted = true;
          await video.play();
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
          className={`absolute inset-0 w-full h-full ${project.small ? 'p-[5%] md:p-[15%]' : 'object-cover'}`}
          loop
          playsInline
          // preload={isSafari ? (distance === 0 ? "metadata" : "none") : (distance === 0 ? "auto" : "metadata")}
          onLoadedMetadata={() => handleVideoLoad('loadedmetadata')}
          onCanPlay={() => handleVideoLoad('canplay')}
          onLoadedData={() => handleVideoLoad('loadeddata')}
          onError={(e) => handleVideoError(e, 'error')}
          onStalled={handleVideoStalled}
          onSuspend={handleVideoSuspend}
          onAbort={handleVideoAbort}
          onTimeUpdate={handleTimeUpdate}
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
          <div className="text-center font-bold text-2xl rotate-90">
            {':('}
          </div>
        </div>
      )}

      {/* Video Progress Overlay */}
      {isVideoLoaded && (
        <div className="absolute p-4 pt-2 z-0 pointer-events-none w-screen">
          <div 
            className="relative inset-0 bg-white rounded-full bg-opacity-100 transition-all ease-out duration-100"
            style={{ 
              width: `4px`,
              height: '4px',
              left: `${progress}%`,
            }}
          />
        </div>
      )}

      {/* Overlay Content */}
      <div className="absolute z-10 inset-0 pointer-events-none">
        {/* Title and Subtitle - Always Visible */}
        <div className='absolute top-4 left-4 right-4 text-white flex flex-col gap-1 md:gap-4'>
          <div className="relative ">
            <h2 className="relative flex mb-1 items-center justify-between md:justify-start gap-1 md:gap-6 text-2xl uppercase md:text-5xl md:-left-0.5 font-extrabold leading-[1] md:max-w-[90vw] font-libertinus">
              {project.title}
              {(project.link && isActive)
                ? <a href={project.link} target='_blank' title={project.linkTitle} className='text-lg pointer-events-auto fixed bottom-[14px] left-[14px] md:relative md:bottom-auto md:left-auto  px-2 py-1 rounded-md flex items-center text-sumo-orange bg-sumo-purple hover:bg-sumo-orange hover:text-white'>{project.linkTitle}</a>
                : null
              }
            </h2>
            {project.subtitle && (
              <div className="text-lg font-medium md:text-xl leading-[1.1] md:leading-[1.1] max-w-[800px]">
                {project.subtitle}
              </div>
            )}
            <div className='text-lg font-medium md:text-xl leading-[1]'>
                {project.client}
            </div>
          </div>
          <div className="relative md:-top-1">
            <div className="flex flex-col gap-2">
              <div className="text-sm relative -left-0.5 md:left-auto flex gap-1 items-center flex-wrap max-w-2xl">
                {project.services.map((service, index) => (
                  <div key={index} className="text-black uppercase text-xs font-extrabold list-none rounded-md bg-white py-1 px-2 md:py-1 md:px-2 w-min text-nowrap">
                    {service}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoSlide;