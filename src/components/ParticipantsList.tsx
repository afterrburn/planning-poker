import { RoomUser } from '@/hooks/useRoom'
import { ParticipantCard } from './ParticipantCard'
import { VoteProgress } from './VoteProgress'
import { Eye } from 'lucide-react'

interface ParticipantsListProps {
  users: Record<string, RoomUser>
  localUserId: string | null
  revealed: boolean
  onNudge: (userId: string) => void
}

export function ParticipantsList({ users, localUserId, revealed, onNudge }: ParticipantsListProps) {
  const userEntries = Object.entries(users)
  const voters = userEntries.filter(([, user]) => user.role !== 'spectator')
  const spectators = userEntries.filter(([, user]) => user.role === 'spectator')

  const votedCount = voters.filter(([, user]) => user.vote != null).length
  const totalCount = voters.length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">Team</h3>
      </div>

      <VoteProgress voted={votedCount} total={totalCount} />

      <div className="flex flex-wrap justify-center gap-4 pt-2">
        {voters.map(([id, user]) => {
          const isNudged = user.nudgedAt ? Date.now() - user.nudgedAt < 2000 : false
          return (
            <ParticipantCard
              key={id}
              user={user}
              odId={id}
              isCurrentUser={id === localUserId}
              revealed={revealed}
              isNudged={isNudged}
              onNudge={onNudge}
            />
          )
        })}
      </div>

      {spectators.length > 0 && (
        <div className="border-t border-[hsl(var(--border))] pt-4">
          <div className="mb-2 flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))]">
            <Eye className="h-4 w-4" />
            <span>Spectators ({spectators.length})</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {spectators.map(([id, user]) => (
              <div
                key={id}
                className={`text-sm ${id === localUserId ? 'text-[hsl(var(--primary))]' : 'text-[hsl(var(--muted-foreground))]'}`}
              >
                {user.name}{id === localUserId ? ' (you)' : ''}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
