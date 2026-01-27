import { useState } from 'react'
import { User } from 'firebase/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, Users, Eye } from 'lucide-react'
import { UserRole } from '@/hooks/useRoom'

interface JoinFormProps {
  user: User
  initialRoomCode: string
  onJoin: (roomCode: string, role: UserRole) => void
  onSignOut: () => void
}

export function JoinForm({ user, initialRoomCode, onJoin, onSignOut }: JoinFormProps) {
  const [roomCode, setRoomCode] = useState(initialRoomCode)
  const [role, setRole] = useState<UserRole>('voter')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onJoin(roomCode.trim(), role)
  }

  const initials = user.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase()
    : user.email?.[0].toUpperCase() || '?'

  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-[hsl(var(--primary))]">Join a Game</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 rounded-lg bg-[hsl(var(--secondary))]/50 p-4">
            <Avatar className="h-12 w-12">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt={user.displayName || 'User'} />
              ) : null}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{user.displayName || 'User'}</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))] truncate">{user.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onSignOut} className="shrink-0">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Room code (leave blank for new game)"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={role === 'voter' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('voter')}
              >
                <Users className="mr-2 h-4 w-4" />
                Voter
              </Button>
              <Button
                type="button"
                variant={role === 'spectator' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setRole('spectator')}
              >
                <Eye className="mr-2 h-4 w-4" />
                Spectator
              </Button>
            </div>
            <Button type="submit" className="w-full" size="lg">
              {roomCode.trim() ? 'Join Game' : 'Create New Game'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
