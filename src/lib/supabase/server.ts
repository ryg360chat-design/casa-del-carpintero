import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const SUPABASE_CONFIGURED =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith("http") &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = SUPABASE_CONFIGURED;

export async function createClient() {
  if (!SUPABASE_CONFIGURED) {
    // Cliente vacío con método-chaining para desarrollo sin credenciales
    const emptyChain: Record<string, unknown> = {};
    const chainMethods = ["select","insert","update","delete","upsert","eq","neq","gt","gte","lt","lte","like","ilike","is","in","not","or","order","limit","single","maybeSingle","head","range","filter","match","textSearch","contains","containedBy","overlaps","rangeGt","rangeLte","rangeGte","rangeLt","adjacent"];
    const proxy = (): unknown => {
      const obj: Record<string, unknown> = { data: [], error: null, count: 0 };
      chainMethods.forEach((m) => { obj[m] = () => proxy(); });
      obj.then = (resolve: (v: unknown) => unknown) => Promise.resolve(resolve({ data: [], error: null, count: 0 }));
      return obj;
    };
    chainMethods.forEach((m) => { emptyChain[m] = proxy; });
    return {
      auth: { getUser: async () => ({ data: { user: null }, error: null }) },
      from: () => proxy(),
    } as unknown as ReturnType<typeof createServerClient>;
  }

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
