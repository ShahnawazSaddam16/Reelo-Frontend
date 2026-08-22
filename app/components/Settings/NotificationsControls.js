import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = "http://192.168.100.77:5015/api";

export default function NotificationsControls() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [notificationSwitch, setNotificationSwitch] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch(`${API_URL}/setting/get-notification-control`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && typeof data.notificationSwitch === 'boolean') {
          setNotificationSwitch(data.notificationSwitch);
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSetting();
  }, []);

  const toggleSwitch = async (value) => {
    setNotificationSwitch(value);
    setLoading(true);
    try {
      await fetch(`${API_URL}/setting/create-notification-control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationSwitch: value }),
      });
    } catch (error) {
      setNotificationSwitch(!value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="w-full flex-row items-center px-4 pt-1 pb-3">
        <Text className="text-white text-lg font-bold ml-2">
          Notifications
        </Text>
      </View>

      <View className="px-4 border-b border-[#1A1A1D] mb-5 pb-3">
        <View className="flex-row items-center justify-between bg-[#101216] rounded-2xl border border-[#1A1A1D] px-4 py-4">
          <View className="flex-1 pr-4">
            <Text className="text-white text-base font-semibold">
              Push Notifications
            </Text>
            <Text className="text-[#A1A1AA] text-xs mt-1">
              Get notified when someone likes or comments on your posts
            </Text>
          </View>
          <Switch
            value={notificationSwitch}
            onValueChange={toggleSwitch}
            disabled={loading}
            trackColor={{ false: '#1A1A1D', true: '#8B5CF6' }}
            thumbColor="#fff"
            ios_backgroundColor="#1A1A1D"
          />
        </View>
      </View>
    </View>
  );
}