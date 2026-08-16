import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
} from "react-native";
import { Link2, PenLine, ShieldCheck, User } from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";

export default function UserProfile() {
  const API_URL = "http://192.168.100.77:5015/api";
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const { token } = useAuth();

  const resolveAvatarUrl = (path) => {
    if (!path) return null;
    // If an object with a uri (e.g. expo image) is passed, use its uri
    if (typeof path === "object" && path.uri) return path.uri;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = API_URL.replace(/\/api$/, "");
    return `${baseUrl}/${path.replace(/\\/g, "/")}`;
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile/user-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setProfile(data.profile || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0E0E10]">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  const postsCount = profile?.postsCount ?? 0;
  const likesCount = profile?.likesCount ?? 0;
  // Resolve avatar from possible fields (`avator` or `avatar`) and handle objects
  const avatarUrl = resolveAvatarUrl(profile?.avator ?? profile?.avatar);

  return (
    <ScrollView
      className="flex-1 bg-[#0E0E10]"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      <View className="px-5 pb-8 pt-10">
        <View className="mb-6 flex-row items-center justify-between">
          <Text className="text-[26px] font-bold text-white">Profile</Text>
          <Pressable className="h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5">
            <PenLine size={16} color="#F8FAFC" />
          </Pressable>
        </View>

        <View className="rounded-[30px] border border-white/10 bg-[#111317] p-4 shadow-black shadow-lg">
          <View className="mb-5 flex-row items-center">
            <View className="mr-4 h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full border border-[#2A2A2A] bg-[#1B1B1F]">
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  resizeMode="cover"
                  style={{ width: 92, height: 92, borderRadius: 46 }}
                />
              ) : (
                <User size={40} color="#71717A" />
              )}
            </View>

            <View className="flex-1 flex-row justify-around">
              <View className="items-center">
                <Text className="text-[18px] font-bold text-white">
                  {postsCount}
                </Text>
                <Text className="mt-1 text-[12px] text-zinc-400">Posts</Text>
              </View>
              <View className="items-center">
                <Text className="text-[18px] font-bold text-white">
                  {likesCount}
                </Text>
                <Text className="mt-1 text-[12px] text-zinc-400">Likes</Text>
              </View>
            </View>
          </View>

          <View className="mb-5">
            <View className="flex-row items-center">
              <Text className="text-[20px] font-bold text-white">
                {profile?.username || "Unknown user"}
              </Text>
              <ShieldCheck size={16} color="#8B5CF6" className="ml-2" />
            </View>
            <Text className="mt-1 text-[13px] text-zinc-400">
              {profile?.email || "No email available"}
            </Text>
          </View>

          <View className="mb-4 rounded-[20px] border border-white/5 bg-[#15181D] p-4">
            <Text className="mb-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              About
            </Text>
            <Text className="text-[14px] leading-6 text-zinc-300">
              {profile?.bio || "No bio added yet."}
            </Text>
          </View>

          <View className="rounded-[20px] border border-white/5 bg-[#15181D] p-3">
            <Text className="mb-2 text-[13px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Links
            </Text>
            {profile?.links ? (
              <View className="flex-row items-center">
                <Link2 size={15} color="#A1A1AA" />
                <Text className="ml-2 text-[14px] text-zinc-300">{profile.links}</Text>
              </View>
            ) : (
              <Text className="text-[14px] text-zinc-500">No links added yet.</Text>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}