import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.HUB_API_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

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
          today: ordersToday ?? 0,
          en_cola: enCola ?? 0,
          en_corte: enCorte ?? 0,
          en_tapacantos: enTapacantos ?? 0,
          listos_hoy: listos ?? 0,
        },
        machines: (maquinas ?? []).map((m) => ({
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
