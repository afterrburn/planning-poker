import { motion } from 'framer-motion'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { RoomUser } from '@/hooks/useRoom'

interface ParticipantCardProps {
  user: RoomUser
  isCurrentUser: boolean
  revealed: boolean
}

export function ParticipantCard({ user, isCurrentUser, revealed }: ParticipantCardProps) {
  const hasVoted = user.vote !== null
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
        }}
        transition={{ duration: 0.5, type: 'spring' }}
        style={{ transformStyle: 'preserve-3d' }}
        className={cn(
          "relative flex h-20 w-14 items-center justify-center rounded-lg text-xl font-bold",
          "transition-colors duration-300",
          showValue
            ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]"
            : hasVoted
            ? "bg-[hsl(var(--success))] text-[hsl(var(--success-foreground))]"
            : "bg-gradient-to-b from-[hsl(222,50%,22%)] to-[hsl(222,50%,16%)]"
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
