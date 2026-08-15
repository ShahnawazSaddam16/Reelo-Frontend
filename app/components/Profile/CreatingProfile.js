import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { Camera, ArrowLeft } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";

const API_URL = "http://192.168.100.77:5015/api";

export default function CreatingProfile() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [step, setStep] = useState(1);
  const [avatar, setAvatar] = useState(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [alertSuccess, setAlertSuccess] = useState(false);

  const showAlert = (title, message, success = false) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertSuccess(success);
    setAlertVisible(true);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert("Permission needed", "Allow access to your photos to set a profile picture");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0]);
    }
  };

  const handleNext = () => {
    if (!username.trim()) {
      showAlert("Error", "Please enter a username");
      return;
    }
    setStep(2);
  };

  const handleCreateProfile = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", username);
      formData.append("bio", bio);
      formData.append("links", links);
      if (avatar) {
        formData.append("avator", {
          uri: avatar.uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        });
      }

      const res = await fetch(`${API_URL}/profile/create-profile`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        showAlert("Error", data.message || "Could not create profile");
        return;
      }

      showAlert("Success", "Your profile has been created", true);
    } catch (err) {
      showAlert("Error", "Something went wrong. Please try again.", err.message);
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setAlertVisible(false);
    if (alertSuccess) {
      navigation.navigate("HomeScreen");
    }
  };

  return (
    <View className="flex-1 items-center justify-center">
      <BlurView
        intensity={40}
        tint="dark"
        className="w-[90%] max-w-[380px] rounded-2xl border border-[#2A2A2A] p-6 overflow-hidden"
      >
        <View className="flex-row items-center mb-6">
          {step === 2 && (
            <TouchableOpacity onPress={() => setStep(1)} className="mr-3">
              <ArrowLeft size={20} color="#9C9C9C" />
            </TouchableOpacity>
          )}
          <View className="flex-1">
            <Text className="text-white text-[22px] font-semibold mb-1">
              {step === 1 ? "Create your profile" : "Tell us more"}
            </Text>
            <Text className="text-[#9C9C9C] text-[14px]">
              {step === 1 ? "Add a photo and username" : "Optional, you can skip this"}
            </Text>
          </View>
        </View>

        <View className="flex-row justify-center mb-6">
          <View className={`h-[4px] w-[28px] rounded-full mr-2 ${step === 1 ? "bg-white" : "bg-[#2A2A2A]"}`} />
          <View className={`h-[4px] w-[28px] rounded-full ${step === 2 ? "bg-white" : "bg-[#2A2A2A]"}`} />
        </View>

        {step === 1 ? (
          <>
            <View className="items-center mb-6">
              <TouchableOpacity onPress={pickImage} className="w-[96px] h-[96px] rounded-full bg-[#111111] border border-[#2A2A2A] items-center justify-center overflow-hidden">
                {avatar ? (
                  <Image source={{ uri: avatar.uri }} className="w-full h-full" />
                ) : (
                  <Camera size={26} color="#9C9C9C" />
                )}
              </TouchableOpacity>
              <Text className="text-[#9C9C9C] text-[13px] mt-2">Upload photo</Text>
            </View>

            <Text className="text-[#B0B0B0] text-[13px] mb-2">Username</Text>
            <TextInput
              value={username}
              onChangeText={setUsername}
              placeholder="yourusername"
              placeholderTextColor="#6B6B6B"
              autoCapitalize="none"
              className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-6"
            />

            <TouchableOpacity
              onPress={handleNext}
              className="bg-white rounded-xl py-3 items-center"
            >
              <Text className="text-[#181818] text-[15px] font-semibold">
                Next
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text className="text-[#B0B0B0] text-[13px] mb-2">Bio</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder="Tell people about yourself"
              placeholderTextColor="#6B6B6B"
              multiline
              numberOfLines={3}
              className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-4"
            />

            <Text className="text-[#B0B0B0] text-[13px] mb-2">Link</Text>
            <TextInput
              value={links}
              onChangeText={setLinks}
              placeholder="https://yourlink.com"
              placeholderTextColor="#6B6B6B"
              autoCapitalize="none"
              className="bg-[#111111] text-white border border-[#2A2A2A] rounded-xl px-4 py-3 mb-6"
            />

            <TouchableOpacity
              onPress={handleCreateProfile}
              disabled={loading}
              className="bg-white rounded-xl py-3 items-center mb-3"
            >
              {loading ? (
                <ActivityIndicator color="#181818" />
              ) : (
                <Text className="text-[#181818] text-[15px] font-semibold">
                  Create Profile
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={handleCreateProfile} disabled={loading}>
              <Text className="text-[#9C9C9C] text-[13px] text-center">
                Skip for now
              </Text>
            </TouchableOpacity>
          </>
        )}
      </BlurView>

      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
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
              onPress={closeAlert}
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