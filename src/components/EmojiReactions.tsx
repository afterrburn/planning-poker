import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'

const REACTION_EMOJIS = ['👍', '🤔', '😱', '☕', '🎉'] as const

export interface Reaction {
  id: string
  emoji: string
  userName: string
  timestamp: number
}

interface EmojiReactionsProps {
  reactions: Reaction[]
  onSendReaction: (emoji: string) => void
}

export function EmojiReactions({ reactions, onSendReaction }: EmojiReactionsProps) {
  const [visibleReactions, setVisibleReactions] = useState<Reaction[]>([])

  // Show reactions for 3 seconds then fade out
  useEffect(() => {
    if (!reactions || reactions.length === 0) {
      setVisibleReactions([])
      return
    }

    const now = Date.now()
    const recentReactions = reactions.filter(r => now - r.timestamp < 3000)
    setVisibleReactions(recentReactions)

    // Clean up old reactions periodically
    const interval = setInterval(() => {
      const currentTime = Date.now()
      setVisibleReactions(prev => prev.filter(r => currentTime - r.timestamp < 3000))
    }, 500)

    return () => clearInterval(interval)
  }, [reactions])

  return (
    <div className="relative">
      {/* Floating reactions display */}
      <div className="fixed bottom-24 right-8 pointer-events-none z-50">
        <AnimatePresence>
          {visibleReactions.map((reaction) => (
            <motion.div
              key={reaction.id}
              initial={{ opacity: 0, y: 20, scale: 0.5 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.5 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="flex items-center gap-2 mb-2 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-full px-3 py-1 shadow-lg"
            >
              <span className="text-2xl">{reaction.emoji}</span>
              <span className="text-sm text-[hsl(var(--muted-foreground))]">{reaction.userName}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Reaction buttons */}
      <div className="flex justify-center gap-1">
        {REACTION_EMOJIS.map((emoji) => (
          <Button
            key={emoji}
            variant="ghost"
            size="sm"
            onClick={() => onSendReaction(emoji)}
            className="text-xl px-2 hover:scale-125 transition-transform"
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  )
}
