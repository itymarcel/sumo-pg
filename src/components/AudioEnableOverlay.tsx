import React from 'react';

interface AudioEnableOverlayProps {
  show: boolean;
  onEnable: () => void;
}

const AudioEnableOverlay: React.FC<AudioEnableOverlayProps> = ({ show, onEnable }) => {
  return (
    <div
      className={`fixed inset-0 bg-black/90 backdrop-blur flex items-center justify-center z-50 transition-all duration-500 ease-in-out cursor-pointer ${
        show ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onEnable}
    >
      <div className="text-center text-white">
        <h2 className="text-4xl md:text-6xl font-bold mb-4">
          Tap to enable audio
        </h2>
        <p className="text-xl md:text-2xl opacity-70">
          Click anywhere to start the experience
        </p>
      </div>
    </div>
  );
};

export default AudioEnableOverlay;