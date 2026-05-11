import crypto from "crypto";

function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const s = input.replace(/=+$/, "").toUpperCase();
  let bits = 0, value = 0;
  const out: number[] = [];
  for (const c of s) {
    value = (value << 5) | alphabet.indexOf(c);
    bits += 5;
    if (bits >= 8) { bits -= 8; out.push((value >> bits) & 0xff); }
  }
  return Buffer.from(out);
}

function counterToBuffer(counter: number): Buffer {
  const buf = Buffer.allocUnsafe(8);
  buf.writeUInt32BE(0, 0);
  buf.writeUInt32BE(counter >>> 0, 4);
  return buf;
}

function hotp(key: Buffer, counter: number): string {
  const msg = counterToBuffer(counter);
  const hmac = crypto.createHmac("sha1", key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const code =
    ((hmac[offset]     & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8)  |
    ((hmac[offset + 3] & 0xff));
  return String(code % 1_000_000).padStart(6, "0");
}

export function verifyTOTP(secret: string, code: string): boolean {
  const key = base32Decode(secret);
  const t = Math.floor(Date.now() / 30_000);
  const input = code.replace(/\s/g, "");
  return [t - 1, t, t + 1].some((c) => hotp(key, c) === input);
}

export function generateTOTPUri(secret: string, issuer: string, account: string): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
