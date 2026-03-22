-- Migration: Tabla para guardar reportes diarios históricos
-- Ejecutar en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS reportes_guardados (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha      date NOT NULL UNIQUE,         -- una fila por día, upsert por fecha
  stats      jsonb NOT NULL,               -- snapshot de métricas del día
  created_at timestamptz DEFAULT now()
);

-- RLS: solo usuarios autenticados pueden leer/insertar
ALTER TABLE reportes_guardados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth users can read reportes"
  ON reportes_guardados FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "auth users can upsert reportes"
  ON reportes_guardados FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "auth users can update reportes"
  ON reportes_guardados FOR UPDATE
  USING (auth.role() = 'authenticated');
