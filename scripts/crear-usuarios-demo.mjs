/**
 * Script: crear-usuarios-demo.mjs
 * Uso: node scripts/crear-usuarios-demo.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve } from "path";

// Leer .env.local
const envPath = resolve(process.cwd(), ".env.local");
const envVars = {};
const lines = readFileSync(envPath, "utf-8").split("\n");
for (const line of lines) {
  const idx = line.indexOf("=");
  if (idx > 0 && !line.trim().startsWith("#")) {
    envVars[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
  }
}

const SUPABASE_URL = envVars["NEXT_PUBLIC_SUPABASE_URL"];
const SERVICE_ROLE_KEY = envVars["SUPABASE_SERVICE_ROLE_KEY"];

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USUARIOS = [
  { email: "jorge.castillo@cdc.demo",  nombre: "Jorge del Castillo", rol: "gerencia" },
  { email: "gavi.valladares@cdc.demo", nombre: "Gavi Valladares",    rol: "administracion" },
  { email: "lucy.alarcon@cdc.demo",    nombre: "Lucy Alarcón",       rol: "logistica" },
  { email: "karelys.guillen@cdc.demo", nombre: "Karelys Guillén",    rol: "ventas" },
  { email: "jose.salas@cdc.demo",      nombre: "José Salas",         rol: "almacen_tableros" },
  { email: "cesar@cdc.demo",           nombre: "César",              rol: "almacen_cantos" },
  { email: "pedro.acuna@cdc.demo",     nombre: "Pedro Acuña",        rol: "produccion" },
  { email: "lidia.suarez@cdc.demo",    nombre: "Lidia Suárez",       rol: "corte_especial" },
];

const PASSWORD = "CasaCarpintero2025!";

async function main() {
  console.log("Obteniendo usuarios existentes...\n");

  // Traer todos los usuarios de Supabase
  const { data: listData, error: listError } = await supabase.auth.admin.listUsers({ perPage: 200 });
  if (listError) {
    console.error("Error listando usuarios:", listError.message);
    process.exit(1);
  }

  const existingMap = new Map(listData.users.map((u) => [u.email, u.id]));
  console.log(`Usuarios existentes en auth: ${listData.users.length}\n`);

  for (const u of USUARIOS) {
    const existingId = existingMap.get(u.email);

    if (existingId) {
      // Actualizar contraseña y confirmar email del usuario existente
      const { error } = await supabase.auth.admin.updateUserById(existingId, {
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { nombre: u.nombre },
      });

      if (error) {
        console.error(`❌ Error actualizando ${u.email}: ${error.message}`);
        continue;
      }

      // Actualizar profile
      await supabase.from("profiles").upsert({ id: existingId, nombre: u.nombre, rol: u.rol });
      console.log(`✓ Actualizado:  ${u.nombre.padEnd(22)} [${u.rol}]`);

    } else {
      // No existe — crear nuevo
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { nombre: u.nombre },
      });

      if (error) {
        console.error(`❌ Error creando ${u.email}: ${error.message}`);
        continue;
      }

      await supabase.from("profiles").upsert({ id: data.user.id, nombre: u.nombre, rol: u.rol });
      console.log(`✓ Creado:       ${u.nombre.padEnd(22)} [${u.rol}]`);
    }
  }

  console.log("\n✅ Listo. Contraseña: " + PASSWORD);
}

main();
