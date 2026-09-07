import React, { useState } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import {
  Camera,
  ArrowLeft,
  AtSign,
  FileText,
  Link2,
  Pencil,
  CheckCircle2,
  AlertCircle,
} from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";

const API_URL = "https://api.reelo.buttnetworks.com/api";

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
    const mediaTypes = ImagePicker?.MediaType
      ? [ImagePicker.MediaType.Images]
      : ImagePicker?.MediaTypeOptions?.Images ?? ImagePicker?.MediaTypeOptions

    const result = await ImagePicker.launchImageLibraryAsync({
      ...(mediaTypes !== undefined ? { mediaTypes } : {}),
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
        const filename = avatar.fileName || "avatar.jpg"
        const extMatch = /\.(\w+)$/.exec(filename)
        const ext = extMatch ? extMatch[1] : "jpg"
        const type = avatar.mimeType || `image/${ext}`

        formData.append("avator", {
          uri: avatar.uri,
          name: filename,
          type,
        })
      }

      const xhrResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open("POST", `${API_URL}/profile/create-profile`)
        xhr.setRequestHeader("Authorization", `Bearer ${token}`)
        xhr.onload = () => resolve({ status: xhr.status, text: xhr.responseText })
        xhr.onerror = () => reject(new Error("Network request failed"))
        xhr.send(formData)
      })

      let data
      try {
        data = JSON.parse(xhrResult.text)
      } catch (e) {
        showAlert("Error", "Server error, please try again")
        return
      }

      if (xhrResult.status < 200 || xhrResult.status >= 300 || !data.success) {
        showAlert("Error", data.message || "Could not create profile");
        return;
      }

      showAlert("Success", "Your profile has been created", true);
      navigation.navigate("HomeScreen");
      
    } catch (err) {
      showAlert("Error", "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeAlert = () => {
    setAlertVisible(false);
  };

  return (
    <View className="flex-1 bg-[#0E0E10]">
      <View className="absolute w-[260px] h-[260px] rounded-full bg-[#8B5CF6] opacity-[0.06] -top-[60px] -left-[60px]" />
      <View className="absolute w-[220px] h-[220px] rounded-full bg-[#6366F1] opacity-[0.05] -bottom-[40px] -right-[40px]" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 items-center justify-center"
      >
        <ScrollView
          contentContainerStyle={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          className="w-full"
        >
        <BlurView
            intensity={40}
            tint="dark"
            className="w-[400px] rounded-2xl border border-white/[0.08] p-6 overflow-hidden"
          >
            <View className="flex-row items-center mb-6">
              {step === 2 && (
                <TouchableOpacity
                  onPress={() => setStep(1)}
                  activeOpacity={0.7}
                  className="w-[34px] h-[34px] rounded-full bg-[#111111] border border-[#2A2A2A] items-center justify-center mr-3"
                >
                  <ArrowLeft size={18} color="#9C9C9C" />
                </TouchableOpacity>
              )}
              <View className="flex-1">
                <Text className="text-white text-[22px] font-semibold tracking-[0.2px] mb-1">
                  {step === 1 ? "Create your profile" : "Tell us more"}
                </Text>
                <Text className="text-[#9C9C9C] text-[13px] leading-[18px]">
                  {step === 1 ? "Add a photo and username" : "Optional, you can skip this"}
                </Text>
              </View>
              <Text className="text-[#6B6B6B] text-[12px] font-medium">
                {step}/2
              </Text>
            </View>

            <View className="flex-row justify-center mb-7">
              <View
                className={`h-[3px] w-[32px] rounded-full mr-2 ${
                  step === 1 ? "bg-[#8B5CF6]" : "bg-[#2A2A2A]"
                }`}
              />
              <View
                className={`h-[3px] w-[32px] rounded-full ${
                  step === 2 ? "bg-[#8B5CF6]" : "bg-[#2A2A2A]"
                }`}
              />
            </View>

            {step === 1 ? (
              <>
                <View className="items-center mb-7">
                  <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.8}
                    className="w-[104px] h-[104px] rounded-full bg-[#111111] border border-[#2A2A2A] items-center justify-center overflow-hidden"
                  >
                    {avatar ? (
                      <Image source={{ uri: avatar.uri }} className="w-full h-full" />
                    ) : (
                      <Camera size={26} color="#9C9C9C" />
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={pickImage}
                    activeOpacity={0.8}
                    className="absolute bottom-[26px] right-[calc(50%-46px)] w-[30px] h-[30px] rounded-full bg-[#8B5CF6] items-center justify-center border-2 border-[#181818]"
                  >
                    <Pencil size={14} color="#0E0E10" />
                  </TouchableOpacity>

                  <Text className="text-[#9C9C9C] text-[13px] mt-3">
                    {avatar ? "Change photo" : "Upload photo"}
                  </Text>
                </View>

                <Text className="text-[#B0B0B0] text-[13px] font-medium mb-2">
                  Username
                </Text>
                <View className="flex-row items-center bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 mb-7">
                  <AtSign size={16} color="#6B6B6B" />
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    placeholder="yourusername"
                    placeholderTextColor="#6B6B6B"
                    autoCapitalize="none"
                    className="flex-1 text-white text-[15px] py-3 pl-2"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleNext}
                  activeOpacity={0.85}
                  className="bg-[#8B5CF6] rounded-xl py-[14px] items-center"
                >
                  <Text className="text-white text-[15px] font-bold tracking-[0.2px]">
                    Next
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text className="text-[#B0B0B0] text-[13px] font-medium mb-2">
                  Bio
                </Text>
                <View className="flex-row bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 py-3 mb-5">
                  <FileText size={16} color="#6B6B6B" style={{ marginTop: 2 }} />
                  <TextInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell people about yourself"
                    placeholderTextColor="#6B6B6B"
                    multiline
                    numberOfLines={3}
                    className="flex-1 text-white text-[15px] pl-2"
                    style={{ minHeight: 60, textAlignVertical: "top" }}
                  />
                </View>

                <Text className="text-[#B0B0B0] text-[13px] font-medium mb-2">
                  Link
                </Text>
                <View className="flex-row items-center bg-[#111111] border border-[#2A2A2A] rounded-xl px-4 mb-7">
                  <Link2 size={16} color="#6B6B6B" />
                  <TextInput
                    value={links}
                    onChangeText={setLinks}
                    placeholder="https://yourlink.com"
                    placeholderTextColor="#6B6B6B"
                    autoCapitalize="none"
                    className="flex-1 text-white text-[15px] py-3 pl-2"
                  />
                </View>

                <TouchableOpacity
                  onPress={handleCreateProfile}
                  disabled={loading}
                  activeOpacity={0.85}
                  className="bg-[#8B5CF6] rounded-xl py-[14px] items-center mb-3"
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text className="text-white text-[15px] font-bold tracking-[0.2px]">
                      Create Profile
                    </Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateProfile}
                  disabled={loading}
                  activeOpacity={0.7}
                >
                  <Text className="text-[#9C9C9C] text-[13px] text-center">
                    Skip for now
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </BlurView>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={alertVisible}
        transparent
        animationType="fade"
        onRequestClose={closeAlert}
      >
        <View className="flex-1 items-center justify-center bg-black/60 px-6">
          <View className="w-full max-w-[320px] bg-[#181818] rounded-2xl border border-[#2A2A2A] p-6">
            <View className="items-center mb-4">
              <View
                className={`w-[52px] h-[52px] rounded-full items-center justify-center mb-3 ${
                  alertSuccess ? "bg-[#8B5CF3]/15" : "bg-red-500/15"
                }`}
              >
                {alertSuccess ? (
                  <CheckCircle2 size={26} color="#8B5CF6" />
                ) : (
                  <AlertCircle size={26} color="#FF5C5C" />
                )}
              </View>
              <Text className="text-white text-[17px] font-semibold mb-1 text-center">
                {alertTitle}
              </Text>
              <Text className="text-[#9C9C9C] text-[14px] text-center leading-[19px]">
                {alertMessage}
              </Text>
            </View>
            <TouchableOpacity
              onPress={closeAlert}
              activeOpacity={0.85}
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