import React, { useEffect, useState } from "react";
import { View, Platform, StatusBar } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
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
    <KeyboardAwareScrollView 
      style={{ flex: 1, backgroundColor: "#0E0E10" }}
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }} 
      keyboardShouldPersistTaps="handled"
      enableOnAndroid={true}
      extraScrollHeight={60}
    >
      <StatusBar style="light" />
      {forgotPassword ? (
        <ForgotPassword setForgotPassword={setForgotPassword} />
      ) : !signin ? (
        <Login setSignIn={setSignIn} setForgotPassword={setForgotPassword} />
      ) : (
        <SignIn setSignIn={setSignIn} />
      )}
    </KeyboardAwareScrollView>
  );
}