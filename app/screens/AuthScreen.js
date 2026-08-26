import React, { useEffect, useState } from "react";
import { View, StatusBar } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Login from "../components/Auth/Login";
import SignIn from "../components/Auth/SignIn";
import ForgotPassword from "../components/Auth/ForgotPassword";
import { useAuth } from "../../contexts/AuthContext";

export default function AuthScreen() {
  const [signin, setSignIn] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const navigation = useNavigation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      navigation.replace("CreatingProfileScreen");
    }
  }, [isLoggedIn, navigation]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <View className="flex-1 justify-center items-center bg-[#0E0E10]">
      <StatusBar style="light" />
      {forgotPassword ? (
        <ForgotPassword setForgotPassword={setForgotPassword} />
      ) : !signin ? (
        <Login setSignIn={setSignIn} setForgotPassword={setForgotPassword} />
      ) : (
        <SignIn setSignIn={setSignIn} />
      )}
    </View>
  );
}