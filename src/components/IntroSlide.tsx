import React from 'react';

interface IntroSlideProps {
  isActive: boolean;
  userHasInteracted: boolean;
}

const IntroSlide: React.FC<IntroSlideProps> = ({ isActive, userHasInteracted }) => {
  return (
    <div className="relative h-full w-full bg-black">
      <div className="absolute top-8 left-8 right-8 text-white">
        <h1 className="text-8xl md:text-9xl lg:text-[12rem] xl:text-[14rem] font-bold mb-2 leading-none capitalize">
          Paul Göritz
        </h1>
        <h2 className="text-6xl md:text-8xl lg:text-[10rem] xl:text-[12rem] font-bold mb-2 leading-none capitalize">
          Sumo
        </h2>
        <h3 className="text-4xl md:text-6xl lg:text-8xl xl:text-[10rem] font-bold leading-none capitalize">
          Sound Designer
        </h3>
      </div>
    </div>
  );
};

export default IntroSlide;