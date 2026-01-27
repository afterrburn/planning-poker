import { motion } from 'framer-motion'
import { FIBONACCI, VoteValue } from '@/lib/firebase'
import { cn } from '@/lib/utils'

interface VotingCardsProps {
  selectedValue: VoteValue
  onVote: (value: VoteValue) => void
  disabled?: boolean
}

export function VotingCards({ selectedValue, onVote, disabled }: VotingCardsProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-[hsl(var(--primary))]">Your Vote</h3>
      <div className="flex flex-wrap justify-center gap-3">
        {FIBONACCI.map((value) => {
          const isSelected = String(selectedValue) === String(value)
          return (
            <motion.button
              key={String(value)}
              onClick={() => onVote(value as VoteValue)}
              disabled={disabled}
              whileHover={{ y: -8, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative flex h-24 w-16 items-center justify-center rounded-xl border-2 text-2xl font-bold transition-colors",
                "bg-gradient-to-b from-[hsl(222,50%,18%)] to-[hsl(222,50%,12%)]",
                isSelected
                  ? "border-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] from-[hsl(var(--primary))] to-[hsl(189,100%,40%)]"
                  : "border-transparent hover:border-[hsl(var(--primary))]/50",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {value}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
