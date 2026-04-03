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
      { data: pedidos },
      { data: maquinas },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('pedidos').select('estado, fecha_ingreso'),
      supabase.from('maquinas').select('id, nombre, activa'),
    ])

    const p = pedidos ?? []
    const ordersToday = p.filter(o => o.fecha_ingreso >= todayStart).length
    const enCola = p.filter(o => o.estado === 'En cola').length
    const enCorte = p.filter(o => o.estado === 'En corte').length
    const enTapacantos = p.filter(o => o.estado === 'En tapacantos').length
    const listos = p.filter(o => o.estado === 'Listo' && o.fecha_ingreso >= todayStart).length

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
