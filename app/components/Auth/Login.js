import React, { useState, useCallback } from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "../../../contexts/AuthContext";
import { useFonts, GrandHotel_400Regular } from "@expo-google-fonts/grand-hotel";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

const API_URL = "https://api.reelo.buttnetworks.com/api";

export default function Login({ setSignIn, setForgotPassword }) {
  const navigation = useNavigation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const [fontsLoaded] = useFonts({
    GrandHotel_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert("Error", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert("Login Failed", data.message || "Invalid credentials");
        return;
      }

      const token = data?.token || data?.accessToken || data?.access_token;
      if (token) {
        await login(token, data.user);
      }

      navigation.navigate("CreatingProfileScreen");
    } catch (err) {
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-[90%] max-w-[380px] bg-[#121216] rounded-2xl border border-white/[0.08] p-6" onLayout={onLayoutRootView}>
      <View className="items-center mb-4">
        <Text
          style={{
            fontFamily: "GrandHotel_400Regular",
            fontSize: 34,
            color: "#fff",
          }}
        >
          Reelo
        </Text>
      </View>

      <Text className="text-white text-[22px] font-semibold mb-1">
        Welcome back
      </Text>
      <Text className="text-[#9C9C9C] text-[14px] mb-6">
        Sign in to continue
      </Text>

      <Text className="text-[#B0B0B0] text-[13px] mb-2">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#6B6B6B"
        keyboardType="email-address"
        autoCapitalize="none"
        className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-4"
      />

      <Text className="text-[#B0B0B0] text-[13px] mb-2">Password</Text>
      <View className="flex-row items-center bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 mb-3">
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••"
          placeholderTextColor="#6B6B6B"
          secureTextEntry={!showPassword}
          className="flex-1 text-white py-3"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          {showPassword ? (
            <EyeOff size={20} color="#9C9C9C" />
          ) : (
            <Eye size={20} color="#9C9C9C" />
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => setForgotPassword(true)} className="self-end mb-6">
        <Text className="text-[#8B5CF6] text-[13px] font-medium">
          Forgot password?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-[#8B5CF6] rounded-xl py-3 items-center mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-[15px] font-semibold">
            Login
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center">
        <Text className="text-[#9C9C9C] text-[14px]">
          Don't have an account?{" "}
        </Text>
        <TouchableOpacity onPress={() => setSignIn(true)}>
          <Text className="text-white text-[14px] font-semibold">
            Sign Up
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAlertVisible(false)}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-[320px] bg-[#121216] rounded-2xl border border-white/[0.08] p-6">
            <Text className="text-white text-[17px] font-semibold mb-2">
              {alertTitle}
            </Text>
            <Text className="text-[#9C9C9C] text-[14px] mb-6">
              {alertMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setAlertVisible(false)}
              className="bg-[#8B5CF6] rounded-xl py-3 items-center"
            >
              <Text className="text-white text-[15px] font-semibold">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}