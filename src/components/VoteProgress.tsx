import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'

interface VoteProgressProps {
  voted: number
  total: number
}

export function VoteProgress({ voted, total }: VoteProgressProps) {
  const allVoted = voted === total && total > 0

  return (
    <div className="flex items-center gap-3">
      <Progress value={voted} max={total} className="flex-1" />
      <Badge variant={allVoted ? 'success' : 'secondary'}>
        {voted}/{total} voted
      </Badge>
    </div>
  )
}
