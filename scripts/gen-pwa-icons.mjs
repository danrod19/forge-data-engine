/**
 * Rasteriza public/icon.svg (F neon em slate-950) para PNG 192 / 512 / 180.
 * Sem dependências — PNG cru via zlib.
 */
import { deflateSync } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "..", "public");

const BG = [0x02, 0x06, 0x17];
const NEON = [0x22, 0xc5, 0x5e];
const SS = 4;

function crcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
}
const CRC_TABLE = crcTable();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type);
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const crcBuf = Buffer.concat([t, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(crcBuf));
  return Buffer.concat([len, t, data, crc]);
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const src = y * width * 4;
    const dst = y * (width * 4 + 1);
    raw[dst] = 0;
    rgba.copy(raw, dst + 1, src, src + width * 4);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const png = Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
  return png;
}

function fillRect(buf, size, x0, y0, x1, y1, rgb, alpha) {
  const xa = Math.max(0, Math.floor(x0));
  const ya = Math.max(0, Math.floor(y0));
  const xb = Math.min(size, Math.ceil(x1));
  const yb = Math.min(size, Math.ceil(y1));
  for (let y = ya; y < yb; y++) {
    for (let x = xa; x < xb; x++) {
      const i = (y * size + x) * 4;
      const a = alpha;
      buf[i] = Math.round(buf[i] * (1 - a) + rgb[0] * a);
      buf[i + 1] = Math.round(buf[i + 1] * (1 - a) + rgb[1] * a);
      buf[i + 2] = Math.round(buf[i + 2] * (1 - a) + rgb[2] * a);
      buf[i + 3] = 255;
    }
  }
}

/** F geométrico (viewBox 512) escalado; glow em camadas. */
function drawF(buf, size) {
  const s = size / 512;
  const layers = [
    { a: 0.18, pad: 18 },
    { a: 0.35, pad: 8 },
    { a: 1, pad: 0 },
  ];
  const bars = [
    [164, 112, 72, 288],
    [164, 112, 204, 64],
    [164, 228, 154, 56],
  ];
  for (const { a, pad } of layers) {
    for (const [x, y, w, h] of bars) {
      fillRect(
        buf,
        size,
        (x - pad) * s,
        (y - pad) * s,
        (x + w + pad) * s,
        (y + h + pad) * s,
        NEON,
        a
      );
    }
  }
}

function downsample(src, srcSize, dstSize, factor) {
  const dst = Buffer.alloc(dstSize * dstSize * 4);
  const n = factor * factor;
  for (let y = 0; y < dstSize; y++) {
    for (let x = 0; x < dstSize; x++) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      for (let oy = 0; oy < factor; oy++) {
        for (let ox = 0; ox < factor; ox++) {
          const i = ((y * factor + oy) * srcSize + (x * factor + ox)) * 4;
          r += src[i];
          g += src[i + 1];
          b += src[i + 2];
          a += src[i + 3];
        }
      }
      const j = (y * dstSize + x) * 4;
      dst[j] = Math.round(r / n);
      dst[j + 1] = Math.round(g / n);
      dst[j + 2] = Math.round(b / n);
      dst[j + 3] = Math.round(a / n);
    }
  }
  return dst;
}

function makeIcon(size) {
  const hi = size * SS;
  const buf = Buffer.alloc(hi * hi * 4);
  for (let i = 0; i < hi * hi; i++) {
    buf[i * 4] = BG[0];
    buf[i * 4 + 1] = BG[1];
    buf[i * 4 + 2] = BG[2];
    buf[i * 4 + 3] = 255;
  }
  drawF(buf, hi);
  return downsample(buf, hi, size, SS);
}

function writeIcon(name, size) {
  const file = join(outDir, name);
  writeFileSync(file, encodePng(size, size, makeIcon(size)));
  console.log("wrote", name, `${size}x${size}`);
}

writeIcon("icon-192.png", 192);
writeIcon("icon-512.png", 512);
writeIcon("apple-touch-icon.png", 180);
