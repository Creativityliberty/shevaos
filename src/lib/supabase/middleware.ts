import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserRole } from '@/core/auth/roles'
import { DEFAULT_REDIRECTS } from '@/core/auth/roles'

// Routes protégées par rôle
const ROLE_PROTECTED_ROUTES: Record<string, UserRole[]> = {
  '/finance': ['finance', 'ceo', 'manager'],
  '/dispatch': ['dispatcher', 'ceo', 'manager', 'ops_manager'],
  '/driver': ['driver'],
  '/hub': ['hub', 'hub_manager', 'ceo', 'manager'],
  '/settings': ['ceo', 'manager'],
  '/ads': ['ads_manager', 'ceo', 'manager'],
}

// Routes accessibles sans authentification
const PUBLIC_ROUTES = ['/login', '/signup', '/auth']

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  // 1. Route publique → laisser passer
  if (PUBLIC_ROUTES.some(r => pathname.startsWith(r))) {
    // Si connecté et sur /login ou /signup → rediriger vers dashboard
    if (user && (pathname === '/login' || pathname === '/signup')) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      const role = (profile?.role as UserRole) ?? 'sav_agent'
      const redirect = DEFAULT_REDIRECTS[role] ?? '/dashboard'
      return NextResponse.redirect(new URL(redirect, request.url))
    }
    return supabaseResponse
  }

  // 2. Pas connecté → /login
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // 3. Connecté — vérifier RBAC pour les routes protégées par rôle
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, is_active, tenant_id')
    .eq('id', user.id)
    .single()

  // Compte désactivé → déconnexion
  if (profile && profile.is_active === false) {
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL('/login?reason=inactive', request.url))
  }

  // Profil manquant (bug trigger ou RLS)
  if (!profile) {
    // Si on vient de s'inscrire, on peut avoir un petit délai. On laisse passer au dashboard qui gérera l'état de chargement
    // ou on redirige vers login si c'est persistant.
    return supabaseResponse
  }

  const userRole = profile?.role as UserRole

  // Vérifier les routes protégées par rôle
  for (const [route, allowedRoles] of Object.entries(ROLE_PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!allowedRoles.includes(userRole)) {
        // Rediriger vers la page d'accueil du rôle
        const redirect = DEFAULT_REDIRECTS[userRole] ?? '/dashboard'
        return NextResponse.redirect(new URL(redirect, request.url))
      }
      break
    }
  }

  return supabaseResponse
}
