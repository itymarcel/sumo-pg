import { Mouse, MousePointerClick, Space, SquareArrowDown, SquareArrowUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';

interface InstructionsOverlayProps {
  show: boolean;
}

const fadeoutTime: number = 5000

const InstructionsOverlay: React.FC<InstructionsOverlayProps> = ({ show }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      setIsVisible(true);
      
      // After 2 seconds, start fade out
      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, fadeoutTime);

      // After fade out completes, stop rendering
      const removeTimer = setTimeout(() => {
        setShouldRender(false);
      }, fadeoutTime + 500)

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(removeTimer);
      };
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center pointer-events-none`}
    >
      <div className="text-sm relative flex flex-col justify-center gap-2 items-stretch">
        <div className={`flex items-center gap-1 text-white uppercase text-xs font-bold list-none rounded-xl bg-white/10 py-2 px-3 md:py-3 md:px-4 w-min text-nowrap
          transition-all duration-500 ease-out ${isVisible ? 'opacity-100 blur-none translate-y-0' : 'opacity-0 blur-lg -translate-y-2'}`}>
          <Mouse className='size-4'/>Scroll or <div className='flex items-center gap-0'><SquareArrowUp className='size-4'/><SquareArrowDown className='size-4'/></div>
        </div>
        <div className={`flex items-center gap-1 text-white uppercase text-xs font-bold list-none rounded-xl bg-white/10 py-2 px-3 md:py-3 md:px-4 w-min text-nowrap
          transition-all duration-500 ease-out ${isVisible ? 'opacity-100 blur-none translate-y-0' : 'opacity-0 blur-lg translate-y-2'}`}>
          <MousePointerClick className='size-4'/> Tap to restart
        </div>
        <div className={`flex items-center gap-1 text-white uppercase text-xs font-bold list-none rounded-xl bg-white/10 py-2 px-3 md:py-3 md:px-4 w-min text-nowrap
          transition-all duration-500 ease-out ${isVisible ? 'opacity-100 blur-none translate-y-0' : 'opacity-0 blur-lg -translate-y-2'}`}>
          M Mute/Unmute
        </div>
        <div className={`flex items-center gap-1 text-white uppercase text-xs font-bold list-none rounded-xl bg-white/10 py-2 px-3 md:py-3 md:px-4 w-min text-nowrap
          transition-all duration-500 ease-out ${isVisible ? 'opacity-100 blur-none translate-y-0' : 'opacity-0 blur-lg -translate-y-2'}`}>
          <Space className='size-4'/> INFO
        </div>
      </div>
    </div>
  );
};

export default InstructionsOverlay;