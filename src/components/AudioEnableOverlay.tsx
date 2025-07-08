import React, { useEffect } from 'react';
import { AudioLines } from 'lucide-react';

interface AudioEnableOverlayProps {
  show: boolean;
  onEnable: () => void;
}

const AudioEnableOverlay: React.FC<AudioEnableOverlayProps> = ({ show, onEnable }) => {  
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (e.target === e.currentTarget) {
      onEnable();
    }
  }
  
  return (
    <div
      className={`fixed inset-0 bg-black/10 backdrop-blur-2xl flex z-50 cursor-pointer ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="relative z-10 text-left text-white p-4 flex flex-col gap-0.5">
        <div className='relative text-[30vw] leading-[80%] align-text-top p-0 m-0 md:text-[15vw] font-bold'>SUMO</div>
        <h2 className='relative mt-2 md:mt-4 text-3xl leading-[85%] md:leading-[75%] p-0 m-0 md:text-5xl md:left-3 font-bold'>Paul Goeritz</h2>
        <h2 className='relative text-3xl leading-[85%] md:leading-[75%] p-0 m-0 md:text-5xl md:left-3 font-bold'>Sound Designer</h2>
        <h2 className='relative text-3xl leading-[85%] md:leading-[75%] p-0 m-0 md:text-5xl md:left-3 font-bold'>
          <a href='mailto:sumo@sumolicious.com' className='underline hover:text-black' >sumo@sumolicious.com</a>
        </h2>
      </div>
      <div 
        className="fixed z-0 text-center w-full bottom-4 md:bottom-auto md:h-full text-white flex md:flex-col items-center justify-center text-sm font-bold mt-4"
        onClick={handleOverlayClick}>
        <div className='flex items-center gap-1 animate-pulse'>
          <AudioLines className='size-4'/> Tap to enable audio
        </div>
      </div>
    </div>
  );
};

export default AudioEnableOverlay;