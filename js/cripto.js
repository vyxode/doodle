// Cifrado compartido por la web y el robot de sincronización (Web Crypto: navegador y Node 20+).
// Formato: { v: 1, salt, iv, data } en base64. AES-GCM 256 con clave derivada de la contraseña por PBKDF2-SHA256.
const ITER = 600000;
const sub = globalThis.crypto.subtle;
const b64 = (u8) => btoa(String.fromCharCode(...u8));
const deb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
const claves = new Map(); // derivar es lento (a propósito): se reutiliza por contraseña+sal durante la sesión

async function derivar(pass, salt) {
  const id = pass + '|' + b64(salt);
  if (!claves.has(id)) {
    const base = await sub.importKey('raw', new TextEncoder().encode(pass), 'PBKDF2', false, ['deriveKey']);
    claves.set(id, await sub.deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']));
  }
  return claves.get(id);
}

// `salt` opcional: reutilizar la de un sobre anterior evita volver a derivar la clave en cada guardado.
export async function cifrar(pass, obj, salt) {
  salt = salt ? deb64(salt) : globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const datos = await sub.encrypt({ name: 'AES-GCM', iv }, await derivar(pass, salt), new TextEncoder().encode(JSON.stringify(obj)));
  // en trozos: String.fromCharCode(...) revienta la pila con datos grandes
  let s = ''; const u = new Uint8Array(datos);
  for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode(...u.subarray(i, i + 0x8000));
  return { v: 1, salt: b64(salt), iv: b64(iv), data: btoa(s) };
}

// Lanza un error si la contraseña no es la correcta (AES-GCM verifica la integridad).
export async function descifrar(pass, sobre) {
  if (!sobre || sobre.v !== 1) throw new Error('Formato de datos desconocido');
  const claro = await sub.decrypt({ name: 'AES-GCM', iv: deb64(sobre.iv) }, await derivar(pass, deb64(sobre.salt)), deb64(sobre.data));
  return JSON.parse(new TextDecoder().decode(claro));
}
