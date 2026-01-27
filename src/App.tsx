import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useRoom, UserRole } from '@/hooks/useRoom'
import { LoginScreen } from '@/components/LoginScreen'
import { JoinForm } from '@/components/JoinForm'
import { GameRoom } from '@/components/GameRoom'
import { VoteValue } from '@/lib/firebase'

type AppState = 'loading' | 'login' | 'join' | 'game'

function App() {
  const { user, loading: authLoading, error: authError, signIn, signOut } = useAuth()
  const {
    roomData,
    localUserId,
    joinRoom,
    leaveRoom,
    vote,
    reveal,
    resetVotes,
    updateStory,
    startTimer,
    stopTimer,
    changeRole,
  } = useRoom()

  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null)
  const [initialRoomCode, setInitialRoomCode] = useState('')

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const roomFromUrl = urlParams.get('room')
    if (roomFromUrl) {
      setInitialRoomCode(roomFromUrl)
    }
  }, [])

  const handleJoin = useCallback(
    (roomCode: string, role: UserRole) => {
      if (!user) return

      const roomId = roomCode || 'game-' + Math.random().toString(36).substr(2, 8)
      joinRoom(roomId, user, role)
      setCurrentRoomId(roomId)

      const newUrl = `${window.location.pathname}?room=${roomId}`
      window.history.replaceState({}, '', newUrl)
    },
    [user, joinRoom]
  )

  const handleLeaveRoom = useCallback(() => {
    leaveRoom()
    setCurrentRoomId(null)
    window.history.replaceState({}, '', window.location.pathname)
  }, [leaveRoom])

  const handleVote = useCallback(
    (value: VoteValue) => {
      vote(value)
    },
    [vote]
  )

  const handleSignOut = useCallback(() => {
    leaveRoom()
    setCurrentRoomId(null)
    signOut()
  }, [leaveRoom, signOut])

  let appState: AppState = 'loading'
  if (!authLoading) {
    if (!user) {
      appState = 'login'
    } else if (!currentRoomId || !roomData) {
      appState = 'join'
    } else {
      appState = 'game'
    }
  }

  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(222.2 84% 4.9%)',
            color: 'hsl(210 40% 98%)',
            border: '1px solid hsl(217.2 32.6% 17.5%)',
          },
        }}
      />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[hsl(var(--primary))]">Planning Poker</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Hallucinators Team</p>
        </header>

        {appState === 'loading' && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="text-[hsl(var(--muted-foreground))]">Loading...</div>
          </div>
        )}

        {appState === 'login' && (
          <LoginScreen onSignIn={signIn} error={authError} />
        )}

        {appState === 'join' && user && (
          <JoinForm
            user={user}
            initialRoomCode={initialRoomCode}
            onJoin={handleJoin}
            onSignOut={handleSignOut}
          />
        )}

        {appState === 'game' && user && currentRoomId && roomData && (
          <GameRoom
            roomId={currentRoomId}
            roomData={roomData}
            localUserId={localUserId}
            user={user}
            onVote={handleVote}
            onReveal={reveal}
            onReset={resetVotes}
            onLeave={handleLeaveRoom}
            onStoryChange={updateStory}
            onStartTimer={startTimer}
            onStopTimer={stopTimer}
            onChangeRole={changeRole}
          />
        )}
      </div>
    </>
  )
}

export default App
