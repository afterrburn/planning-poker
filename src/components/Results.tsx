import { motion, AnimatePresence } from 'framer-motion'
import { PartyPopper } from 'lucide-react'
import { RoomUser } from '@/hooks/useRoom'
import { Card, CardContent } from '@/components/ui/card'
import { VoteValue } from '@/lib/firebase'

interface ResultsProps {
  users: Record<string, RoomUser>
  revealed: boolean
}

interface VoteGroup {
  vote: VoteValue
  voters: string[]
  count: number
}

export function Results({ users, revealed }: ResultsProps) {
  const voters = Object.values(users).filter(u => u.role !== 'spectator')

  const numericVotes: number[] = []
  for (const user of voters) {
    if (typeof user.vote === 'number') {
      numericVotes.push(user.vote)
    }
  }

  const average =
    numericVotes.length > 0
      ? numericVotes.reduce((sum, val) => sum + val, 0) / numericVotes.length
      : null

  // Group voters by their vote
  const voteGroups: VoteGroup[] = []
  const voteMap = new Map<VoteValue, string[]>()

  for (const user of voters) {
    if (user.vote != null) {
      const existing = voteMap.get(user.vote) || []
      existing.push(user.name)
      voteMap.set(user.vote, existing)
    }
  }

  for (const [vote, voterNames] of voteMap.entries()) {
    voteGroups.push({ vote, voters: voterNames, count: voterNames.length })
  }

  // Sort by count (descending), then by vote value
  voteGroups.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    // Secondary sort by vote value for consistency
    const aVal = typeof a.vote === 'number' ? a.vote : 999
    const bVal = typeof b.vote === 'number' ? b.vote : 999
    return aVal - bVal
  })

  // Check for consensus - all voters voted the same
  const votedVoters = voters.filter(u => u.vote != null)
  const hasConsensus = votedVoters.length > 1 && voteGroups.length === 1

  return (
    <AnimatePresence>
      {revealed && voters.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {hasConsensus && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, type: 'spring' }}
              className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-green-500/20 border border-green-500/40 py-4 px-6"
            >
              <PartyPopper className="h-6 w-6 text-green-400" />
              <span className="text-lg font-semibold text-green-400">
                Consensus! Everyone voted {voteGroups[0]?.vote}
              </span>
              <PartyPopper className="h-6 w-6 text-green-400" />
            </motion.div>
          )}
          <Card className="border-[hsl(var(--primary))]/30 bg-[hsl(var(--primary))]/10">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Left: Average */}
                <div className="flex-1 text-center md:border-r md:border-[hsl(var(--border))] md:pr-6">
                  <h3 className="mb-2 text-lg font-semibold text-[hsl(var(--primary))]">Results</h3>
                  {average !== null ? (
                    <p className="text-4xl font-bold">Average: {average.toFixed(1)}</p>
                  ) : (
                    <p className="text-2xl text-[hsl(var(--muted-foreground))]">No numeric votes</p>
                  )}
                </div>

                {/* Right: Vote Breakdown */}
                <div className="flex-1">
                  <h4 className="mb-3 text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wide">
                    Vote Breakdown
                  </h4>
                  <div className="space-y-2">
                    {voteGroups.map(({ vote, voters, count }) => (
                      <div key={String(vote)} className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[hsl(var(--secondary))] font-bold text-lg">
                          {vote}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[hsl(var(--primary))]">
                              {count} {count === 1 ? 'vote' : 'votes'}
                            </span>
                          </div>
                          <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            {voters.join(', ')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
