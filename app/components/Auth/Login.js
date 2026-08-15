import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import * as SecureStore from "expo-secure-store";

const API_URL = "http://192.168.100.77:5015/api";

export default function Login({ setSignIn }) {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

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
        await SecureStore.setItemAsync("token", token);
      }

      navigation.navigate("CreatingProfileScreen");
    } catch (err) {
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-[90%] max-w-[380px] bg-[#181818] rounded-2xl border border-[#2A2A2A] p-6">
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
      <View className="flex-row items-center bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 mb-6">
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

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        className="bg-white rounded-xl py-3 items-center mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#181818" />
        ) : (
          <Text className="text-[#181818] text-[15px] font-semibold">
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
          <View className="w-full max-w-[320px] bg-[#181818] rounded-2xl border border-[#2A2A2A] p-6">
            <Text className="text-white text-[17px] font-semibold mb-2">
              {alertTitle}
            </Text>
            <Text className="text-[#9C9C9C] text-[14px] mb-6">
              {alertMessage}
            </Text>
            <TouchableOpacity
              onPress={() => setAlertVisible(false)}
              className="bg-white rounded-xl py-3 items-center"
            >
              <Text className="text-[#181818] text-[15px] font-semibold">
                OK
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}