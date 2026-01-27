import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hand } from 'lucide-react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { RoomUser } from '@/hooks/useRoom'

interface ParticipantCardProps {
  user: RoomUser
  odId: string
  isCurrentUser: boolean
  revealed: boolean
  isNudged?: boolean
  onNudge?: (userId: string) => void
}

export function ParticipantCard({ user, odId, isCurrentUser, revealed, isNudged, onNudge }: ParticipantCardProps) {
  const [justNudged, setJustNudged] = useState(false)
  const hasVoted = user.vote !== null
  const canNudge = !hasVoted && !isCurrentUser && !revealed && onNudge

  const handleNudge = () => {
    if (!onNudge) return
    onNudge(odId)
    setJustNudged(true)
    setTimeout(() => setJustNudged(false), 2000)
  }
  const showValue = revealed && hasVoted

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        initial={false}
        animate={{
          rotateY: showValue ? 180 : 0,
          x: isNudged ? [0, -5, 5, -5, 5, 0] : 0,
        }}
        transition={{
          rotateY: { duration: 0.5, type: 'spring' },
          x: { duration: 0.4 }
        }}
        style={{ transformStyle: 'preserve-3d' }}
        className={cn(
          "relative flex h-20 w-14 items-center justify-center rounded-lg text-xl font-bold",
          "transition-colors duration-300",
          showValue
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            : hasVoted
            ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
            : "bg-gradient-to-b from-[hsl(222,50%,22%)] to-[hsl(222,50%,16%)]",
          isNudged && "ring-2 ring-yellow-400 ring-offset-2 ring-offset-[hsl(var(--background))]"
        )}
      >
        <motion.span
          style={{
            backfaceVisibility: 'hidden',
            transform: showValue ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {showValue ? user.vote : hasVoted ? '🃏' : '?'}
        </motion.span>

        {/* Nudge button */}
        {canNudge && (
          <button
            onClick={handleNudge}
            disabled={justNudged}
            className={cn(
              "absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full",
              "bg-yellow-500 text-black text-xs hover:bg-yellow-400 transition-colors",
              "shadow-md hover:scale-110 active:scale-95",
              justNudged && "opacity-50 cursor-not-allowed"
            )}
            title="Nudge to vote"
          >
            <Hand className="h-3 w-3" />
          </button>
        )}
      </motion.div>

      <div className="flex items-center gap-1.5">
        <Avatar className="h-5 w-5">
          {user.photoURL ? (
            <AvatarImage src={user.photoURL} alt={user.name} />
          ) : null}
          <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="max-w-[80px] truncate text-xs text-[hsl(var(--muted-foreground))]">
          {user.name}
          {isCurrentUser && ' (you)'}
        </span>
      </div>
    </div>
  )
}
