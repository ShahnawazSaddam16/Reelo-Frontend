import React, { useState, useEffect } from 'react'
import { Modal, View, Text, TouchableOpacity, Image } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { X, Heart, Eye, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const API_URL = "https://api.reelo.buttnetworks.com/api";

function getTimeAgo(dateString) {
  const created = new Date(dateString)
  const now = new Date()
  const diffMs = now - created
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays}d ago`
}

function StoryVideo({ uri }) {
  const player = useVideoPlayer(uri, (player) => {
    player.loop = true
    player.play()
  })

  return (
    <VideoView
      player={player}
      style={{ flex: 1 }}
      contentFit="cover"
      nativeControls={false}
    />
  )
}

export default function StoryViewer({ visible, onClose, group, token, onStoryDeleted }) {
  const [index, setIndex] = useState(0)
  const [liked, setLiked] = useState({})
  const [likeCounts, setLikeCounts] = useState({})
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [stories, setStories] = useState([])
  const [deletedIds, setDeletedIds] = useState(new Set())
  const insets = useSafeAreaInsets()

  useEffect(() => {
    if (!visible || !group) return

    setStories(group.stories)
    setDeletedIds(new Set())

    const initial = {}
    const initialCounts = {}
    group.stories.forEach((story, i) => {
      initial[i] = !!story.likedBy?.some((uid) => String(uid) === String(group.currentUserId))
      initialCounts[i] = story.likes || 0
    })
    setLiked(initial)
    setLikeCounts(initialCounts)
    setIndex(0)
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

  if (!group || !stories || stories.length === 0) return null

  const story = stories[index]
  const hasPrev = index > 0
  const hasNext = index < stories.length - 1
  const isDeleted = deletedIds.has(story._id)

  const toggleLike = async () => {
    if (isDeleted) return
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

  const confirmDelete = async () => {
    try {
      setDeleting(true)
      const res = await fetch(`${API_URL}/story/delete-story/${story._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (data && data.success) {
        const deletedId = story._id
        setShowDeleteConfirm(false)
        setDeletedIds((prev) => new Set(prev).add(deletedId))
        onStoryDeleted?.(deletedId)

        setTimeout(() => {
          const updated = stories.filter((s) => s._id !== deletedId)
          if (updated.length === 0) {
            setStories([])
            setTimeout(() => onClose(), 0)
            return
          }

          setStories(updated)
          setIndex((i) => (i >= updated.length ? updated.length - 1 : i))
        }, 1200)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal visible={visible} animationType="fade" transparent={false} statusBarTranslucent onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: '#0E0E10' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingTop: 50, paddingHorizontal: 16 }}>
          <Image source={{ uri: group.avatar }} style={{ width: 34, height: 34, borderRadius: 17 }} />
          <Text className="text-white ml-3 font-semibold">{group.username}</Text>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.4)', marginHorizontal: 8 }} />
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
            {getTimeAgo(story.createdAt)}
          </Text>
          <View style={{ marginLeft: 'auto', flexDirection: 'row', alignItems: 'center' }}>
            {group.isOwner && !isDeleted && (
              <TouchableOpacity onPress={() => setShowDeleteConfirm(true)} style={{ marginRight: 16 }}>
                <Trash2 size={22} color="#fff" />
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={onClose}>
              <X size={26} color="#fff" />
            </TouchableOpacity>
          </View>
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
          {isDeleted ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>Story unavailable</Text>
            </View>
          ) : story.mediaType === 'video' ? (
            <StoryVideo key={story._id} uri={story.content} />
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

        <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30 }}>
            <View style={{ backgroundColor: '#18181B', borderRadius: 16, padding: 20, width: '100%' }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>Delete story?</Text>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, marginBottom: 20 }}>
                This action cannot be undone.
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
                <TouchableOpacity onPress={() => setShowDeleteConfirm(false)} style={{ paddingVertical: 8, paddingHorizontal: 14 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={confirmDelete} disabled={deleting} style={{ paddingVertical: 8, paddingHorizontal: 14, marginLeft: 8, backgroundColor: '#a855f7', borderRadius: 8, opacity: deleting ? 0.6 : 1 }}>
                  <Text style={{ color: '#fff', fontSize: 14, fontWeight: '600' }}>{deleting ? 'Deleting...' : 'Delete'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </Modal>
  )
}