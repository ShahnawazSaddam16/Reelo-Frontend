import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DangerZone from '../components/Settings/DangerZone';
import NotificationsControls from '../components/Settings/NotificationsControls';

export default function SettingsHeader() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="bg-[#0E0E10] border-b border-[#1F1F22]"
      >
        <View className="flex-row gap-2 items-center w-full px-4 h-14">
          <TouchableOpacity
            onPress={() => navigation.navigate('HomeScreen')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            className="w-9 h-9 rounded-full items-center justify-center bg-[#1A1A1D]"
          >
            <Ionicons name="arrow-back" size={20} color="#fff" />
          </TouchableOpacity>

          <Text className="text-white text-xl font-semibold ml-4 tracking-tight">
            Settings
          </Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <NotificationsControls />
        <DangerZone />
      </ScrollView>
    </View>
  );
}