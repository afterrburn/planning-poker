import { motion, AnimatePresence } from 'framer-motion'
import { RoomUser } from '@/hooks/useRoom'
import { Card, CardContent } from '@/components/ui/card'

interface ResultsProps {
  users: Record<string, RoomUser>
  revealed: boolean
}

export function Results({ users, revealed }: ResultsProps) {
  const numericVotes: number[] = []
  for (const user of Object.values(users)) {
    if (typeof user.vote === 'number') {
      numericVotes.push(user.vote)
    }
  }

  const average =
    numericVotes.length > 0
      ? numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length
      : null

  return (
    <AnimatePresence>
      {revealed && average !== null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10">
            <CardContent className="py-6 text-center">
              <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--primary))]">Results</h3>
              <p className="text-4xl font-bold">Average: {average.toFixed(1)}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
