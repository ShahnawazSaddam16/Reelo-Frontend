import React, { useState, useEffect, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Plus, User } from 'lucide-react-native'
import { useAuth } from '../../../contexts/AuthContext'
import StoryViewer from './StoryViewer'
import CreateStory from './CreateStory'

const PAGE_SIZE = 10

export default function Stories() {
  const API_URL = 'http://192.168.100.77:5015/api'
  const { token, user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [myStories, setMyStories] = useState([])
  const [otherGroups, setOtherGroups] = useState([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [viewerVisible, setViewerVisible] = useState(false)
  const [activeGroup, setActiveGroup] = useState(null)
  const [createVisible, setCreateVisible] = useState(false)
  const loadingMoreRef = useRef(false)

  const resolveAvatarUrl = (path) => {
    if (!path) return null
    if (typeof path === 'object' && path.uri) return path.uri
    if (path.startsWith('http://') || path.startsWith('https://')) return path
    const baseUrl = API_URL.replace(/\/api$/, '')
    return `${baseUrl}/${path.replace(/\\/g, '/')}`
  }

  const safeParseJSON = async (res) => {
    try {
      return await res.json()
    } catch (e) {
      const text = await res.text().catch(() => '')
      return { success: false, message: text || 'Non-JSON response from server' }
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }

      const [profileRes, storyRes, allStoriesRes] = await Promise.all([
        fetch(`${API_URL}/profile/my-profile`, { method: 'GET', headers }),
        fetch(`${API_URL}/story/get-story`, { method: 'GET', headers }),
        fetch(`${API_URL}/story/get-all-stories`, { method: 'GET', headers }),
      ])

      const profileData = await safeParseJSON(profileRes)
      const storyData = await safeParseJSON(storyRes)
      const allStoriesData = await safeParseJSON(allStoriesRes)

      if (profileData && profileData.success) setProfile(profileData.profile || null)
      if (storyData && storyData.success) setMyStories(storyData.stories || [])

      if (allStoriesData && allStoriesData.success) {
        const list = allStoriesData.allStories || []
        const grouped = {}
        const myId = String(user?._id || '')

        list.forEach((story) => {
          const uid = String(story.userId?._id || story.userId || '')
          if (!uid || uid === myId) return
          if (!grouped[uid]) {
            grouped[uid] = {
              userId: uid,
              username: story.userId?.username || story.username || 'Unknown',
              avatar: resolveAvatarUrl(story.userId?.avator || story.avator),
              stories: [],
            }
          }
          grouped[uid].stories.push(story)
        })

        setOtherGroups(Object.values(grouped))
      }
    } catch (err) {
      console.error(err)
    }
  }, [token, user])

  useEffect(() => {
    if (token && user?._id) fetchData()
  }, [token, user, fetchData])

  const hasMyStory = myStories.length > 0
  const myAvatarUrl = resolveAvatarUrl(profile?.avator)

  const handleMyAvatarPress = () => {
    if (hasMyStory) {
      setActiveGroup({ username: 'Your Story', avatar: myAvatarUrl, stories: myStories })
      setViewerVisible(true)
    } else {
      setCreateVisible(true)
    }
  }

  const handleUserAvatarPress = (group) => {
    setActiveGroup(group)
    setViewerVisible(true)
  }

  const handleScroll = (e) => {
    const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent
    const reachedEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 60

    if (reachedEnd && !loadingMoreRef.current && visibleCount < otherGroups.length) {
      loadingMoreRef.current = true
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, otherGroups.length))
      setTimeout(() => {
        loadingMoreRef.current = false
      }, 300)
    }
  }

  const visibleGroups = otherGroups.slice(0, visibleCount)

  return (
    <View
      style={{ borderBottomColor: 'rgba(255,255,255,0.12)', borderBottomWidth: 1, backgroundColor: '#0E0E10', paddingBottom: 4 }}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        className="mt-10"
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
      >
        <TouchableOpacity onPress={handleMyAvatarPress} activeOpacity={0.8} style={{ alignItems: 'center', marginRight: 16 }}>
          {hasMyStory ? (
            <LinearGradient
              colors={['#a855f7', '#06b6d4', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#0E0E10', alignItems: 'center', justifyContent: 'center' }}>
                {myAvatarUrl ? (
                  <Image source={{ uri: myAvatarUrl }} style={{ width: 52, height: 52, borderRadius: 26 }} />
                ) : (
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#1B1B1F', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} color="#A1A1AA" />
                  </View>
                )}
              </View>
            </LinearGradient>
          ) : (
            <View style={{ width: 64, height: 64 }}>
              {myAvatarUrl ? (
                <Image
                  source={{ uri: myAvatarUrl }}
                  style={{ width: 64, height: 64, borderRadius: 32, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' }}
                />
              ) : (
                <View
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 32,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.12)',
                    backgroundColor: '#1B1B1F',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <User size={26} color="#A1A1AA" />
                </View>
              )}
              <View
                style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: '#a855f7',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#0E0E10',
                }}
              >
                <Plus size={13} color="#0E0E10" strokeWidth={3} />
              </View>
            </View>
          )}
          <Text className="text-white text-xs mt-2" numberOfLines={1} style={{ maxWidth: 64 }}>
            Your Story
          </Text>
        </TouchableOpacity>

        {visibleGroups.map((group) => (
          <TouchableOpacity
            key={group.userId}
            onPress={() => handleUserAvatarPress(group)}
            activeOpacity={0.8}
            style={{ alignItems: 'center', marginRight: 16 }}
          >
            <LinearGradient
              colors={['#a855f7', '#06b6d4', '#a855f7']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' }}
            >
              <View style={{ width: 58, height: 58, borderRadius: 29, backgroundColor: '#0E0E10', alignItems: 'center', justifyContent: 'center' }}>
                {group.avatar ? (
                  <Image source={{ uri: group.avatar }} style={{ width: 52, height: 52, borderRadius: 26 }} />
                ) : (
                  <View style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: '#1B1B1F', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={22} color="#A1A1AA" />
                  </View>
                )}
              </View>
            </LinearGradient>
            <Text className="text-white text-xs mt-2" numberOfLines={1} style={{ maxWidth: 64 }}>
              {group.username}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <StoryViewer
        visible={viewerVisible}
        onClose={() => setViewerVisible(false)}
        group={activeGroup}
      />

      <CreateStory
        visible={createVisible}
        onClose={() => setCreateVisible(false)}
        token={token}
        onCreated={fetchData}
      />
    </View>
  )
}