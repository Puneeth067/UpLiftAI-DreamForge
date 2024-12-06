import { useEffect, useRef, useState } from 'react';

const PageSounds = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);

  // Sound effect references
  const clickSoundRef = useRef(new Audio('/sounds/click-elegant.mp3'));
  const toggleSoundRef = useRef(new Audio('/sounds/toggle-switch.mp3'));
  const typingSoundRef = useRef(new Audio('/sounds/typing-sound.mp3')); // New typing sound

  // Sound volume and settings
  useEffect(() => {
    clickSoundRef.current.volume = 0.4;
    toggleSoundRef.current.volume = 0.5;
    typingSoundRef.current.volume = 0.2; // Set volume for typing sound

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

      const addTypingSounds = () => {
        const inputElements = document.querySelectorAll('input, textarea');
        
        inputElements.forEach(el => {
          let lastKeyPressTime = 0;
          
          el.addEventListener('keydown', (event) => {
            // Prevent rapid, continuous sound triggering
            const currentTime = Date.now();
            if (currentTime - lastKeyPressTime > 100) { // Minimum 100ms between sounds
              typingSoundRef.current.currentTime = 0;
              typingSoundRef.current.play().catch(error => {
                console.error('Typing sound play error:', error);
              });
              lastKeyPressTime = currentTime;
            }
          });
        });
      };

      addClickSounds();
      addToggleSounds();
      addTypingSounds(); // Add the new typing sound function
      
    } catch (error) {
      console.error('Sound initialization error:', error);
    }
  }, [isSoundEnabled]);

  return null; // This component doesn't render anything visually
};

export default PageSounds;