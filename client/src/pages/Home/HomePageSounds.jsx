import { useEffect, useRef, useState } from 'react';

const HomePageSounds = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Sound effect references
  const hoverSoundRef = useRef(new Audio('/sounds/soft-hover.mp3'));
  const clickSoundRef = useRef(new Audio('/sounds/click-elegant.mp3'));
  const toggleSoundRef = useRef(new Audio('/sounds/toggle-switch.mp3'));

  // Sound volume and settings
  useEffect(() => {
    hoverSoundRef.current.volume = 0.3;
    clickSoundRef.current.volume = 0.4;
    toggleSoundRef.current.volume = 0.5;

    // Add event listener for first user interaction
    const enableSounds = () => {
      setIsSoundEnabled(true);
      document.removeEventListener('click', enableSounds);
    };
    document.addEventListener('click', enableSounds);

    return () => {
      document.removeEventListener('click', enableSounds);
    };
  }, []);

  useEffect(() => {
    if (!isSoundEnabled) return;

    try {
      
      // Add sound effects to various elements
      const addHoverSounds = () => {
        const hoverableElements = document.querySelectorAll('button, [role="button"], .hover-sound');
        
        hoverableElements.forEach(el => {
          el.addEventListener('mouseenter', () => {
            hoverSoundRef.current.currentTime = 0;
            hoverSoundRef.current.play().catch(error => {
              console.error('Hover sound play error:', error);
            });
          });
        });
      };

      const addClickSounds = () => {
        const clickableElements = document.querySelectorAll('button, [role="button"], .click-sound');
        
        clickableElements.forEach(el => {
          el.addEventListener('click', () => {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(error => {
              console.error('Click sound play error:', error);
            });
          });
        });
      };

      const addToggleSounds = () => {
        const toggleElements = document.querySelectorAll('button[aria-pressed]');
        
        toggleElements.forEach(el => {
          el.addEventListener('click', () => {
            toggleSoundRef.current.currentTime = 0;
            toggleSoundRef.current.play().catch(error => {
              console.error('Toggle sound play error:', error);
            });
          });
        });
      };

      addHoverSounds();
      addClickSounds();
      addToggleSounds();

      
    } catch (error) {
      console.error('Sound initialization error:', error);
    }
  }, [isSoundEnabled]);

  return null; // This component doesn't render anything visually
};

export default HomePageSounds;