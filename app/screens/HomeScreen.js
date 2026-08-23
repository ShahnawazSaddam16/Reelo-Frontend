import React, { useCallback } from "react";
import { StatusBar, View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useFonts, GrandHotel_400Regular } from "@expo-google-fonts/grand-hotel";
import * as SplashScreen from "expo-splash-screen";
import BottomBar from "../components/App-Shell/BottomBar";
import Stories from "../components/Home/Stories";
import PostCards from "../components/Home/PostCards";

SplashScreen.preventAutoHideAsync();

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    GrandHotel_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View className="flex-1 bg-[#0E0E10]" onLayout={onLayoutRootView}>
      <StatusBar barStyle="light-content" />
      <View className="flex mt-10 justify-center items-center">
        <Text
          style={{
            fontFamily: "GrandHotel_400Regular",
            fontSize: 34,
            color: "#fff",
          }}
        >
          Reelo
        </Text>
      </View>
      <Stories/>
      <View className="flex-1 justify-center items-center">
        <PostCards />
      </View>
      <BottomBar />
    </View>
  );
}