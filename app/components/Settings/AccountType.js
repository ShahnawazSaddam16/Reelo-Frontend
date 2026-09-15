import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = "https://api.reelo.buttnetworks.com/api";

export default function AccountType() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      try {
        const res = await fetch(`${API_URL}/setting/get-notification-control`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && typeof data.accountType === 'string') {
          setIsPrivate(data.accountType === 'private');
        }
      } catch (error) {
        console.log(error);
      }
    };

    fetchSetting();
  }, []);

  const toggleAccountType = async (value) => {
    setIsPrivate(value);
    setLoading(true);
    try {
      await fetch(`${API_URL}/setting/update-account-type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accountType: value ? 'private' : 'public' }),
      });
    } catch (error) {
      setIsPrivate(!value);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <View className="w-full flex-row items-center px-4 pt-1 pb-3">
        <Text className="text-white text-lg font-bold ml-2">
          Account Type
        </Text>
      </View>

      <View className="px-4 border-b border-[#1A1A1D] mb-5 pb-3">
        <View className="flex-row items-center justify-between bg-[#101216] rounded-2xl border border-[#1A1A1D] px-4 py-4">
          <View className="flex-1 pr-4">
            <Text className="text-white text-base font-semibold">
              Private Account
            </Text>
            <Text className="text-[#A1A1AA] text-xs mt-1">
              Only approved followers can see your posts
            </Text>
          </View>
          <Switch
            value={isPrivate}
            onValueChange={toggleAccountType}
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