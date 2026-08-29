import React, { useEffect, useState } from "react";
import { Image, Pressable, Text, View } from "react-native";
import { Bell, Home, Search, UserRound } from "lucide-react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { io } from "socket.io-client";
import { useAuth } from "../../../contexts/AuthContext";

const API_URL = "http://192.168.100.77:8081/api";
const SOCKET_URL = "http://192.168.100.77:8081";

export default function BottomBar() {
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { token, user } = useAuth();
  const [avatar, setAvatar] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationSwitch, setNotificationSwitch] = useState(true);

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

  useEffect(() => {
    const fetchNotificationSwitch = async () => {
      try {
        const res = await fetch(`${API_URL}/setting/get-notification-control`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && typeof data.notificationSwitch === "boolean") {
          setNotificationSwitch(data.notificationSwitch);
        }
      } catch (err) {}
    };
    fetchNotificationSwitch();
  }, [token]);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch(`${API_URL}/blog/my-notifications`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.notifications)) {
          const count = data.notifications.filter((n) => !n.read).length;
          setUnreadCount(count);
        }
      } catch (err) {}
    };
    fetchNotificationCount();
  }, [token]);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(SOCKET_URL);

    socket.emit("register", user._id);

    socket.on("newNotification", () => {
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?._id]);

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
      onPress: () => navigation.navigate("NotificationScreen"),
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
              <View>
                <Icon
                  size={22}
                  color={active ? "#F8FAFC" : "#A1A1AA"}
                  strokeWidth={2.25}
                />
                {key === "Notifications" && notificationSwitch && unreadCount > 0 && (
                  <View className="absolute -right-2 -top-1 w-[16px] h-[16px] items-center justify-center rounded-full bg-red-500 px-1">
                    <Text className="text-[9px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </Text>
                  </View>
                )}
              </View>
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