import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { timingSafeEqual } from 'crypto'

// In-memory rate limiter: 20 requests per minute per IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const WINDOW_MS = 60_000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }
  if (entry.count >= RATE_LIMIT) return false
  entry.count++
  return true
}

export async function GET(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
  }

  const token = request.headers.get('authorization')?.replace('Bearer ', '') ?? ''
  const validToken = process.env.HUB_API_SECRET ?? ''

  let authorized = false
  try {
    authorized =
      token.length > 0 &&
      token.length === validToken.length &&
      timingSafeEqual(Buffer.from(token), Buffer.from(validToken))
  } catch {
    authorized = false
  }

  if (!authorized) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Reemplaza el select de TODOS los pedidos por 5 COUNT queries paralelas (sin transferir datos)
    type MaquinaRow = { id: number; nombre: string; activa: boolean }
    const [
      { count: totalUsers },
      { count: ordersToday },
      { count: enCola },
      { count: enCorte },
      { count: enTapacantos },
      { count: listos },
      { data: maquinas },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('pedidos').select('*', { count: 'exact', head: true }).gte('fecha_ingreso', todayStart),
      supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'En cola'),
      supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'En corte'),
      supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'En tapacantos'),
      supabase.from('pedidos').select('*', { count: 'exact', head: true }).eq('estado', 'Listo').gte('fecha_ingreso', todayStart),
      supabase.from('maquinas').select('id, nombre, activa'),
    ])

    return NextResponse.json({
      status: 'healthy',
      project: 'casa-del-carpintero',
      timestamp: now.toISOString(),
      metrics: {
        users: totalUsers ?? 0,
        orders: {
          today: ordersToday,
          en_cola: enCola,
          en_corte: enCorte,
          en_tapacantos: enTapacantos,
          listos_hoy: listos,
        },
        machines: (maquinas ?? []).map((m: MaquinaRow) => ({
          id: m.id,
          nombre: m.nombre,
          activa: m.activa,
        })),
      },
    })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    return NextResponse.json(
      { status: 'error', project: 'casa-del-carpintero', error: msg, timestamp: new Date().toISOString() },
      { status: 500 }
    )
  }
}
