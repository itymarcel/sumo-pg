import React from 'react';

interface IntroSlideProps {
  isActive: boolean;
  userHasInteracted: boolean;
}

const IntroSlide: React.FC<IntroSlideProps> = ({ isActive, userHasInteracted }) => {
  return (
    <div className="relative h-full w-full bg-black flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-6xl md:text-8xl font-bold mb-4">
          Paul Göritz
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          Sumo
        </h2>
        <h3 className="text-3xl md:text-5xl font-bold">
          Sound Designer
        </h3>
      </div>
      
      {!userHasInteracted && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center">
          <p className="text-sm opacity-70 mb-2">
            Tap or scroll to enable audio
          </p>
          <div className="animate-bounce">
            <svg 
              className="w-6 h-6 mx-auto" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19 14l-7 7m0 0l-7-7m7 7V3" 
              />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
};

export default IntroSlide;