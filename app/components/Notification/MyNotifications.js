import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = "http://192.168.100.77:5015/api";

const timeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
};

const NotificationItem = ({ item, onDelete }) => {
  const isLike = item.type === 'like';

  return (
    <View className="flex-row items-center px-4 py-3">
      <View className="relative">
        {item.avator ? (
          <Image
            source={{ uri: item.avator }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-[#1A1A1D] items-center justify-center">
            <Ionicons name="person" size={22} color="#8B5CF6" />
          </View>
        )}
        <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#0E0E10] items-center justify-center border border-[#0E0E10]">
          <View className="w-4 h-4 rounded-full bg-[#8B5CF6] items-center justify-center">
            <Ionicons
              name={isLike ? 'heart' : 'chatbubble'}
              size={9}
              color="#fff"
            />
          </View>
        </View>
      </View>

      <View className="flex ml-3">
        <Text className="text-white text-sm leading-5">
          <Text className="font-semibold">{item.username}</Text>
          {isLike ? ' liked your post' : ' commented on your post'}
          {!isLike && item.text ? (
            <Text className="text-[#8E8E93]">{`  "${item.text}"`}</Text>
          ) : null}
        </Text>
        <Text className="text-[#8E8E93] text-xs mt-1">
          {timeAgo(item.createdAt)}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => onDelete(item._id)}
        className="w-8 h-8 items-center justify-center"
      >
        <Ionicons name="trash-outline" size={18} color="#8E8E93" />
      </TouchableOpacity>
    </View>
  );
};

export default function MyNotifications() {
  const navigation = useNavigation();
  const { token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/blog/my-notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotifications();
  }, []);

  const handleDelete = async (id) => {
    Alert.alert('Delete Notification', 'Are you sure you want to remove this?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const prev = notifications;
          setNotifications((current) => current.filter((n) => n._id !== id));
          try {
            await fetch(`${API_URL}/blog/delete-notifications/${id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (error) {
            setNotifications(prev);
          }
        },
      },
    ]);
  };

  return (
    <View className="flex">
      <View className="flex-row items-center px-4 pt-14 pb-3 border-b border-[#1A1A1D]">
        <TouchableOpacity
          onPress={() => navigation.navigate('HomeScreen')}
          className="w-9 h-9 items-center justify-center -ml-2"
        >
          <Ionicons name="chevron-back" size={26} color="#fff" />
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold ml-2">
          Notifications
        </Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      ) : notifications.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8">
          <View className="w-20 h-20 rounded-full bg-[#1A1A1D] items-center justify-center mb-4">
            <Ionicons name="heart-outline" size={36} color="#8B5CF6" />
          </View>
          <Text className="text-white text-base font-semibold">
            No notifications yet
          </Text>
          <Text className="text-[#8E8E93] text-sm text-center mt-1">
            When someone likes or comments on your posts, you'll see it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotificationItem item={item} onDelete={handleDelete} />
          )}
          ItemSeparatorComponent={() => (
            <View className="h-[0.5px] bg-[#1A1A1D] ml-[68px]" />
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#8B5CF6"
            />
          }
        />
      )}
    </View>
  );
}