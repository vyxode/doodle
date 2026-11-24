// Zip mínimo, sin comprimir (método «store»): basta para descargar código, diagramas y textos juntos.
// archivos: [{ nombre: 'carpeta/archivo.cs', datos: texto o Uint8Array }] → Blob application/zip
const TABLA = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
export function crc32(b) { let c = ~0; for (const x of b) c = TABLA[(c ^ x) & 255] ^ (c >>> 8); return ~c >>> 0; }

export function zip(archivos) {
  const enc = new TextEncoder(), partes = [], central = [];
  let pos = 0;
  const cab = (n) => new DataView(new ArrayBuffer(n));
  for (const a of archivos) {
    const nombre = enc.encode(a.nombre), datos = typeof a.datos === 'string' ? enc.encode(a.datos) : a.datos, crc = crc32(datos);
    // cabecera local (30 bytes) y entrada del directorio central (46 bytes); bit 11 = nombres en UTF-8
    const l = cab(30);
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [14, crc, 4], [18, datos.length, 4], [22, datos.length, 4], [26, nombre.length, 2]].forEach(([o, v, t]) => (t === 4 ? l.setUint32(o, v, true) : l.setUint16(o, v, true)));
    const c = cab(46);
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [16, crc, 4], [20, datos.length, 4], [24, datos.length, 4], [28, nombre.length, 2], [42, pos, 4]].forEach(([o, v, t]) => (t === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true)));
    partes.push(l, nombre, datos); central.push(c, nombre);
    pos += 30 + nombre.length + datos.length;
  }
  const tam = central.reduce((s, x) => s + x.byteLength, 0), fin = cab(22);
  [[0, 0x06054b50, 4], [8, archivos.length, 2], [10, archivos.length, 2], [12, tam, 4], [16, pos, 4]].forEach(([o, v, t]) => (t === 4 ? fin.setUint32(o, v, true) : fin.setUint16(o, v, true)));
  return new Blob([...partes, ...central, fin], { type: 'application/zip' });
}
