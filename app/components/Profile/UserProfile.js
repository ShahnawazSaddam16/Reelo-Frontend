import React, { useState, useEffect } from 'react';
import { View, Text, Image, ActivityIndicator, ScrollView } from 'react-native';
import { Link2 } from 'lucide-react-native';
import { useAuth } from '../../../contexts/AuthContext';

export default function UserProfile() {
  const API_URL = "http://192.168.100.77:5015/api";

  const [loading, setLoading]= useState("");
  const [profile, setProfile] = useState("");
  const {token} = useAuth();

  const fetchProfile = async () => {
    setLoading(true);
    try{
      const res = await fetch(`${API_URL}/profile/user-profile`,{
        method: "GET",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
      });

      const data = await res.json();
      if(data.success){
        setProfile(data.profile);
      }
    } catch(err){
      console.error(err);
    } finally{
      setLoading(false);
    }
  }


    useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-[#0E0E10]">
        <ActivityIndicator color="#FFFFFF" size="large" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-[#0E0E10]" showsVerticalScrollIndicator={false}>
      <View className="px-6 pt-10 pb-8">
        <View className="flex-row items-center mb-6">
          <View className="w-[88px] h-[88px] rounded-full bg-[#111111] border border-[#2A2A2A] items-center justify-center overflow-hidden mr-6">
            {profile.avator ? (
              <Image source={{ uri: profile.avator }} className="w-full h-full" />
            ) : (
              <Text className="text-white text-[28px] font-bold">
                {profile.username ? profile.username.charAt(0).toUpperCase() : "U"}
              </Text>
            )}
          </View>

          <View className="flex-1 flex-row justify-around">
            <View className="items-center">
              <Text className="text-white text-[18px] font-bold">
                {profile.totalPosts ?? 0}
              </Text>
              <Text className="text-[#8A8A8A] text-[13px] mt-1">Posts</Text>
            </View>
            <View className="items-center">
              <Text className="text-white text-[18px] font-bold">
                {profile.totalLikes ?? 0}
              </Text>
              <Text className="text-[#8A8A8A] text-[13px] mt-1">Likes</Text>
            </View>
          </View>
        </View>

        <Text className="text-white text-[18px] font-bold mb-1">
          {profile.username}
        </Text>
        <Text className="text-[#8A8A8A] text-[14px] mb-4">
          {profile.email}
        </Text>

        {profile.bio ? (
          <Text className="text-[#D0D0D0] text-[14px] leading-[20px] mb-3">
            {profile.bio}
          </Text>
        ) : null}

        {profile.links ? (
          <View className="flex-row items-center">
            <Link2 size={15} color="#6B6B6B" />
            <Text className="text-[#8A8A8A] text-[14px] ml-2">
              {profile.links}
            </Text>
          </View>
        ) : null}
      </View>
    </ScrollView>
  )
}