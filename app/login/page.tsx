'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Spinner } from '@/components/ui/spinner'
import { GoogleIcon } from '@/components/google-icon'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [linkLoading, setLinkLoading] = useState(false)

  const busy = googleLoading || linkLoading

  const handleGoogle = () => {
    setGoogleLoading(true)
    setTimeout(() => router.push('/search'), 1000)
  }

  const handleMagicLink = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL_RE.test(email.trim())) {
      setError('Saisis une adresse e-mail valide.')
      return
    }
    setError(null)
    setLinkLoading(true)
    setTimeout(() => {
      setLinkLoading(false)
      toast.success('Lien de connexion envoyé. Vérifie ta boîte mail.')
    }, 1000)
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="size-6" />
          </span>
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold tracking-tight">
              Scholarship Tracker
            </h1>
            <p className="text-sm text-muted-foreground text-pretty">
              Toutes tes candidatures aux bourses, au même endroit.
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connecte-toi pour retrouver et suivre tes bourses.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button
              variant="outline"
              className="h-11 w-full"
              onClick={handleGoogle}
              disabled={busy}
            >
              {googleLoading ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <GoogleIcon className="size-4" />
              )}
              Continuer avec Google
            </Button>

            <div className="flex items-center gap-3">
              <Separator className="flex-1" />
              <span className="text-xs text-muted-foreground">ou</span>
              <Separator className="flex-1" />
            </div>

            <form onSubmit={handleMagicLink}>
              <FieldGroup>
                <Field data-invalid={error ? true : undefined}>
                  <FieldLabel htmlFor="email">Adresse e-mail</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="marie.laurent@email.com"
                    className="h-11"
                    value={email}
                    aria-invalid={error ? true : undefined}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) setError(null)
                    }}
                    disabled={busy}
                  />
                  {error ? (
                    <FieldDescription className="text-destructive">
                      {error}
                    </FieldDescription>
                  ) : (
                    <FieldDescription>
                      On t’enverra un lien de connexion sécurisé.
                    </FieldDescription>
                  )}
                </Field>
                <Button type="submit" className="h-11 w-full" disabled={busy}>
                  {linkLoading ? (
                    <Spinner data-icon="inline-start" />
                  ) : (
                    <Mail data-icon="inline-start" />
                  )}
                  Recevoir un lien de connexion
                </Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <p className="px-4 text-center text-xs text-muted-foreground text-pretty">
          En continuant, tu acceptes nos conditions d’utilisation et notre
          politique de confidentialité.
        </p>
      </div>
    </main>
  )
}
