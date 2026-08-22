import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import ConfirmationPopup from './ConfirmationPopup';

const API_URL = "http://192.168.100.77:5015/api";


export default function DangerZone() {
  const navigation = useNavigation();
  const { logout, token } = useAuth();
  const [logoutVisible, setLogoutVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const handleLogout = async () => {
    setLogoutVisible(false);
    await logout();
    navigation.navigate("AuthScreen");
  };

  const handleDelete = async () => {
    setDeleteVisible(false);
    await fetch(`${API_URL}/auth/delete-account`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    navigation.navigate("AuthScreen");
  };

  return (
    <View className="w-full ml-[1.5px]">
      <Text className="ml-2 text-[#EF4444] text-lg font-semibold px-1 mb-3">Danger Zone</Text>

      <View className="w-full bg-[#161618] rounded-2xl overflow-hidden">
        <TouchableOpacity
          onPress={() => setLogoutVisible(true)}
          className="w-full flex-row items-center justify-between px-4 py-4 border-b border-[#2A2A2E]"
        >
          <View className="flex-row items-center">
            <Ionicons name="log-out-outline" size={20} color="#A78BFA" />
            <Text className="text-white text-base ml-3">Logout</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B6B70" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setDeleteVisible(true)}
          className="w-full flex-row items-center justify-between px-4 py-4"
        >
          <View className="flex-row items-center">
            <Ionicons name="trash-outline" size={20} color="#EF4444" />
            <Text className="text-red-500 text-base ml-3">Delete Account</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#6B6B70" />
        </TouchableOpacity>
      </View>

      <ConfirmationPopup
        visible={logoutVisible}
        title="Logout"
        message="Are you sure you want to logout?"
        confirmText="Logout"
        cancelText="Cancel"
        onCancel={() => setLogoutVisible(false)}
        onConfirm={handleLogout}
      />

      <ConfirmationPopup
        visible={deleteVisible}
        title="Delete Account"
        message="This action is permanent and cannot be undone. All your posts, profile and data will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onCancel={() => setDeleteVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}