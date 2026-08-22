import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { io } from 'socket.io-client';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../../../contexts/AuthContext';

const API_URL = "http://192.168.100.77:5015/api";
const SOCKET_URL = "http://192.168.100.77:5015";
const LIMIT = 10;

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
        <View className="absolute -bottom-1 -right-1 w-full h-5 rounded-full bg-[#0E0E10] items-center justify-center border border-[#0E0E10]">
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

      <View className="flex-col justify-center items-center">
      {item.postcontent ? (
        <Image
          source={{ uri: item.postcontent }}
          className="w-11 h-11 rounded-md ml-2"
        />
      ) : (
        <View className="w-11 h-11 rounded-md ml-2 bg-[#1A1A1D] items-center justify-center">
          <Ionicons name="image-outline" size={18} color="#8E8E93" />
        </View>
      )}

      <TouchableOpacity
        onPress={() => onDelete(item._id)}
        className="w-8 h-8 items-center justify-center ml-1"
      >
        <Ionicons name="trash-outline" size={18} color="#8E8E93" />
      </TouchableOpacity>
    </View>
    </View>
  );
};

export default function MyNotifications() {
  const navigation = useNavigation();
  const { token, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const pendingBatchRef = useRef([]);
  const batchTimerRef = useRef(null);

  const fetchNotifications = async (pageNum = 1, isRefresh = false) => {
    try {
      const res = await fetch(
        `${API_URL}/blog/my-notifications?page=${pageNum}&limit=${LIMIT}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (data.success) {
        const incoming = data.notifications || [];
        setNotifications((current) =>
          isRefresh || pageNum === 1 ? incoming : [...current, ...incoming]
        );
        setHasMore(incoming.length === LIMIT);
        setPage(pageNum);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchNotifications(1);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const socket = io(SOCKET_URL);

    socket.emit("register", user._id);

    socket.on("newNotification", (notification) => {
      setNotifications((current) => [notification, ...current]);

      pendingBatchRef.current = [...pendingBatchRef.current, notification];

      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
      }

      batchTimerRef.current = setTimeout(async () => {
        const batch = pendingBatchRef.current;
        pendingBatchRef.current = [];
        batchTimerRef.current = null;

        if (batch.length === 0) return;

        await Notifications.scheduleNotificationAsync({
          content: {
            title: batch.length === 1 ? "New notification" : "New notifications",
            body:
              batch.length === 1
                ? `${batch[0].username} ${batch[0].type === 'like' ? 'liked' : 'commented on'} your post`
                : `You have ${batch.length} new notifications`,
          },
          trigger: null,
        });
      }, 1500);
    });

    return () => {
      if (batchTimerRef.current) {
        clearTimeout(batchTimerRef.current);
        batchTimerRef.current = null;
      }
      pendingBatchRef.current = [];
      socket.disconnect();
    };
  }, [user?._id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setHasMore(true);
    fetchNotifications(1, true);
  }, []);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    fetchNotifications(page + 1);
  };

  const handleDelete = (id) => {
    setDeleteTarget(id);
  };

  const cancelDelete = () => {
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    const id = deleteTarget;
    setDeleteTarget(null);
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
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4 items-center justify-center">
                <ActivityIndicator size="small" color="#8B5CF6" />
              </View>
            ) : null
          }
        />
      )}

      <Modal
        visible={!!deleteTarget}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View className="flex-1 items-center justify-center bg-black/70 px-8">
          <View className="w-full bg-[#1A1A1D] rounded-2xl px-5 py-6 border border-[#2A2A2E]">
            <View className="w-14 h-14 rounded-full bg-[#0E0E10] items-center justify-center self-center mb-4">
              <Ionicons name="trash-outline" size={26} color="#8B5CF6" />
            </View>
            <Text className="text-white text-base font-semibold text-center">
              Delete Notification
            </Text>
            <Text className="text-[#8E8E93] text-sm text-center mt-2">
              Are you sure you want to remove this? This action cannot be undone.
            </Text>
            <View className="flex-row mt-6">
              <TouchableOpacity
                onPress={cancelDelete}
                className="flex-1 h-11 rounded-xl bg-[#0E0E10] items-center justify-center mr-2 border border-[#2A2A2E]"
              >
                <Text className="text-white text-sm font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={confirmDelete}
                className="flex-1 h-11 rounded-xl bg-[#8B5CF6] items-center justify-center ml-2"
              >
                <Text className="text-white text-sm font-semibold">Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}