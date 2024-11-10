// services/api/authService.js
import { supabase } from '../../utils/supabase';

export const authService = {
  async signUp({ email, password, fullName, userType, department, phoneNumber }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          fullName,
          userType,
          department,
          phoneNumber,
        },
      },
    });

    if (error) {
      console.error('Error signing up:', error);
      throw new Error('Unable to complete sign-up');
    }
    return data;
  },

  async signIn({ email, password }) {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Error signing in:', error);
      throw new Error('Invalid login credentials');
    }

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching user data:', userError);
      throw new Error('Failed to retrieve user details');
    }

    return {
      session,
      userData,
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      throw new Error('Sign-out failed');
    }
  },

  async getCurrentUser() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error fetching session:', error);
      throw new Error('Unable to retrieve session');
    }
    if (!session) return null;

    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (userError) {
      console.error('Error fetching current user data:', userError);
      throw new Error('Failed to retrieve current user');
    }

    return {
      ...session.user,
      ...userData,
    };
  },
};
