import subprocess
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Instalar pypdf si no está
subprocess.check_call([sys.executable, "-m", "pip", "install", "pypdf", "-q"])

from pypdf import PdfWriter, PdfReader

# ── Configura los nombres de tus archivos aquí ──────────────────
PDF_1 = "Presentación CDC FINAL.pdf"
PDF_2 = "Actualización de Sistema - Casa del Carpintero (1).pdf"
SALIDA = "Presentacion CDC - Completa.pdf"
# ────────────────────────────────────────────────────────────────

writer = PdfWriter()

for pdf_path in [PDF_1, PDF_2]:
    try:
        reader = PdfReader(pdf_path)
        for page in reader.pages:
            writer.add_page(page)
        print(f"✓ {pdf_path} — {len(reader.pages)} páginas agregadas")
    except FileNotFoundError:
        print(f"✗ No encontré el archivo: {pdf_path}")
        print("  Verifica que el nombre sea exactamente igual (mayúsculas, tildes, espacios)")
        sys.exit(1)

with open(SALIDA, "wb") as f:
    writer.write(f)

total = sum(len(PdfReader(p).pages) for p in [PDF_1, PDF_2])
print(f"\n✅ Listo: '{SALIDA}' — {total} slides en total")
