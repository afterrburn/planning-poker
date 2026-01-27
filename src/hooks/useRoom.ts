import { useState, useEffect, useCallback, useRef } from 'react'
import { ref, onValue, set, update, push, onDisconnect, serverTimestamp, off } from 'firebase/database'
import { db, VoteValue } from '@/lib/firebase'
import { User } from 'firebase/auth'

export type UserRole = 'voter' | 'spectator'

export interface Reaction {
  id: string
  emoji: string
  userName: string
  timestamp: number
}

export interface RoomUser {
  name: string
  odId: string
  vote: VoteValue
  joinedAt: number
  photoURL?: string
  role: UserRole
  nudgedAt?: number
}

export interface RoomData {
  users: Record<string, RoomUser>
  revealed: boolean
  story: string
  timerEndsAt: number | null
  timerDuration: number | null
  reactions: Reaction[]
}

interface UseRoomReturn {
  roomData: RoomData | null
  localUserId: string | null
  joinRoom: (roomId: string, user: User, role?: UserRole) => void
  leaveRoom: () => void
  vote: (value: VoteValue) => void
  reveal: () => void
  resetVotes: () => void
  newRound: () => void
  updateStory: (story: string) => void
  createNewGame: (user: User, role?: UserRole) => string
  startTimer: (durationSeconds: number) => void
  stopTimer: () => void
  changeRole: (role: UserRole) => void
  sendReaction: (emoji: string) => void
  nudge: (userId: string) => void
}

export function useRoom(): UseRoomReturn {
  const [roomData, setRoomData] = useState<RoomData | null>(null)
  const [localUserId, setLocalUserId] = useState<string | null>(null)
  const roomRefPath = useRef<string | null>(null)
  const currentRoomId = useRef<string | null>(null)
  const currentUserName = useRef<string>('Anonymous')

  const cleanup = useCallback(() => {
    if (roomRefPath.current) {
      const roomRef = ref(db, roomRefPath.current)
      off(roomRef)
    }
    roomRefPath.current = null
    currentRoomId.current = null
    setRoomData(null)
    setLocalUserId(null)
  }, [])

  const joinRoom = useCallback((roomId: string, user: User, role: UserRole = 'voter') => {
    cleanup()

    const roomPath = `rooms/${roomId}`
    roomRefPath.current = roomPath
    currentRoomId.current = roomId

    const roomRef = ref(db, roomPath)
    const usersRef = ref(db, `${roomPath}/users`)
    const newUserRef = push(usersRef)
    const userId = newUserRef.key!

    setLocalUserId(userId)

    const userName = user.displayName || user.email?.split('@')[0] || 'Anonymous'
    currentUserName.current = userName

    set(newUserRef, {
      name: userName,
      odId: user.uid,
      vote: null,
      joinedAt: serverTimestamp(),
      photoURL: user.photoURL || null,
      role,
    })

    onDisconnect(newUserRef).remove()

    onValue(roomRef, (snapshot) => {
      const data = snapshot.val()
      if (data) {
        // Parse reactions from Firebase object to array
        const reactionsObj = data.reactions || {}
        const reactions: Reaction[] = Object.entries(reactionsObj).map(([id, r]) => ({
          id,
          ...(r as Omit<Reaction, 'id'>),
        }))

        setRoomData({
          users: data.users || {},
          revealed: data.revealed === true,
          story: data.story || '',
          timerEndsAt: data.timerEndsAt || null,
          timerDuration: data.timerDuration || null,
          reactions,
        })
      } else {
        setRoomData({
          users: {},
          revealed: false,
          story: '',
          timerEndsAt: null,
          timerDuration: null,
          reactions: [],
        })
      }
    })
  }, [cleanup])

  const leaveRoom = useCallback(() => {
    if (roomRefPath.current && localUserId) {
      const userRef = ref(db, `${roomRefPath.current}/users/${localUserId}`)
      set(userRef, null)
    }
    cleanup()
  }, [localUserId, cleanup])

  const vote = useCallback((value: VoteValue) => {
    if (!roomRefPath.current || !localUserId) return
    const voteRef = ref(db, `${roomRefPath.current}/users/${localUserId}/vote`)
    set(voteRef, value)
  }, [localUserId])

  const reveal = useCallback(() => {
    if (!roomRefPath.current) return
    const roomRef = ref(db, roomRefPath.current)
    update(roomRef, {
      revealed: true,
      timerEndsAt: null,
      timerDuration: null,
    })
  }, [])

  const resetVotes = useCallback(() => {
    if (!roomRefPath.current || !roomData) return

    const updates: Record<string, unknown> = {
      revealed: false,
      timerEndsAt: null,
      timerDuration: null,
    }
    Object.keys(roomData.users).forEach((userId) => {
      updates[`users/${userId}/vote`] = null
    })

    const roomRef = ref(db, roomRefPath.current)
    update(roomRef, updates)
  }, [roomData])

  const newRound = useCallback(() => {
    if (!roomRefPath.current || !roomData) return

    const updates: Record<string, unknown> = {
      revealed: false,
      timerEndsAt: null,
      timerDuration: null,
      story: '',
    }
    Object.keys(roomData.users).forEach((userId) => {
      updates[`users/${userId}/vote`] = null
    })

    const roomRef = ref(db, roomRefPath.current)
    update(roomRef, updates)
  }, [roomData])

  const updateStory = useCallback((story: string) => {
    if (!roomRefPath.current) return
    const storyRef = ref(db, `${roomRefPath.current}/story`)
    set(storyRef, story)
  }, [])

  const createNewGame = useCallback((user: User, role: UserRole = 'voter'): string => {
    const newRoomId = 'game-' + Math.random().toString(36).substr(2, 8)
    joinRoom(newRoomId, user, role)
    return newRoomId
  }, [joinRoom])

  const changeRole = useCallback((role: UserRole) => {
    if (!roomRefPath.current || !localUserId) return
    const roleRef = ref(db, `${roomRefPath.current}/users/${localUserId}/role`)
    set(roleRef, role)
  }, [localUserId])

  const startTimer = useCallback((durationSeconds: number) => {
    if (!roomRefPath.current) return
    const endsAt = Date.now() + durationSeconds * 1000
    const roomRef = ref(db, roomRefPath.current)
    update(roomRef, {
      timerEndsAt: endsAt,
      timerDuration: durationSeconds,
    })
  }, [])

  const stopTimer = useCallback(() => {
    if (!roomRefPath.current) return
    const roomRef = ref(db, roomRefPath.current)
    update(roomRef, {
      timerEndsAt: null,
      timerDuration: null,
    })
  }, [])

  const sendReaction = useCallback((emoji: string) => {
    if (!roomRefPath.current) return
    const reactionsRef = ref(db, `${roomRefPath.current}/reactions`)
    const newReactionRef = push(reactionsRef)
    set(newReactionRef, {
      emoji,
      userName: currentUserName.current,
      timestamp: Date.now(),
    })

    // Auto-cleanup old reactions after 5 seconds
    setTimeout(() => {
      set(newReactionRef, null)
    }, 5000)
  }, [])

  const nudge = useCallback((userId: string) => {
    if (!roomRefPath.current) return
    const nudgeRef = ref(db, `${roomRefPath.current}/users/${userId}/nudgedAt`)
    set(nudgeRef, Date.now())

    // Clear nudge after 2 seconds
    setTimeout(() => {
      set(nudgeRef, null)
    }, 2000)
  }, [])

  useEffect(() => {
    return () => {
      if (roomRefPath.current && localUserId) {
        const userRef = ref(db, `${roomRefPath.current}/users/${localUserId}`)
        set(userRef, null)
      }
    }
  }, [localUserId])

  return {
    roomData,
    localUserId,
    joinRoom,
    leaveRoom,
    vote,
    reveal,
    resetVotes,
    newRound,
    updateStory,
    createNewGame,
    startTimer,
    stopTimer,
    changeRole,
    sendReaction,
    nudge,
  }
}
