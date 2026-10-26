'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from 'cn'
import {
  Compass,
  GraduationCap,
  LayoutList,
  LogOut,
  Moon,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Sun,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Avatar,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

type ActivePage =
  | 'search'
  | 'for-you'
  | 'prepare'
  | 'applications'
  | 'settings'
  | 'profile'

const links: {
  key: ActivePage
  href: string
  label: string
  icon: typeof Search
}[] = [
  { key: 'search', href: '/search', label: 'Recherche', icon: Search },
  { key: 'for-you', href: '/for-you', label: 'Pour toi', icon: Sparkles },
  { key: 'prepare', href: '/prepare-toi', label: 'Se préparer', icon: Compass },
  {
    key: 'applications',
    href: '/applications',
    label: 'Mes candidatures',
    icon: LayoutList,
  },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Changer de thème"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="hidden dark:block" />
      <Moon className="block dark:hidden" />
    </Button>
  )
}

export function Navbar({
  active,
  applicationsCount,
}: {
  active: ActivePage
  applicationsCount: number
}) {
  const router = useRouter()
  const [accountEmail, setAccountEmail] = useState('')
  useEffect(() => {
    const supabase = createClient()
    if (!supabase) return

    void supabase.auth
      .getUser()
      .then(({ data }) => setAccountEmail(data.user?.email ?? ''))
  }, [])

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:bg-background/70">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-4 px-4">
          <Link href="/search" className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-5" />
            </span>
            <span className="hidden text-sm font-semibold tracking-tight sm:inline">
              Scholarship Tracker
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((link) => {
              const Icon = link.icon
              const isActive = active === link.key
              return (
                <Button
                  key={link.key}
                  variant={isActive ? 'secondary' : 'ghost'}
                  size="sm"
                  nativeButton={false}
                  render={<Link href={link.href} />}
                  className={cn(!isActive && 'text-muted-foreground')}
                >
                  <Icon data-icon="inline-start" />
                  {link.label}
                  {link.key === 'applications' && applicationsCount > 0 && (
                    <Badge
                      variant={isActive ? 'default' : 'secondary'}
                      className="ml-0.5"
                    >
                      {applicationsCount}
                    </Badge>
                  )}
                </Button>
              )
            })}
          </nav>

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                    aria-label="Menu du compte"
                  />
                }
              >
                <Avatar className="size-8">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    ML
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium text-foreground">
                      {accountEmail ? accountEmail.split('@')[0] : 'Mon compte'}
                    </span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {accountEmail}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem render={<Link href="/profile" />}>
                    <User />
                    Mon profil
                  </DropdownMenuItem>
                  <DropdownMenuItem render={<Link href="/settings" />}>
                    <SettingsIcon />
                    Paramètres
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={async () => {
                      const supabase = createClient()
                      if (!supabase) {
                        toast.error('Service de compte indisponible. Réessaie.')
                        return
                      }

                      const { error } = await supabase.auth.signOut()
                      if (error) {
                        toast.error('Impossible de se déconnecter. Réessaie.')
                        return
                      }
                      router.push('/login')
                      router.refresh()
                    }}
                  >
                    <LogOut />
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid border-t border-border bg-background/95 backdrop-blur md:hidden"
        style={{ gridTemplateColumns: `repeat(${links.length}, minmax(0, 1fr))` }}
      >
        {links.map((link) => {
          const Icon = link.icon
          const isActive = active === link.key
          return (
            <Link
              key={link.key}
              href={link.href}
              className={cn(
                'relative flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition-colors',
                isActive ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {link.label}
              {link.key === 'applications' && applicationsCount > 0 && (
                <span className="absolute top-1.5 right-[calc(50%-1.75rem)] flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] leading-4 text-primary-foreground">
                  {applicationsCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
