import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native'
import { Video, ResizeMode } from 'expo-av'
import { X, Heart, Eye, ChevronLeft, ChevronRight } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const API_URL = "https://api.reelo.buttnetworks.com/api";

export default function StoryViewer({ visible, onClose, group, token }) {
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!visible || !group) return

    const initial = {}
    const initialCounts = {}
    group.stories.forEach((story, i) => {
      initial[i] = !!story.likedBy?.some((uid) => String(uid) === String(group.currentUserId))
      initialCounts[i] = story.likes || 0
    })
    setLiked(initial)
    setLikeCounts(initialCounts)
  }, [visible, group])

  useEffect(() => {
    if (!visible || !group || group.isOwner || !token) return

    const markAllSeen = async () => {
      try {
        await Promise.all(
          group.stories.map((story) =>
            fetch(`${API_URL}/story/seen-story/${story._id}/seen`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            })
          )
        )
      } catch (err) {
        console.error(err)
      }
    }

    markAllSeen()
  }, [visible, group, token])

  if (!group || !group.stories || group.stories.length === 0) return null

  const story = group.stories[index]
  const hasPrev = index > 0
  const hasNext = index < group.stories.length - 1

  const toggleLike = async () => {
    try {
      const res = await fetch(`${API_URL}/story/like-story/${story._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data && data.success) {
        setLiked((prev) => ({ ...prev, [index]: data.liked }))
        setLikeCounts((prev) => ({ ...prev, [index]: data.likes }))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const goPrev = () => {
    if (hasPrev) setIndex(index - 1)
  }

  const goNext = () => {
    if (hasNext) setIndex(index + 1)
    else onClose()
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0E0E10' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16 }}>
          <Image source={{ uri: group.avatar }} style={{ width: 34, height: 34, borderRadius: 17 }} />
          <Text className="text-white ml-3 font-semibold">{group.username}</Text>
          <TouchableOpacity onPress={onClose} style={{ marginLeft: 'auto' }}>
            <X size={26} color="#fff" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            marginTop: 16,
            marginHorizontal: 12,
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#000',
          }}
        >
          {story.mediaType === 'video' ? (
            <Video
              source={{ uri: story.content }}
              style={{ flex: 1 }}
              resizeMode={ResizeMode.COVER}
              shouldPlay
              isLooping
            />
          ) : (
            <Image source={{ uri: story.content }} style={{ flex: 1 }} resizeMode="cover" />
          )}

          {hasPrev && (
            <TouchableOpacity
              onPress={goPrev}
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '30%',
                alignItems: 'flex-start',
                justifyContent: 'center',
                paddingLeft: 8,
              }}
            >
              <ChevronLeft size={22} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={goNext}
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 0,
              width: '30%',
              alignItems: 'flex-end',
              justifyContent: 'center',
              paddingRight: 8,
            }}
          >
            <ChevronRight size={22} color="rgba(255,255,255,0.5)" />
          </TouchableOpacity>
        </View>

        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: group.isOwner ? 'space-between' : 'flex-end',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: insets.bottom + 16,
          }}
        >
          {group.isOwner && (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Eye size={16} color="rgba(255,255,255,0.6)" />
              <Text style={{ color: 'rgba(255,255,255,0.6)', marginLeft: 6, fontSize: 13 }}>
                Seen by {story.viewedBy?.length || 0}
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {likeCounts[index] > 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.6)', marginRight: 8, fontSize: 13 }}>
                {likeCounts[index]}
              </Text>
            )}
            <TouchableOpacity onPress={toggleLike}>
              <Heart size={26} color={liked[index] ? '#a855f7' : '#fff'} fill={liked[index] ? '#a855f7' : 'transparent'} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  )
}