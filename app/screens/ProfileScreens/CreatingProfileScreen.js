import React, { useState, useEffect } from "react";
import { StatusBar, View, Text, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../../../contexts/AuthContext";
import CreatingProfile from "../../components/Profile/CreatingProfile";

export default function CreatingProfileScreen() {

  const API_URL = "http://192.168.100.77:5015/api";

  const navigation = useNavigation();
  const { token } = useAuth();
  const [checking, setChecking] = useState(true);

  const checkProfile = async () => {
    try {
      const res = await fetch(`${API_URL}/profile/user-profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (res.ok && data.success && data.profile) {
        navigation.replace("HomeScreen");
        return;
      }

      setChecking(false);
    } catch (err) {
      setChecking(false);
      navigation.replace("CreatingProfileScreen")
    }
  };

  useEffect(() => {
    checkProfile();
  }, []);

  if (checking) {
    return (
      <View className="flex-1 justify-center items-center bg-[#0E0E10]">
        <StatusBar style="light" />
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }
  return (
    <>
      <View className="flex-1 justify-center items-center bg-[#0E0E10]">
        <StatusBar style="light" />
        <CreatingProfile />
      </View>
    </>
  );
}