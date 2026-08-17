import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  ScrollView,
  Pressable,
  RefreshControl,
  Linking,
} from "react-native";
import ManagingPosts from "./ManagingPosts";
import { LinearGradient } from "expo-linear-gradient";
import {
  Link2,
  PenLine,
  ShieldCheck,
  User,
  Mail,
  Sparkles,
} from "lucide-react-native";
import { useAuth } from "../../../contexts/AuthContext";
import EditProfile from "./EditProfile";

export default function UserProfile() {
  const API_URL = "http://192.168.100.77:5015/api";
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState(null);
  const [edit, setEdit] = useState("");
  const { token } = useAuth();

  const resolveAvatarUrl = (path) => {
    if (!path) return null;
    if (typeof path === "object" && path.uri) return path.uri;
    if (path.startsWith("http://") || path.startsWith("https://")) return path;
    const baseUrl = API_URL.replace(/\/api$/, "");
    return `${baseUrl}/${path.replace(/\\/g, "/")}`;
  };

  const getLinksArray = (links) => {
    if (!links) return [];
    if (Array.isArray(links)) return links.filter(Boolean);
    if (typeof links === "string") return links.split(",").map((l) => l.trim()).filter(Boolean);
    return [];
  };

  const openLink = (link) => {
    const url = link.startsWith("http") ? link : `https://${link}`;
    Linking.openURL(url);
  };

  const fetchProfile = async (isRefresh = false) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
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
      isRefresh ? setRefreshing(false) : setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0B0B0D]">
        <ActivityIndicator color="#8B5CF6" size="large" />
      </View>
    );
  }

  const postsCount = profile?.postsCount ?? 0;
  const likesCount = profile?.likesCount ?? 0;
  const avatarUrl = resolveAvatarUrl(profile?.avator ?? profile?.avatar);
  const linksArray = getLinksArray(profile?.links);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 140 }}
      scrollEnabled={!edit}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => fetchProfile(true)}
          tintColor="#8B5CF6"
        />
      }
    >
      <View className="px-5 pb-8 pt-10">
        <View className="mb-7 flex-row items-center justify-between">
          <View>
            <Text className="text-[26px] font-bold text-white">Profile</Text>
            <Text className="mt-0.5 text-[13px] text-zinc-500">
              Your public presence
            </Text>
          </View>
          <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] active:opacity-70"
          onPress={()=>{setEdit(true)}}>
            <PenLine size={16} color="#F4F4F5"/>
          </Pressable>
        </View>

        <View className="overflow-hidden rounded-[32px] border border-white/[0.08] bg-[#121216]">
          <LinearGradient
            colors={["rgba(139,92,246,0.18)", "rgba(18,18,22,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}
          >
            <View className="flex-row items-center">
              <View className="mr-4">
                <LinearGradient
                  colors={["#8B5CF6", "#6366F1"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 96,
                    height: 96,
                    borderRadius: 48,
                    padding: 3,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View className="h-[90px] w-[90px] items-center justify-center overflow-hidden rounded-full bg-[#1B1B1F]">
                    {avatarUrl ? (
                      <Image
                        source={{ uri: avatarUrl }}
                        resizeMode="cover"
                        style={{ width: 90, height: 90, borderRadius: 45 }}
                      />
                    ) : (
                      <User size={38} color="#A1A1AA" />
                    )}
                  </View>
                </LinearGradient>
              </View>

              <View className="flex-1 flex-row justify-around">
                <View className="items-center">
                  <Text className="text-[19px] font-bold text-white">
                    {postsCount}
                  </Text>
                  <Text className="mt-1 text-[11px] uppercase tracking-[0.15em] text-zinc-500">
                    Posts
                  </Text>
                </View>
                <View className="h-8 w-px bg-white/10" />
                <View className="items-center">
                  <Text className="text-[19px] font-bold text-white">
                    {likesCount}
                  </Text>
                  <Text className="mt-1 text-[11px] uppercase tracking-[0.15em] text-zinc-500">
                    Likes
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-5">
              <View className="flex-row items-center">
                <Text className="text-[21px] font-bold text-white">
                  {profile?.username || "Unknown user"}
                </Text>
                <View className="ml-2">
                  <ShieldCheck size={17} color="#8B5CF6" />
                </View>
              </View>
              <View className="mt-1.5 flex-row items-center">
                <Mail size={12} color="#71717A" />
                <Text className="ml-1.5 text-[13px] text-zinc-500">
                  {profile?.email || "No email available"}
                </Text>
              </View>
            </View>
          </LinearGradient>

          <View className="px-5 pb-5 mt-3">
            <View className="mb-3 rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-4">
              <View className="mb-2 flex-row items-center">
                <Sparkles size={13} color="#8B5CF6" />
                <Text className="ml-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                  Bio
                </Text>
              </View>
              <Text className="text-[14px] leading-6 text-zinc-300">
                {profile?.bio || "No bio added yet."}
              </Text>
            </View>

             <View className="rounded-[22px] border border-white/[0.07] bg-white/[0.03] p-4">
              <Text className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Links
              </Text>
              {linksArray.length > 0 ? (
                linksArray.map((link, index) => (
                  <Pressable
                    key={index}
                    className="flex-row items-center active:opacity-70 mb-2 last:mb-0"
                    onPress={() => openLink(link)}
                  >
                    <View className="h-7 w-7 items-center justify-center rounded-full bg-[#8B5CF6]/15">
                      <Link2 size={13} color="#A78BFA" />
                    </View>
                    <Text className="ml-2.5 text-[14px] text-zinc-300">
                      {link}
                    </Text>
                  </Pressable>
                ))
              ) : (
                <Text className="text-[14px] text-zinc-600">
                  No links added yet.
                </Text>
              )}
            </View>
          </View>
        </View>
        <View className="w-full h-[1px] mt-3 bg-white/50"></View>
      </View>

      <EditProfile edit={edit} setEdit={setEdit} setProfile={setProfile}/>
      <ManagingPosts />
    </ScrollView>
  );
}