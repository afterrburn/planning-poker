import { useState, useEffect, useRef, useCallback } from 'react'
import { Timer, Play, Square, Bell, BellOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNotifications } from '@/hooks/useNotifications'

interface VoteTimerProps {
  timerEndsAt: number | null
  onStart: (duration: number) => void
  onStop: () => void
  onTimerEnd: () => void
  allVoted: boolean
}

const TIMER_PRESETS = [30, 60, 90]

export function VoteTimer({
  timerEndsAt,
  onStart,
  onStop,
  onTimerEnd,
  allVoted,
}: VoteTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const [selectedDuration, setSelectedDuration] = useState(60)
  const { permission, enabled, setEnabled, requestPermission, notify } = useNotifications()
  const hasNotified10s = useRef(false)
  const hasNotifiedEnd = useRef(false)
  const timerEndedRef = useRef(false)

  // Calculate seconds left from timerEndsAt
  useEffect(() => {
    if (!timerEndsAt) {
      setSecondsLeft(null)
      hasNotified10s.current = false
      hasNotifiedEnd.current = false
      timerEndedRef.current = false
      return
    }

    const updateTimer = () => {
      const now = Date.now()
      const remaining = Math.max(0, Math.ceil((timerEndsAt - now) / 1000))
      setSecondsLeft(remaining)

      // 10 second warning
      if (remaining === 10 && !hasNotified10s.current) {
        hasNotified10s.current = true
        notify('⏰ 10 seconds left!', {
          body: 'Time to vote if you haven\'t already',
          tag: 'timer-warning',
        })
      }

      // Timer ended
      if (remaining === 0 && !timerEndedRef.current) {
        timerEndedRef.current = true
        if (!hasNotifiedEnd.current) {
          hasNotifiedEnd.current = true
          notify('⏱️ Time\'s up!', {
            body: 'Votes are being revealed',
            tag: 'timer-end',
          })
        }
        onTimerEnd()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 200)
    return () => clearInterval(interval)
  }, [timerEndsAt, notify, onTimerEnd])

  // Notify when everyone has voted
  useEffect(() => {
    if (allVoted && timerEndsAt && secondsLeft && secondsLeft > 0) {
      notify('✅ Everyone voted!', {
        body: 'Ready to reveal votes',
        tag: 'all-voted',
      })
    }
  }, [allVoted, timerEndsAt, secondsLeft, notify])

  const handleEnableNotifications = useCallback(async () => {
    await requestPermission()
  }, [requestPermission])

  const isRunning = timerEndsAt !== null && secondsLeft !== null && secondsLeft > 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}:${secs.toString().padStart(2, '0')}` : `${secs}s`
  }

  return (
    <div className="flex items-center gap-3">
      {isRunning ? (
        <>
          <div className="flex items-center gap-2 rounded-lg bg-[hsl(var(--accent))] px-3 py-2">
            <Timer className="h-4 w-4 text-[hsl(var(--primary))]" />
            <span className={`font-mono text-lg font-semibold ${
              secondsLeft! <= 10 ? 'text-[hsl(var(--destructive))] animate-pulse' : 'text-[hsl(var(--foreground))]'
            }`}>
              {formatTime(secondsLeft!)}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={onStop}>
            <Square className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center gap-1">
            {TIMER_PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={selectedDuration === preset ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setSelectedDuration(preset)}
                className="px-2 text-xs"
              >
                {preset}s
              </Button>
            ))}
            <input
              type="number"
              min="1"
              max="900"
              value={selectedDuration}
              onChange={(e) => {
                const val = parseInt(e.target.value)
                if (!isNaN(val) && val > 0 && val <= 900) setSelectedDuration(val)
              }}
              className="w-14 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--input))] px-2 py-1 text-center text-xs text-[hsl(var(--foreground))] focus:outline-none focus:ring-1 focus:ring-[hsl(var(--ring))]"
            />
            <span className="text-xs text-[hsl(var(--muted-foreground))]">sec</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => onStart(selectedDuration)}>
            <Play className="mr-1 h-3 w-3" />
            Start
          </Button>
        </>
      )}

      {permission === 'granted' ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setEnabled(!enabled)}
          className="text-[hsl(var(--muted-foreground))]"
          title={enabled ? 'Disable notifications' : 'Enable notifications'}
        >
          {enabled ? (
            <Bell className="h-4 w-4" />
          ) : (
            <BellOff className="h-4 w-4" />
          )}
        </Button>
      ) : permission === 'denied' ? (
        <span title="Notifications blocked in browser settings">
          <BellOff className="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-50" />
        </span>
      ) : (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEnableNotifications}
          className="text-[hsl(var(--muted-foreground))]"
          title="Enable notifications"
        >
          <BellOff className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
