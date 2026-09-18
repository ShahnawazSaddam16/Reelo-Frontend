import React, { useState, useEffect } from 'react';
import { View, Text, Switch, TouchableOpacity, TextInput, Alert, ScrollView, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';
import { API_URL } from "../../config/api";

export default function AccountType() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [followLoading, setFollowLoading] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [followersLoading, setFollowersLoading] = useState(false);
  const [customAlert, setCustomAlert] = useState({ visible: false, title: '', message: '' });

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
    fetchFollowers();
  }, []);

  const fetchFollowers = async () => {
    setFollowersLoading(true);
    try {
      const res = await fetch(`${API_URL}/setting/get-followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.followers)) {
        setFollowers(data.followers);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setFollowersLoading(false);
    }
  };

  const showAlert = (title, message) => {
    setCustomAlert({ visible: true, title, message });
  };

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

  const addFollower = async () => {
    if (!username.trim()) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/setting/add-follower`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert('Error', data.message || 'Could not add follower');
      } else {
        setUsername('');
        fetchFollowers();
      }
    } catch (error) {
      showAlert('Error', 'Something went wrong');
    } finally {
      setFollowLoading(false);
    }
  };

  const removeFollower = async () => {
    if (!username.trim()) return;
    setFollowLoading(true);
    try {
      const res = await fetch(`${API_URL}/setting/remove-follower`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showAlert('Error', data.message || 'Could not remove follower');
      } else {
        setUsername('');
        fetchFollowers();
      }
    } catch (error) {
      showAlert('Error', 'Something went wrong');
    } finally {
      setFollowLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1">
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

      <View className="w-full flex-row items-center px-4 pt-1 pb-3">
        <Text className="text-white text-lg font-bold ml-2">
          Manage Followers
        </Text>
      </View>

      <View className="px-4 border-b border-[#1A1A1D] mb-5 pb-3">
        <View className="bg-[#101216] rounded-2xl border border-[#1A1A1D] px-4 py-4">
          <Text className="text-white text-base font-semibold mb-1">
            Follower Username
          </Text>
          <Text className="text-[#A1A1AA] text-xs mb-3">
            Enter a username to add or remove them as a follower
          </Text>

          <TextInput
            value={username}
            onChangeText={setUsername}
            placeholder="Enter username"
            placeholderTextColor="#A1A1AA"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!followLoading}
            className="bg-[#0B0B0E] text-white rounded-xl px-4 py-3 border border-[#1A1A1D] mb-4"
          />

          <View className="flex-row justify-between">
            <TouchableOpacity
              onPress={addFollower}
              disabled={followLoading || !username.trim()}
              className="flex-1 mr-2 bg-[#8B5CF6] rounded-xl py-3 items-center opacity-100"
              style={{ opacity: followLoading || !username.trim() ? 0.5 : 1 }}
            >
              <Text className="text-white text-sm font-semibold">
                Add Follower
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={removeFollower}
              disabled={followLoading || !username.trim()}
              className="flex-1 ml-2 bg-[#101216] border border-[#1A1A1D] rounded-xl py-3 items-center"
              style={{ opacity: followLoading || !username.trim() ? 0.5 : 1 }}
            >
              <Text className="text-white text-sm font-semibold">
                Remove Follower
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View className="w-full flex-row items-center px-4 pt-1 pb-3">
        <Text className="text-white text-lg font-bold ml-2">
          Followers
        </Text>
      </View>

      <View className="px-4 border-b border-[#1A1A1D] mb-5 pb-3 flex-1">
        {followersLoading ? (
          <ActivityIndicator color="#8B5CF6" />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {followers.length === 0 ? (
              <Text className="text-[#A1A1AA] text-xs">
                No followers yet
              </Text>
            ) : (
              followers.map((follower, index) => (
                <View
                  key={follower._id || index}
                  className="flex-row items-center bg-[#101216] rounded-2xl border border-[#1A1A1D] px-4 py-3 mb-3"
                >
                  {follower.avator ? (
                    <Image
                      source={{ uri: follower.avator }}
                      style={{ width: 40, height: 40, borderRadius: 20, marginRight: 12 }}
                    />
                  ) : (
                    <Ionicons name="person-circle" size={40} color="#fff" style={{ marginRight: 12 }} />
                  )}
                  <Text className="text-white text-sm font-semibold">
                    {follower.username}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}