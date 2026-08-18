import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Bell, Home, Search, UserRound } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../contexts/AuthContext";

const API_URL = "http://192.168.100.77:5015/api";

export default function BottomBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { token } = useAuth();
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const res = await fetch(`${API_URL}/profile/user-profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success && data.profile?.avator) {
          setAvatar(data.profile.avator);
        }
      } catch (err) {}
    };
    fetchAvatar();
  }, [token]);

  const tabs = [
    {
      key: "Home",
      name: "Home",
      icon: Home,
      onPress: () => navigation.navigate("HomeScreen"),
      active: route.name === "HomeScreen",
    },
    {
      key: "Search",
      name: "Search",
      icon: Search,
      onPress: () => navigation.navigate("SearchScreen"),
      active: false,
    },
    {
      key: "Notifications",
      name: "Alerts",
      icon: Bell,
      onPress: () => navigation.navigate("HomeScreen"),
      active: false,
    },
    {
      key: "Profile",
      name: "Profile",
      icon: UserRound,
      onPress: () => navigation.navigate("ProfileScreen"),
      active: route.name === "ProfileScreen",
    },
  ];

  return (
    <View
      className="absolute inset-x-4 bottom-0"
      style={{ paddingBottom: insets.bottom + 10 }}
    >
      <View className="flex-row items-center justify-between rounded-[28px] border border-white/10 bg-[#101216]/90 px-[18px] py-[10px] shadow-black shadow-2xl">
        {tabs.map(({ key, icon: Icon, onPress, active, name }) => (
          <Pressable
            key={key}
            onPress={onPress}
            className={`h-[52px] w-[52px] items-center justify-center rounded-[16px] ${
              active ? "bg-white/10" : "bg-transparent"
            }`}
            android_ripple={{ color: "rgba(255,255,255,0.08)" }}
          >
            {key === "Profile" && avatar ? (
              <Image
                source={{ uri: avatar }}
                className="h-[26px] w-[26px] rounded-full"
                style={{
                  borderWidth: active ? 1.5 : 0,
                  borderColor: "#F8FAFC",
                }}
              />
            ) : (
              <Icon
                size={22}
                color={active ? "#F8FAFC" : "#A1A1AA"}
                strokeWidth={2.25}
              />
            )}
            <Text className={`mt-1 text-[9px] ${active ? "text-white" : "text-zinc-400"}`}>
              {name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}