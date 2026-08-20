import React, { createContext, useContext, useState, useEffect } from "react";
import { View, ActivityIndicator, StatusBar } from "react-native";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.100.77:5015/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const storedToken = await SecureStore.getItemAsync("token");
      if (!storedToken) {
        setIsLoggedIn(false);
        setIsLoading(false);
        return;
      }

      const res = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });
      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        try {
          data = await res.json();
        } catch (e) {
          const text = await res.text().catch(() => '');
          data = { success: false, message: text || 'Non-JSON response from server' };
        }
      } else {
        const text = await res.text().catch(() => '');
        data = { success: false, message: text || 'Non-JSON response from server' };
      }

      if (!res.ok || !data.success) {
        await SecureStore.deleteItemAsync("token");
        setToken(null);
        setUser(null);
        setIsLoggedIn(false);
        return;
      }

      setToken(storedToken);
      setUser(data.user);
      setIsLoggedIn(true);
    } catch (err) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (newToken, newUser) => {
    await SecureStore.setItemAsync("token", newToken);
    setToken(newToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync("token");
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0F0F0F]">
        <StatusBar style="light"/>
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isLoggedIn, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}