import { useState, useEffect, useCallback, useRef } from 'react'
import { User } from 'firebase/auth'
import { toast } from 'sonner'
import { Copy, Eye, RotateCcw, RefreshCw, DoorOpen, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { VotingCards } from './VotingCards'
import { ParticipantsList } from './ParticipantsList'
import { Results } from './Results'
import { VoteTimer } from './VoteTimer'
import { RoomData, UserRole } from '@/hooks/useRoom'
import { VoteValue } from '@/lib/firebase'

interface GameRoomProps {
  roomId: string
  roomData: RoomData
  localUserId: string | null
  user: User
  onVote: (value: VoteValue) => void
  onReveal: () => void
  onRevote: () => void
  onNewRound: () => void
  onLeave: () => void
  onStoryChange: (story: string) => void
  onStartTimer: (duration: number) => void
  onStopTimer: () => void
  onChangeRole: (role: UserRole) => void
}

export function GameRoom({
  roomId,
  roomData,
  localUserId,
  onVote,
  onReveal,
  onRevote,
  onNewRound,
  onLeave,
  onStoryChange,
  onStartTimer,
  onStopTimer,
  onChangeRole,
}: GameRoomProps) {
  const [localStory, setLocalStory] = useState(roomData.story)
  const storyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (inputRef.current !== document.activeElement && localStory !== roomData.story) {
      setLocalStory(roomData.story)
    }
  }, [roomData.story, localStory])

  const handleStoryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setLocalStory(value)

      if (storyTimeoutRef.current) {
        clearTimeout(storyTimeoutRef.current)
      }

      storyTimeoutRef.current = setTimeout(() => {
        onStoryChange(value)
      }, 300)
    },
    [onStoryChange]
  )

  const roomUrl = `${window.location.origin}${window.location.pathname}?room=${roomId}`

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      toast.success('Link copied to clipboard!')
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const currentUser = localUserId ? roomData.users[localUserId] : null
  const currentUserVote = currentUser?.vote ?? null
  const isSpectator = currentUser?.role === 'spectator'

  const userEntries = Object.entries(roomData.users)
  const voters = userEntries.filter(([, user]) => user.role !== 'spectator')
  const allVoted = voters.length > 0 && voters.every(([, user]) => user.vote != null)

  // Auto-reveal when everyone has voted
  useEffect(() => {
    if (allVoted && !roomData.revealed) {
      onReveal()
    }
  }, [allVoted, roomData.revealed, onReveal])

  const handleTimerEnd = useCallback(() => {
    if (!roomData.revealed) {
      onReveal()
    }
  }, [roomData.revealed, onReveal])

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-3">
          <div className="flex items-center justify-between gap-3">
            <code className="flex-1 truncate text-sm text-[hsl(var(--muted-foreground))]">
              {roomUrl}
            </code>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={copyLink}>
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
              <Button variant="ghost" size="sm" onClick={onLeave} className="text-muted-foreground hover:text-foreground">
                <DoorOpen className="mr-1 h-4 w-4" />
                Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <label className="mb-2 block text-sm font-medium text-[hsl(var(--muted-foreground))]">
            Current Story
          </label>
          <Input
            ref={inputRef}
            type="text"
            placeholder="Enter story title or ticket number..."
            value={localStory}
            onChange={handleStoryChange}
          />
        </CardContent>
      </Card>

      {isSpectator ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col items-center gap-3 text-[hsl(var(--muted-foreground))]">
              <Eye className="h-8 w-8" />
              <p>You're watching as a spectator</p>
              <Button variant="outline" size="sm" onClick={() => onChangeRole('voter')}>
                <Users className="mr-2 h-4 w-4" />
                Switch to Voter
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-6">
            <VotingCards
              selectedValue={currentUserVote ?? null}
              onVote={onVote}
              disabled={roomData.revealed}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="py-6">
          <ParticipantsList
            users={roomData.users}
            localUserId={localUserId}
            revealed={roomData.revealed}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <VoteTimer
              timerEndsAt={roomData.timerEndsAt}
              onStart={onStartTimer}
              onStop={onStopTimer}
              onTimerEnd={handleTimerEnd}
              allVoted={allVoted}
            />
            <div className="flex flex-wrap gap-3">
              <Button variant="success" size="default" onClick={onReveal} disabled={roomData.revealed}>
                <Eye className="mr-2 h-4 w-4" />
                Reveal
              </Button>
              {roomData.revealed && (
                <Button variant="secondary" size="default" onClick={onRevote}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Re-vote
                </Button>
              )}
              <Button variant="outline" size="default" onClick={onNewRound}>
                <RotateCcw className="mr-2 h-4 w-4" />
                New Round
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Results users={roomData.users} revealed={roomData.revealed} />
    </div>
  )
}
