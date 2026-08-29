import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, ActivityIndicator, Modal } from "react-native";

const API_URL = "http://192.168.100.77:8081/api";

export default function ForgotPassword({ setForgotPassword }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const showAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertVisible(true);
  };

  const handleSendCode = async () => {
    if (!email) {
      showAlert("Error", "Please enter your email");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert("Error", data.message || "Something went wrong");
        return;
      }
      showAlert("Code Sent", "Check your email for the reset code");
      setStep(2);
    } catch (err) {
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword || !confirmPassword) {
      showAlert("Error", "Please fill all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert("Error", "Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert("Error", data.message || "Something went wrong");
        return;
      }
      showAlert("Success", "Password reset successful");
      setStep(3);
    } catch (err) {
      showAlert("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="w-[90%] max-w-[380px] bg-[#121216] rounded-2xl border border-white/[0.08] p-6">
      <Text className="text-white text-[22px] font-semibold mb-1">
        {step === 1 ? "Forgot password" : step === 2 ? "Reset password" : "All set"}
      </Text>
      <Text className="text-[#9C9C9C] text-[14px] mb-6">
        {step === 1
          ? "Enter your email to receive a reset code"
          : step === 2
          ? "Enter the code sent to your email and your new password"
          : "You can now log in with your new password"}
      </Text>

      {step === 1 && (
        <>
          <Text className="text-[#B0B0B0] text-[13px] mb-2">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            placeholderTextColor="#6B6B6B"
            keyboardType="email-address"
            autoCapitalize="none"
            className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-6"
          />

          <TouchableOpacity
            onPress={handleSendCode}
            disabled={loading}
            className="bg-[#8B5CF6] rounded-xl py-3 items-center mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-[15px] font-semibold">
                Send Code
              </Text>
            )}
          </TouchableOpacity>
        </>
      )}

      {step === 2 && (
        <>
          <Text className="text-[#B0B0B0] text-[13px] mb-2">Code</Text>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Enter 6-digit code"
            placeholderTextColor="#6B6B6B"
            keyboardType="number-pad"
            className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-4"
          />

          <Text className="text-[#B0B0B0] text-[13px] mb-2">New Password</Text>
          <TextInput
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="••••••••"
            placeholderTextColor="#6B6B6B"
            secureTextEntry
            className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-4"
          />

          <Text className="text-[#B0B0B0] text-[13px] mb-2">Confirm Password</Text>
          <TextInput
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="••••••••"
            placeholderTextColor="#6B6B6B"
            secureTextEntry
            className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-6"
          />

          <TouchableOpacity
            onPress={handleResetPassword}
            disabled={loading}
            className="bg-[#8B5CF6] rounded-xl py-3 items-center mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text className="text-white text-[15px] font-semibold">
                Reset Password
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSendCode} disabled={loading} className="items-center mb-4">
            <Text className="text-[#8B5CF6] text-[13px] font-medium">
              Resend code
            </Text>
          </TouchableOpacity>
        </>
      )}

      {step === 3 && (
        <TouchableOpacity
          onPress={() => setForgotPassword(false)}
          className="bg-[#8B5CF6] rounded-xl py-3 items-center mb-4"
        >
          <Text className="text-white text-[15px] font-semibold">
            Back to Login
          </Text>
        </TouchableOpacity>
      )}

      {step !== 3 && (
        <View className="flex-row justify-center">
          <TouchableOpacity onPress={() => setForgotPassword(false)}>
            <Text className="text-white text-[14px] font-semibold">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      )}

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