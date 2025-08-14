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
      className={`fixed inset-0 bg-black/10 backdrop-blur-lg flex z-50 cursor-pointer transition-all ${
        show ? 'opacity-100 pointer-events-auto duration-300' : 'opacity-0 pointer-events-none duration-300 delay-1000'
      }`}>
      <div 
        className={`flex w-full h-full transition-all ease-super-ease-out bg-no-repeat bg-cover bg-center 
          ${show ? 'scale-100 delay-300 duration-500' : 'scale-[130%] blur-2xl delay-500 duration-500'}`}
        style={{ 
          backgroundImage: 'url(/paul.jpg)',
        }}>
        <div 
          className={`relative z-10 text-center md:text-left text-black p-4 flex flex-col gap-1 transition-all ease-super-ease-out
            ${show ? 'opacity-100 delay-700 duration-1000' : 'opacity-0 blur-sm duration-300 translate-y-1'}`}>
          <div className='relative text-sumo-purple text-[30vw] leading-[80%] font-libertinus align-text-top p-0 m-0 md:text-[15vw] font-bold'>
            SUMO
          </div>
          <h2 className='relative text-sumo-orange mt-2 md:mt-4 text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-3xl left-1 md:left-3 font-bold '>Paul Goeritz</h2>
          <h2 className='relative text-sumo-orange text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-3xl left-1 md:left-3 font-bold'>DJ, Composer, Sound Designer</h2>
          <h2 className='relative text-sumo-orange text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-3xl left-1 md:left-3 font-bold'>
            <a onClick={e => openLink(e, 'mailto:sumo@sumolicious.com')} className='underline left-1 hover:text-black' >sumo@sumolicious.com</a>
          </h2>
          <h2 className='relative text-sumo-orange text-2xl leading-[85%] md:leading-[80%] p-0 m-0 md:text-3xl left-1 md:left-3 font-bold'>
            <a onClick={e => openLink(e, 'https://www.instagram.com/sumo.music')} className='underline hover:text-black' >instagram</a>
          </h2>
        </div>
        <div 
          className="fixed text-sumo-orange z-0 text-center w-full bottom-12 flex flex-col gap-2 items-center justify-center text-sm font-bold mt-4"
          onClick={handleOverlayClick}>
          <div className='flex items-center gap-1 animate-pulse'>
            <AudioLines className='size-4'/> Tap anywhere to enable audio
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioEnableOverlay;