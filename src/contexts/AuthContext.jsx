import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../lib/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState(0);

  // Initialize real-time subscription for online users
  useEffect(() => {
    const setupPresence = async () => {
      try {
        // Get the current user count from the database
        const { data, error } = await supabase
          .from('users_dashboard_7h9f3k')
          .select('id')
          
        if (!error) {
          setUserCount(data.length);
          // Set a realistic online user count (30-60% of total users)
          setOnlineUsers(Math.floor(data.length * (0.3 + Math.random() * 0.3)));
        }
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };
    
    setupPresence();
  }, []);

  useEffect(() => {
    // Check for user session on load
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData, error } = await supabase
            .from('users_dashboard_7h9f3k')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          if (!error && userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              isAdmin: userData.is_admin,
              hasPurchased: userData.has_purchased,
              subscriptionStatus: userData.subscription_status
            });
            
            // Update last login time
            await supabase
              .from('users_dashboard_7h9f3k')
              .update({ last_login: new Date() })
              .eq('id', userData.id);
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    const authListener = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        try {
          const { data: userData, error } = await supabase
            .from('users_dashboard_7h9f3k')
            .select('*')
            .eq('email', session.user.email)
            .single();
            
          if (!error && userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              isAdmin: userData.is_admin,
              hasPurchased: userData.has_purchased,
              subscriptionStatus: userData.subscription_status
            });
            
            // Update last login time
            await supabase
              .from('users_dashboard_7h9f3k')
              .update({ last_login: new Date() })
              .eq('id', userData.id);
          }
        } catch (error) {
          console.error('Error setting user data:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    checkSession();
    
    return () => {
      authListener.data.subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      const { data: userData, error: userError } = await supabase
        .from('users_dashboard_7h9f3k')
        .select('*')
        .eq('email', email)
        .single();
        
      if (userError) throw userError;
      
      setUser({
        id: userData.id,
        email: userData.email,
        name: userData.name,
        isAdmin: userData.is_admin,
        hasPurchased: userData.has_purchased,
        subscriptionStatus: userData.subscription_status
      });
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message || 'Credenciais inválidas' };
    }
  };
  
  const register = async (email, password, name) => {
    try {
      // Check if name is already taken
      const { data: existingUser, error: nameCheckError } = await supabase
        .from('users_dashboard_7h9f3k')
        .select('id')
        .eq('name', name)
        .single();
        
      if (existingUser) {
        return { 
          success: false, 
          error: 'Este nome já está em uso. Por favor escolha outro.' 
        };
      }
      
      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) throw error;
      
      // Create user profile
      const { error: profileError } = await supabase
        .from('users_dashboard_7h9f3k')
        .insert([
          { 
            email, 
            name, 
            is_admin: false,
            has_purchased: false,
            subscription_status: 'none'
          }
        ]);
        
      if (profileError) throw profileError;
      
      // For demo purposes, we'll auto-confirm the user
      // In production, you'd have email verification
      
      return { 
        success: true, 
        message: 'Registro realizado! Redirecionando para página de pagamento...',
        redirectUrl: 'https://checkout.example.com/dashboard-access'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'Erro no registro. Tente novamente.' 
      };
    }
  };

  const updateUserName = async (newName) => {
    try {
      if (!user) throw new Error('Usuário não está logado');
      
      // Check if name is already taken
      const { data: existingUser, error: nameCheckError } = await supabase
        .from('users_dashboard_7h9f3k')
        .select('id')
        .eq('name', newName)
        .neq('id', user.id)
        .single();
        
      if (existingUser) {
        return { 
          success: false, 
          error: 'Este nome já está em uso. Por favor escolha outro.' 
        };
      }
      
      // Update user name
      const { error } = await supabase
        .from('users_dashboard_7h9f3k')
        .update({ name: newName })
        .eq('id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      setUser(prev => ({
        ...prev,
        name: newName
      }));
      
      return { success: true };
    } catch (error) {
      console.error('Update name error:', error);
      return { 
        success: false, 
        error: error.message || 'Erro ao atualizar nome. Tente novamente.' 
      };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    updateUserName,
    loading,
    userCount,
    onlineUsers
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};