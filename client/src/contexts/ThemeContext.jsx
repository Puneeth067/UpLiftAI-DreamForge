// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUserTheme = async (userId) => {
    try {
      const { data: settings, error } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (settings?.preferences?.darkMode) {
        setIsDarkMode(true);
        document.documentElement.classList.add('dark');
      } else {
        setIsDarkMode(false);
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async (userId) => {
    try {
      const newIsDarkMode = !isDarkMode;
      setIsDarkMode(newIsDarkMode);

      if (newIsDarkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('preferences')
        .eq('user_id', userId)
        .single();

      const updatedPreferences = {
        ...(existingSettings?.preferences || {}),
        darkMode: newIsDarkMode
      };

      const { error } = await supabase
        .from('user_settings')
        .update({ preferences: updatedPreferences })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating theme:', error);
      // Revert the theme if update fails
      setIsDarkMode(!isDarkMode);
      document.documentElement.classList.toggle('dark');
    }
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme, loadUserTheme, loading }}>
      {children}
    </ThemeContext.Provider>
  );
};