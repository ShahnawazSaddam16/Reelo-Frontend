import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

export default function Login({ setSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

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

      <TouchableOpacity className="bg-white rounded-xl py-3 items-center mb-4">
        <Text className="text-[#181818] text-[15px] font-semibold">
          Login
        </Text>
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
    </View>
  );
}