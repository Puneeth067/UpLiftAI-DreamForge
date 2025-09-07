import { useEffect, useRef, useState } from 'react';
import { chat } from './supabase-chat.js';

// Cache sound URLs globally to avoid repeated fetching
// const SOUND_CACHE = {
//   urls: null,
//   isLoaded: false
// };

// Option 1: Static URLs (Recommended for better performance)
const STATIC_SOUND_URLS = {
  click: `${chat.supabaseUrl}/storage/v1/object/public/sounds/click-elegant.mp3`,
  toggle: `${chat.supabaseUrl}/storage/v1/object/public/sounds/toggle-switch.mp3`,
  typing: `${chat.supabaseUrl}/storage/v1/object/public/sounds/typing-sound.mp3`
};

const PageSounds = () => {
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [soundUrls, setSoundUrls] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sound effect references
  const clickSoundRef = useRef(null);
  const toggleSoundRef = useRef(null);
  const typingSoundRef = useRef(null);

  // Method 1: Use static URLs (fastest, recommended)
  const loadStaticUrls = () => {
    setSoundUrls(STATIC_SOUND_URLS);
    initializeAudioObjects(STATIC_SOUND_URLS);
    setIsLoading(false);
  };

  // Method 2: Fetch URLs with caching
  // const fetchSoundUrlsWithCache = async () => {
  //   // Check if URLs are already cached
  //   if (SOUND_CACHE.isLoaded && SOUND_CACHE.urls) {
  //     setSoundUrls(SOUND_CACHE.urls);
  //     initializeAudioObjects(SOUND_CACHE.urls);
  //     setIsLoading(false);
  //     return;
  //   }

  //   try {
  //     // Only fetch if not cached
  //     const clickUrl = chat.storage
  //       .from('sounds')
  //       .getPublicUrl('click-elegant.mp3').data.publicUrl;
      
  //     const toggleUrl = chat.storage
  //       .from('sounds')
  //       .getPublicUrl('toggle-switch.mp3').data.publicUrl;
      
  //     const typingUrl = chat.storage
  //       .from('sounds')
  //       .getPublicUrl('typing-sound.mp3').data.publicUrl;

  //     const urls = {
  //       click: clickUrl,
  //       toggle: toggleUrl,
  //       typing: typingUrl
  //     };

  //     // Cache the URLs globally
  //     SOUND_CACHE.urls = urls;
  //     SOUND_CACHE.isLoaded = true;

  //     setSoundUrls(urls);
  //     initializeAudioObjects(urls);
  //     setIsLoading(false);

  //   } catch (error) {
  //     console.error('Error getting sound URLs from Supabase:', error);
      
  //     // Fallback to public folder sounds
  //     const fallbackUrls = {
  //       click: '/sounds/click-elegant.mp3',
  //       toggle: '/sounds/toggle-switch.mp3',
  //       typing: '/sounds/typing-sound.mp3'
  //     };

  //     setSoundUrls(fallbackUrls);
  //     initializeAudioObjects(fallbackUrls);
  //     setIsLoading(false);
  //   }
  // };

  // Initialize Audio objects
  const initializeAudioObjects = (urls) => {
    try {
      clickSoundRef.current = new Audio(urls.click);
      toggleSoundRef.current = new Audio(urls.toggle);
      typingSoundRef.current = new Audio(urls.typing);

      // Set volumes
      clickSoundRef.current.volume = 0.4;
      toggleSoundRef.current.volume = 0.5;
      typingSoundRef.current.volume = 0.2;

      // Preload audio files for better performance
      clickSoundRef.current.preload = 'auto';
      toggleSoundRef.current.preload = 'auto';
      typingSoundRef.current.preload = 'auto';

    } catch (error) {
      console.error('Error initializing audio objects:', error);
    }
  };

  // Get sound URLs (choose method)
  useEffect(() => {
    // Choose one of these methods:
    
    // Method 1: Static URLs (recommended - fastest, no API calls)
    loadStaticUrls();
    
    // Method 2: Fetch with caching (uncomment to use instead)
    // fetchSoundUrlsWithCache();
    
  }, []);

  // Enable sounds on first user interaction
  useEffect(() => {
    const enableSounds = () => {
      setIsSoundEnabled(true);
      document.removeEventListener('click', enableSounds);
      document.removeEventListener('touchstart', enableSounds);
    };
    
    document.addEventListener('click', enableSounds, { once: true });
    document.addEventListener('touchstart', enableSounds, { once: true });

    return () => {
      document.removeEventListener('click', enableSounds);
      document.removeEventListener('touchstart', enableSounds);
    };
  }, []);

  // Add sound event listeners
  useEffect(() => {
    if (!isSoundEnabled || isLoading || !soundUrls) return;

    const playSound = (audioRef) => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(error => {
          console.error('Sound play error:', error);
        });
      }
    };

    const addClickSounds = () => {
      const clickableElements = document.querySelectorAll('button, [role="button"], .click-sound');
      
      const handleClick = () => playSound(clickSoundRef);
      
      clickableElements.forEach(el => {
        el.removeEventListener('click', handleClick);
        el.addEventListener('click', handleClick);
      });
    };

    const addToggleSounds = () => {
      const toggleElements = document.querySelectorAll('button[aria-pressed]');
      
      const handleToggle = () => playSound(toggleSoundRef);
      
      toggleElements.forEach(el => {
        el.removeEventListener('click', handleToggle);
        el.addEventListener('click', handleToggle);
      });
    };

    const addTypingSounds = () => {
      const inputElements = document.querySelectorAll('input, textarea');
      
      inputElements.forEach(el => {
        let lastKeyPressTime = 0;
        
        const handleTyping = () => {
          const currentTime = Date.now();
          if (currentTime - lastKeyPressTime > 100) {
            playSound(typingSoundRef);
            lastKeyPressTime = currentTime;
          }
        };
        
        el.removeEventListener('keydown', handleTyping);
        el.addEventListener('keydown', handleTyping);
      });
    };

    // Use MutationObserver to handle dynamically added elements
    const observeDOM = () => {
      const observer = new MutationObserver(() => {
        addClickSounds();
        addToggleSounds();
        addTypingSounds();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return observer;
    };

    // Initial setup
    const timeoutId = setTimeout(() => {
      addClickSounds();
      addToggleSounds();
      addTypingSounds();
    }, 100);

    // Start observing for dynamic elements
    const observer = observeDOM();

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
    
  }, [isSoundEnabled, isLoading, soundUrls]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      [clickSoundRef, toggleSoundRef, typingSoundRef].forEach(ref => {
        if (ref.current) {
          ref.current.pause();
          ref.current = null;
        }
      });
    };
  }, []);

  return null;
};

export default PageSounds;