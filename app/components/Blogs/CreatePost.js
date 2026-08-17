import React, { useState, useRef } from "react"
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from "react-native"
import * as ImagePicker from "expo-image-picker"
import { Video } from "expo-av"
import { ImagePlus, X, Sparkles } from "lucide-react-native"
import { useAuth } from "../../../contexts/AuthContext"

export default function CreatePost() {
  const API_URL = "http://192.168.100.77:5015/api"
  const { token } = useAuth()

  const [title, setTitle] = useState("")
  const [desc, setDesc] = useState("")
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState("")
  const [status, setStatus] = useState(null)
  const scaleAnim = useRef(new Animated.Value(1)).current

  const animatePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 90, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 90, useNativeDriver: true }),
    ]).start()
  }

  const pickMedia = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setStatus({ type: "error", message: "Media permission required" })
      setTimeout(() => setStatus(null), 2500)
      return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 0.8,
    })

    if (!result.canceled) {
      setMedia(result.assets[0])
    }
  }

  const removeMedia = () => setMedia(null)

  const handleCreate = async () => {
    try {
      if (!media || !title) {
        setStatus({ type: "error", message: "Please fill all fields" })
        setTimeout(() => setStatus(null), 2500)
        return
      }

      setLoading(true)
      setStatus(null)

      const formData = new FormData()
      formData.append("title", title)
      formData.append("desc", desc)
      formData.append("content", {
        uri: media.uri,
        name: media.fileName || `upload-${Date.now()}.${media.type === "video" ? "mp4" : "jpg"}`,
        type: media.type === "video" ? "video/mp4" : "image/jpeg",
      })

      const res = await fetch(`${API_URL}/blog/create-post`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      const contentType = res.headers.get("content-type") || ""

      if (!contentType.includes("application/json")) {
        setStatus({ type: "error", message: "Server error, please try again" })
        setTimeout(() => setStatus(null), 2500)
        return
      }

      const data = await res.json()

      if (data.success) {
        setStatus({ type: "success", message: data.message || "Post created successfully" })
        setTitle("")
        setDesc("")
        setMedia(null)
        setTimeout(() => setStatus(null), 2000)
      } else {
        setStatus({ type: "error", message: data.message || "Something went wrong" })
        setTimeout(() => setStatus(null), 2500)
      }
    } catch (err) {
      console.log(err)
      setStatus({ type: "error", message: err.message})
      setTimeout(() => setStatus(null), 2500)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 w-full"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
        className="flex-1 px-5 pt-10"
      >
        <View className="mb-7">
          <Text className="text-[26px] font-bold text-white">Create Post</Text>
          <Text className="mt-0.5 text-[13px] text-zinc-500">Share something new</Text>
        </View>

        {status && (
          <View
            className={`mb-5 px-4 py-3 rounded-2xl border ${
              status.type === "success"
                ? "bg-purple-500/10 border-purple-500"
                : "bg-red-500/10 border-red-500"
            }`}
          >
            <Text
              className={`text-sm font-medium ${
                status.type === "success" ? "text-purple-400" : "text-red-400"
              }`}
            >
              {status.message}
            </Text>
          </View>
        )}

        <Pressable onPress={pickMedia} className="mb-6">
          {media ? (
            <View className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#121216]">
              {media.type === "video" ? (
                <Video
                  source={{ uri: media.uri }}
                  style={{ width: "100%", height: 260 }}
                  useNativeControls
                  resizeMode="cover"
                />
              ) : (
                <Image
                  source={{ uri: media.uri }}
                  style={{ width: "100%", height: 260 }}
                  resizeMode="cover"
                />
              )}
              <Pressable
                onPress={removeMedia}
                className="absolute top-3 right-3 h-9 w-9 items-center justify-center rounded-full bg-black/60 active:opacity-70"
              >
                <X size={16} color="#F4F4F5" />
              </Pressable>
            </View>
          ) : (
            <View className="items-center justify-center rounded-[28px] border border-dashed border-white/[0.12] bg-white/[0.03] py-14">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-[#8B5CF6]/15">
                <ImagePlus size={24} color="#A78BFA" />
              </View>
              <Text className="text-[14px] font-medium text-zinc-300">Add photo or video</Text>
              <Text className="mt-1 text-[12px] text-zinc-600">Tap to select from your library</Text>
            </View>
          )}
        </Pressable>

        <View className="mb-5">
          <Text className="text-neutral-400 text-xs mb-2 ml-1">Title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            onFocus={() => setFocusedField("title")}
            onBlur={() => setFocusedField("")}
            placeholder="Give your post a title"
            placeholderTextColor="#525252"
            className={`bg-neutral-900 text-white px-4 py-4 rounded-2xl border ${
              focusedField === "title" ? "border-purple-500" : "border-neutral-800"
            }`}
          />
        </View>

        <View className="mb-8">
          <Text className="text-neutral-400 text-xs mb-2 ml-1">Description</Text>
          <TextInput
            value={desc}
            onChangeText={setDesc}
            onFocus={() => setFocusedField("desc")}
            onBlur={() => setFocusedField("")}
            placeholder="Write a short description"
            placeholderTextColor="#525252"
            multiline
            numberOfLines={4}
            className={`bg-neutral-900 text-white px-4 py-4 rounded-2xl border h-28 ${
              focusedField === "desc" ? "border-purple-500" : "border-neutral-800"
            }`}
            style={{ textAlignVertical: "top" }}
          />
        </View>

        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <Pressable
            onPress={() => {
              animatePress()
              handleCreate()
            }}
            disabled={loading}
            className="bg-purple-600 rounded-full py-4 items-center active:bg-purple-700 flex-row justify-center"
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Sparkles size={16} color="#ffffff" />
                <Text className="text-white font-semibold text-base ml-2">Publish Post</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}