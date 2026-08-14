import React from "react";
import { Text, View } from "react-native";

export default function SignIn({ setSignIn }) {
  return (
    <View className="flex flex-col justify-center items-center">
      <Text className="text-[16px] text-white">SignIn</Text>
      <Text className="text-white" onPress={() => setSignIn(false)}>
        Back to Login
      </Text>
    </View>
  );
}