import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";
import { useAuth } from "../../../contexts/AuthContext";

const API_URL = "https://api.reelo.buttnetworks.com/api";

export default function EmailVerification({ email, onVerified, onBack }) {
  const { login } = useAuth();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleVerify = async () => {
    if (!code) {
      showAlert("Error", "Please enter the verification code");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/verify-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert("Verification Failed", data.message || "Invalid code");
        return;
      }

      const token = data?.token || data?.accessToken || data?.access_token;
      if (token) {
        await login(token, data.user);
      }

      onVerified();
    } catch (err) {
      showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const res = await fetch(`${API_URL}/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert("Error", data.message || "Could not resend code");
        return;
      }
      showAlert("Code Sent", "A new verification code has been sent to your email");
    } catch (err) {
      showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <View className="w-[90%] max-w-[380px] bg-[#121216] rounded-2xl border border-white/[0.08] p-6">
      <Text className="text-white text-[22px] font-semibold mb-1">
        Verify your email
      </Text>
      <Text className="text-[#9C9C9C] text-[14px] mb-6">
        Enter the code sent to {email}
      </Text>

      <Text className="text-[#B0B0B0] text-[13px] mb-2">Verification code</Text>
      <TextInput
        value={code}
        onChangeText={setCode}
        placeholder="Enter code"
        placeholderTextColor="#6B6B6B"
        keyboardType="number-pad"
        className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-6"
      />

      <TouchableOpacity
        onPress={handleVerify}
        disabled={loading}
        className="bg-[#8B5CF6] rounded-xl py-3 items-center mb-4"
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text className="text-white text-[15px] font-semibold">
            Verify
          </Text>
        )}
      </TouchableOpacity>

      <View className="flex-row justify-center mb-2">
        <Text className="text-[#9C9C9C] text-[14px]">
          Didn't get a code?{" "}
        </Text>
        <TouchableOpacity onPress={handleResend} disabled={resending}>
          <Text className="text-white text-[14px] font-semibold">
            {resending ? "Sending..." : "Resend"}
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-center">
        <TouchableOpacity onPress={onBack}>
          <Text className="text-[#9C9C9C] text-[14px]">
            Back
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