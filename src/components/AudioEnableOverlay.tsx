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

  const openLink = (e: React.MouseEvent, url: string) => {
    e.stopPropagation()
    window.open(url, '_blank');
  }
  
  return (
    <div
      className={`fixed inset-0 bg-black/100 backdrop-blur-2xl flex z-50 cursor-pointer bg-no-repeat bg-cover bg-center ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      style={{ backgroundImage: 'url(/paul.jpg)' }}>
      <div 
        className="relative z-10 text-left text-black p-4 flex flex-col gap-1">
        <div className='relative text-[30vw] leading-[80%] align-text-top p-0 m-0 md:text-[15vw] font-bold'>SUMO</div>
        <h2 className='relative mt-2 md:mt-4 text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-5xl left-1 md:left-3 font-bold'>Paul Goeritz</h2>
        <h2 className='relative text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-5xl left-1 md:left-3 font-bold'>DJ, Composer, Sound Designer</h2>
        <h2 className='relative text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-5xl left-1 md:left-3 font-bold'>
          <a onClick={e => openLink(e, 'mailto:sumo@sumolicious.com')} className='underline left-1 hover:text-black' >sumo@sumolicious.com</a>
        </h2>
        <h2 className='relative text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-5xl left-1 md:left-3 font-bold'>
          <a onClick={e => openLink(e, 'https://www.instagram.com/sumo.music')} className='underline hover:text-black' >instagram</a>
        </h2>
      </div>
      <div 
        className="fixed z-0 text-center w-full bottom-12 md:bottom-auto md:h-full text-white flex flex-col gap-2 items-center justify-center text-sm font-bold mt-4"
        onClick={handleOverlayClick}>
        <div className='flex items-center gap-1 animate-pulse'>
          <AudioLines className='size-4'/> Tap anywhere to enable audio
        </div>
      </div>
    </div>
  );
};

export default AudioEnableOverlay;