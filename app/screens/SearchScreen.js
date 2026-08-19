import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StatusBar,
  TextInput,
  FlatList,
  Image,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  Easing,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Search, X, User } from "lucide-react-native";
import BottomBar from "../components/App-Shell/BottomBar";
import { useAuth } from "../../contexts/AuthContext";

const API_URL = "http://192.168.100.77:5015/api";
const PURPLE = "#8B5CF6";
const PURPLE_DIM = "rgba(139,92,246,0.15)";

const ProfileRow = ({ item, index, onPress }) => {
  const fade = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(14)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 380,
        delay: Math.min(index, 8) * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 380,
        delay: Math.min(index, 8) * 45,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  return (
    <Animated.View style={{ opacity: fade, transform: [{ translateY }] }}>
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(item._id)}
      >
        <Animated.View
          style={{ transform: [{ scale }] }}
          className="flex-row items-center px-5 py-3"
        >
          <View
            style={{ borderColor: PURPLE_DIM }}
            className="w-12 h-12 rounded-full overflow-hidden bg-[#1C1C20] items-center justify-center border"
          >
            {item.avator ? (
              <Image
                source={{ uri: item.avator }}
                className="w-12 h-12"
                resizeMode="cover"
              />
            ) : (
              <User size={20} color="#6B6B72" />
            )}
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-white text-[15px] font-medium">
              {item.username}
            </Text>
          </View>
        </Animated.View>
        <View className="h-[1px] bg-[#1A1A1E] ml-[72px]" />
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [page, setPage] = useState(1);
  const {token} = useAuth();
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const debounceRef = useRef(null);
  const requestIdRef = useRef(0);

  const borderAnim = useRef(new Animated.Value(0)).current;

  const fetchProfiles = useCallback(async (searchTerm, pageNum) => {
    const currentRequestId = ++requestIdRef.current;
    try {
      const res = await fetch(
        `${API_URL}/profile/all-profiles?search=${encodeURIComponent(searchTerm)}&page=${pageNum}&limit=15`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const data = await res.json();

      if (currentRequestId !== requestIdRef.current) return;

      if (data.success) {
        setProfiles((prev) =>
          pageNum === 1 ? data.allProfiles : [...prev, ...data.allProfiles],
        );
        setHasMore(data.hasMore);
        setPage(pageNum);
      }
    } catch (err) {
      if (currentRequestId === requestIdRef.current) {
        setHasMore(false);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProfiles(query, 1);
    }, 350);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore || loading) return;
    setLoadingMore(true);
    fetchProfiles(query, page + 1);
  };

  const handleFocus = () => {
    Animated.timing(borderAnim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(borderAnim, {
      toValue: 0,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  };

  const handleRowPress = (profileId) => {
    navigation.navigate("UserProfileScreen", { profileId });
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["#1E1E22", PURPLE],
  });

  const shadowOpacity = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.35],
  });

  return (
    <View className="flex-1 bg-[#0E0E10]">
      <StatusBar barStyle="light-content" />

      <View style={{ paddingTop: insets.top + 14 }} className="px-5 pb-2">
        <Text className="text-white text-[22px] font-semibold mb-4">
          Search
        </Text>

        <Animated.View
          style={{
            borderColor,
            shadowColor: PURPLE,
            shadowOpacity,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
          }}
          className="flex-row items-center bg-[#121216] rounded-2xl px-4 py-3 border"
        >
          <Search size={18} color={query.length ? PURPLE : "#6B6B72"} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder="Search profiles"
            placeholderTextColor="#5A5A62"
            className="flex-1 ml-3 text-white text-[15px]"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")} hitSlop={10}>
              <X size={16} color="#8A8A93" />
            </TouchableOpacity>
          )}
        </Animated.View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={PURPLE} />
        </View>
      ) : (
        <FlatList
          data={profiles}
          keyExtractor={(item) => item._id}
          renderItem={({ item, index }) => (
            <ProfileRow item={item} index={index} onPress={handleRowPress} />
          )}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 90 }}
          ListEmptyComponent={
            <View className="items-center mt-25">
              <Search size={28} color="#3A3A40" />
              <Text className="text-white text-[14px] mt-3">
                No profiles found
              </Text>
            </View>
          }
          ListFooterComponent={
            loadingMore ? (
              <View className="py-4">
                <ActivityIndicator color={PURPLE} size="small" />
              </View>
            ) : null
          }
        />
      )}

      <BottomBar />
    </View>
  );
}
