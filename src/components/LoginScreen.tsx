import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface LoginScreenProps {
  onSignIn: () => void
  error: string | null
}

export function LoginScreen({ onSignIn, error }: LoginScreenProps) {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-[hsl(var(--primary))]">Planning Poker</CardTitle>
          <CardDescription>Hallucinators Team</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-[hsl(var(--muted-foreground))]">
            Sign in with your BambooHR Google account
          </p>
          <Button
            onClick={onSignIn}
            variant="outline"
            className="w-full gap-3 bg-white text-gray-700 hover:bg-gray-50"
            size="lg"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="h-5 w-5"
            />
            Sign in with Google
          </Button>
          {error && (
            <p className="text-center text-sm text-[hsl(var(--destructive))]">{error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
