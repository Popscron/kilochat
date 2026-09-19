/**
 * Decode an 8-bit PNG or JPEG, clip it to a circle (transparent corners), and re-encode.
 * Inflate is a TypeScript port of foliojs/tiny-inflate (MIT).
 */
// jpeg-js is CommonJS; require keeps Expo Go on device from missing `.decode`.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const decodeJpeg = require('jpeg-js').decode as (
  data: Uint8Array,
  opts?: { useTArray?: boolean; formatAsRGBA?: boolean }
) => { width: number; height: number; data: Uint8Array };

const PNG_SIG = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(bytes: Uint8Array, start = 0, end = bytes.length) {
  let crc = 0xffffffff;
  for (let i = start; i < end; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function adler32(bytes: Uint8Array) {
  let a = 1;
  let b = 0;
  for (let i = 0; i < bytes.length; i++) {
    a = (a + bytes[i]) % 65521;
    b = (b + a) % 65521;
  }
  return ((b >>> 0) << 16) | a;
}

function readU32(bytes: Uint8Array, offset: number) {
  return (
    ((bytes[offset] << 24) | (bytes[offset + 1] << 16) | (bytes[offset + 2] << 8) | bytes[offset + 3]) >>> 0
  );
}

function writeU32(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = (value >>> 24) & 0xff;
  bytes[offset + 1] = (value >>> 16) & 0xff;
  bytes[offset + 2] = (value >>> 8) & 0xff;
  bytes[offset + 3] = value & 0xff;
}

class HuffmanTree {
  table = new Uint16Array(16);
  trans = new Uint16Array(288);
}

class InflateState {
  source: Uint8Array;
  sourceIndex = 0;
  tag = 0;
  bitcount = 0;
  dest: Uint8Array;
  destLen = 0;
  ltree = new HuffmanTree();
  dtree = new HuffmanTree();

  constructor(source: Uint8Array, dest: Uint8Array) {
    this.source = source;
    this.dest = dest;
  }
}

const sltree = new HuffmanTree();
const sdtree = new HuffmanTree();
const lengthBits = new Uint8Array(30);
const lengthBase = new Uint16Array(30);
const distBits = new Uint8Array(30);
const distBase = new Uint16Array(30);
const clcidx = new Uint8Array([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
const codeTree = new HuffmanTree();
const codeLengths = new Uint8Array(288 + 32);
const treeOffs = new Uint16Array(16);

function buildBitsBase(bits: Uint8Array, base: Uint16Array, delta: number, first: number) {
  for (let i = 0; i < delta; i++) bits[i] = 0;
  for (let i = 0; i < 30 - delta; i++) bits[i + delta] = (i / delta) | 0;
  for (let sum = first, i = 0; i < 30; i++) {
    base[i] = sum;
    sum += 1 << bits[i];
  }
}

function buildFixedTrees(lt: HuffmanTree, dt: HuffmanTree) {
  for (let i = 0; i < 7; i++) lt.table[i] = 0;
  lt.table[7] = 24;
  lt.table[8] = 152;
  lt.table[9] = 112;
  for (let i = 0; i < 24; i++) lt.trans[i] = 256 + i;
  for (let i = 0; i < 144; i++) lt.trans[24 + i] = i;
  for (let i = 0; i < 8; i++) lt.trans[24 + 144 + i] = 280 + i;
  for (let i = 0; i < 112; i++) lt.trans[24 + 144 + 8 + i] = 144 + i;
  for (let i = 0; i < 5; i++) dt.table[i] = 0;
  dt.table[5] = 32;
  for (let i = 0; i < 32; i++) dt.trans[i] = i;
}

function buildTree(tree: HuffmanTree, lengths: Uint8Array, off: number, num: number) {
  for (let i = 0; i < 16; i++) tree.table[i] = 0;
  for (let i = 0; i < num; i++) tree.table[lengths[off + i]]++;
  tree.table[0] = 0;
  for (let sum = 0, i = 0; i < 16; i++) {
    treeOffs[i] = sum;
    sum += tree.table[i];
  }
  for (let i = 0; i < num; i++) {
    if (lengths[off + i]) tree.trans[treeOffs[lengths[off + i]]++] = i;
  }
}

buildFixedTrees(sltree, sdtree);
buildBitsBase(lengthBits, lengthBase, 4, 3);
buildBitsBase(distBits, distBase, 2, 1);
lengthBits[28] = 0;
lengthBase[28] = 258;

function getBit(d: InflateState) {
  if (!d.bitcount--) {
    if (d.sourceIndex >= d.source.length) throw new Error('PNG inflate eof');
    d.tag = d.source[d.sourceIndex++];
    d.bitcount = 7;
  }
  const bit = d.tag & 1;
  d.tag >>>= 1;
  return bit;
}

function readBits(d: InflateState, num: number, base: number) {
  if (!num) return base;
  while (d.bitcount < 24) {
    if (d.sourceIndex >= d.source.length) throw new Error('PNG inflate eof');
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }
  const val = d.tag & (0xffff >>> (16 - num));
  d.tag >>>= num;
  d.bitcount -= num;
  return val + base;
}

function decodeSymbol(d: InflateState, tree: HuffmanTree) {
  while (d.bitcount < 24) {
    if (d.sourceIndex >= d.source.length) throw new Error('PNG inflate eof');
    d.tag |= d.source[d.sourceIndex++] << d.bitcount;
    d.bitcount += 8;
  }
  let sum = 0;
  let cur = 0;
  let len = 0;
  let tag = d.tag;
  do {
    cur = 2 * cur + (tag & 1);
    tag >>>= 1;
    len++;
    sum += tree.table[len];
    cur -= tree.table[len];
  } while (cur >= 0);
  d.tag = tag;
  d.bitcount -= len;
  return tree.trans[sum + cur];
}

function decodeTrees(d: InflateState, lt: HuffmanTree, dt: HuffmanTree) {
  const hlit = readBits(d, 5, 257);
  const hdist = readBits(d, 5, 1);
  const hclen = readBits(d, 4, 4);
  for (let i = 0; i < 19; i++) codeLengths[i] = 0;
  for (let i = 0; i < hclen; i++) codeLengths[clcidx[i]] = readBits(d, 3, 0);
  buildTree(codeTree, codeLengths, 0, 19);
  for (let num = 0; num < hlit + hdist; ) {
    const sym = decodeSymbol(d, codeTree);
    if (sym === 16) {
      const prev = codeLengths[num - 1];
      for (let length = readBits(d, 2, 3); length; length--) codeLengths[num++] = prev;
    } else if (sym === 17) {
      for (let length = readBits(d, 3, 3); length; length--) codeLengths[num++] = 0;
    } else if (sym === 18) {
      for (let length = readBits(d, 7, 11); length; length--) codeLengths[num++] = 0;
    } else {
      codeLengths[num++] = sym;
    }
  }
  buildTree(lt, codeLengths, 0, hlit);
  buildTree(dt, codeLengths, hlit, hdist);
}

function inflateBlockData(d: InflateState, lt: HuffmanTree, dt: HuffmanTree) {
  for (;;) {
    const sym = decodeSymbol(d, lt);
    if (sym === 256) return;
    if (sym < 256) {
      d.dest[d.destLen++] = sym;
      continue;
    }
    const length = readBits(d, lengthBits[sym - 257], lengthBase[sym - 257]);
    const dist = decodeSymbol(d, dt);
    const offs = d.destLen - readBits(d, distBits[dist], distBase[dist]);
    for (let i = offs; i < offs + length; i++) d.dest[d.destLen++] = d.dest[i];
  }
}

function inflateUncompressedBlock(d: InflateState) {
  while (d.bitcount > 8) {
    d.sourceIndex--;
    d.bitcount -= 8;
  }
  const length = d.source[d.sourceIndex] | (d.source[d.sourceIndex + 1] << 8);
  const invlength = d.source[d.sourceIndex + 2] | (d.source[d.sourceIndex + 3] << 8);
  if (length !== (~invlength & 0xffff)) throw new Error('PNG inflate length mismatch');
  d.sourceIndex += 4;
  for (let i = 0; i < length; i++) d.dest[d.destLen++] = d.source[d.sourceIndex++];
  d.bitcount = 0;
}

function inflateRaw(source: Uint8Array, destSize: number) {
  const d = new InflateState(source, new Uint8Array(destSize));
  let bfinal = 0;
  do {
    bfinal = getBit(d);
    const btype = readBits(d, 2, 0);
    if (btype === 0) inflateUncompressedBlock(d);
    else if (btype === 1) inflateBlockData(d, sltree, sdtree);
    else if (btype === 2) {
      decodeTrees(d, d.ltree, d.dtree);
      inflateBlockData(d, d.ltree, d.dtree);
    } else {
      throw new Error('PNG inflate block type');
    }
  } while (!bfinal);
  return d.dest.subarray(0, d.destLen);
}

function inflateZlib(bytes: Uint8Array, destSize: number) {
  if (bytes.length < 6) throw new Error('PNG zlib too short');
  const cmf = bytes[0];
  const flg = bytes[1];
  if ((cmf & 0x0f) !== 8) throw new Error('PNG zlib method');
  let offset = 2;
  if (flg & 0x20) offset += 4;
  return inflateRaw(bytes.subarray(offset), destSize);
}

/** iOS device PNGs are often CgBI: raw deflate, not zlib-wrapped. */
function inflateIdat(bytes: Uint8Array, destSize: number, isCgbi: boolean) {
  const tryRaw = () => inflateRaw(bytes, destSize);
  const tryZlib = () => inflateZlib(bytes, destSize);
  if (isCgbi) {
    try {
      return tryRaw();
    } catch {
      return tryZlib();
    }
  }
  try {
    return tryZlib();
  } catch {
    return tryRaw();
  }
}

function fromCgbi(rgba: Uint8Array) {
  for (let i = 0; i < rgba.length; i += 4) {
    const b = rgba[i];
    const g = rgba[i + 1];
    const r = rgba[i + 2];
    const a = rgba[i + 3];
    if (a && a < 255) {
      rgba[i] = Math.min(255, Math.round((r * 255) / a));
      rgba[i + 1] = Math.min(255, Math.round((g * 255) / a));
      rgba[i + 2] = Math.min(255, Math.round((b * 255) / a));
    } else {
      rgba[i] = r;
      rgba[i + 1] = g;
      rgba[i + 2] = b;
    }
  }
}

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function unfilter(data: Uint8Array, width: number, height: number, bpp: number) {
  const stride = width * bpp;
  const out = new Uint8Array(height * stride);
  let src = 0;
  let dst = 0;
  for (let y = 0; y < height; y++) {
    const filter = data[src++];
    for (let x = 0; x < stride; x++) {
      const raw = data[src++];
      const left = x >= bpp ? out[dst + x - bpp] : 0;
      const up = y > 0 ? out[dst + x - stride] : 0;
      const upLeft = y > 0 && x >= bpp ? out[dst + x - stride - bpp] : 0;
      let val = raw;
      if (filter === 1) val = (raw + left) & 0xff;
      else if (filter === 2) val = (raw + up) & 0xff;
      else if (filter === 3) val = (raw + ((left + up) >> 1)) & 0xff;
      else if (filter === 4) val = (raw + paeth(left, up, upLeft)) & 0xff;
      else if (filter !== 0) throw new Error(`PNG filter ${filter}`);
      out[dst + x] = val;
    }
    dst += stride;
  }
  return out;
}

function toRgba(
  pixels: Uint8Array,
  width: number,
  height: number,
  colorType: number,
  palette?: Uint8Array,
  trns?: Uint8Array,
  isCgbi = false
) {
  const count = width * height;
  if (colorType === 6) {
    const rgba = new Uint8Array(count * 4);
    rgba.set(pixels.subarray(0, count * 4));
    if (isCgbi) fromCgbi(rgba);
    return rgba;
  }
  const rgba = new Uint8Array(count * 4);
  if (colorType === 2) {
    for (let i = 0, p = 0; i < count; i++, p += 3) {
      const o = i * 4;
      rgba[o] = isCgbi ? pixels[p + 2] : pixels[p];
      rgba[o + 1] = pixels[p + 1];
      rgba[o + 2] = isCgbi ? pixels[p] : pixels[p + 2];
      rgba[o + 3] = 255;
    }
    return rgba;
  }
  if (colorType === 0) {
    for (let i = 0; i < count; i++) {
      const o = i * 4;
      const g = pixels[i];
      rgba[o] = g;
      rgba[o + 1] = g;
      rgba[o + 2] = g;
      rgba[o + 3] = 255;
    }
    return rgba;
  }
  if (colorType === 4) {
    for (let i = 0, p = 0; i < count; i++, p += 2) {
      const o = i * 4;
      const g = pixels[p];
      rgba[o] = g;
      rgba[o + 1] = g;
      rgba[o + 2] = g;
      rgba[o + 3] = pixels[p + 1];
    }
    return rgba;
  }
  if (colorType === 3 && palette && palette.length >= 3) {
    const colors = Math.floor(palette.length / 3);
    for (let i = 0; i < count; i++) {
      const index = Math.min(pixels[i], colors - 1);
      const o = i * 4;
      const p = index * 3;
      rgba[o] = palette[p];
      rgba[o + 1] = palette[p + 1];
      rgba[o + 2] = palette[p + 2];
      rgba[o + 3] = trns && index < trns.length ? trns[index] : 255;
    }
    return rgba;
  }
  throw new Error(`PNG color type ${colorType}`);
}

function decodePng(bytes: Uint8Array) {
  for (let i = 0; i < 8; i++) {
    if (bytes[i] !== PNG_SIG[i]) throw new Error('PNG signature');
  }
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idat: Uint8Array[] = [];
  let palette: Uint8Array | undefined;
  let trns: Uint8Array | undefined;
  let isCgbi = false;
  let offset = 8;
  while (offset + 12 <= bytes.length) {
    const length = readU32(bytes, offset);
    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], bytes[offset + 6], bytes[offset + 7]);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) throw new Error('PNG chunk');
    if (type === 'CgBI') isCgbi = true;
    if (type === 'IHDR') {
      width = readU32(bytes, dataStart);
      height = readU32(bytes, dataStart + 4);
      bitDepth = bytes[dataStart + 8];
      colorType = bytes[dataStart + 9];
      if (bytes[dataStart + 12]) throw new Error('PNG interlace');
    } else if (type === 'PLTE') {
      palette = bytes.slice(dataStart, dataEnd);
    } else if (type === 'tRNS') {
      trns = bytes.slice(dataStart, dataEnd);
    } else if (type === 'IDAT') {
      idat.push(bytes.subarray(dataStart, dataEnd));
    } else if (type === 'IEND') {
      break;
    }
    offset = dataEnd + 4;
  }
  if (!width || !height || bitDepth !== 8) throw new Error('PNG header');
  const bpp = colorType === 6 ? 4 : colorType === 2 ? 3 : colorType === 4 ? 2 : colorType === 0 || colorType === 3 ? 1 : 0;
  if (!bpp) throw new Error(`PNG color type ${colorType}`);
  let idatLen = 0;
  for (const chunk of idat) idatLen += chunk.length;
  const compressed = new Uint8Array(idatLen);
  let w = 0;
  for (const chunk of idat) {
    compressed.set(chunk, w);
    w += chunk.length;
  }
  const expected = height * (1 + width * bpp);
  const raw = inflateIdat(compressed, expected + 64, isCgbi);
  if (raw.length < expected) throw new Error('PNG inflate short');
  const filtered = unfilter(raw, width, height, bpp);
  return { width, height, rgba: toRgba(filtered, width, height, colorType, palette, trns, isCgbi) };
}

function applyCircleAlpha(rgba: Uint8Array, width: number, height: number, inset = 1) {
  const cx = width / 2;
  const cy = height / 2;
  const radius = (Math.min(width, height) / 2) * Math.max(0.5, Math.min(1, inset));
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x + 0.5 - cx;
      const dy = y + 0.5 - cy;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const i = (y * width + x) * 4 + 3;
      if (distance >= radius + 0.5) {
        rgba[i] = 0;
      } else if (distance > radius - 0.5) {
        rgba[i] = Math.round(rgba[i] * (radius + 0.5 - distance));
      }
    }
  }
}

function deflateUncompressed(data: Uint8Array) {
  const max = 65535;
  const blocks = Math.max(1, Math.ceil(data.length / max));
  const out = new Uint8Array(2 + blocks * 5 + data.length + 4);
  out[0] = 0x78;
  out[1] = 0x01;
  let o = 2;
  let offset = 0;
  for (let b = 0; b < blocks; b++) {
    const start = offset;
    const end = Math.min(data.length, start + max);
    const len = end - start;
    const last = b === blocks - 1 ? 1 : 0;
    out[o++] = last;
    out[o++] = len & 0xff;
    out[o++] = (len >> 8) & 0xff;
    const nlen = ~len & 0xffff;
    out[o++] = nlen & 0xff;
    out[o++] = (nlen >> 8) & 0xff;
    out.set(data.subarray(start, end), o);
    o += len;
    offset = end;
  }
  const sum = adler32(data);
  writeU32(out, o, sum);
  return out.subarray(0, o + 4);
}

function encodeChunk(type: string, data: Uint8Array) {
  const chunk = new Uint8Array(12 + data.length);
  writeU32(chunk, 0, data.length);
  chunk[4] = type.charCodeAt(0);
  chunk[5] = type.charCodeAt(1);
  chunk[6] = type.charCodeAt(2);
  chunk[7] = type.charCodeAt(3);
  chunk.set(data, 8);
  writeU32(chunk, 8 + data.length, crc32(chunk, 4, 8 + data.length));
  return chunk;
}

function encodePng(rgba: Uint8Array, width: number, height: number) {
  const stride = width * 4;
  const raw = new Uint8Array(height * (1 + stride));
  for (let y = 0; y < height; y++) {
    const src = y * stride;
    const dst = y * (1 + stride);
    raw[dst] = 0;
    raw.set(rgba.subarray(src, src + stride), dst + 1);
  }
  const ihdr = new Uint8Array(13);
  writeU32(ihdr, 0, width);
  writeU32(ihdr, 4, height);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const parts = [PNG_SIG, encodeChunk('IHDR', ihdr), encodeChunk('IDAT', deflateUncompressed(raw)), encodeChunk('IEND', new Uint8Array(0))];
  let total = 0;
  for (const part of parts) total += part.length;
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Clip a PNG or JPEG to a circle so NativeTabs shows rounded photos like the default avatar. */
export function isPngBytes(bytes: Uint8Array) {
  return bytes.length >= 8 && PNG_SIG.every((value, i) => bytes[i] === value);
}

export function isJpegBytes(bytes: Uint8Array) {
  return bytes.length > 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function cropResizeSquare(rgba: Uint8Array, srcW: number, srcH: number, size: number) {
  const side = Math.min(srcW, srcH);
  const ox = Math.floor((srcW - side) / 2);
  const oy = Math.floor((srcH - side) / 2);
  const out = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const sy = oy + Math.min(side - 1, Math.floor(((y + 0.5) * side) / size));
    for (let x = 0; x < size; x++) {
      const sx = ox + Math.min(side - 1, Math.floor(((x + 0.5) * side) / size));
      const si = (sy * srcW + sx) * 4;
      const di = (y * size + x) * 4;
      out[di] = rgba[si];
      out[di + 1] = rgba[si + 1];
      out[di + 2] = rgba[si + 2];
      out[di + 3] = 255;
    }
  }
  return out;
}

function decodeRgba(imageBytes: Uint8Array) {
  const bytes =
    imageBytes.byteOffset || imageBytes.byteLength !== imageBytes.buffer.byteLength
      ? new Uint8Array(imageBytes)
      : imageBytes;
  if (isPngBytes(bytes)) return decodePng(bytes);
  if (!isJpegBytes(bytes)) throw new Error('Image format');
  const decoded = decodeJpeg(bytes, { useTArray: true, formatAsRGBA: true });
  const rgba = decoded.data instanceof Uint8Array ? decoded.data : new Uint8Array(decoded.data);
  return { width: decoded.width, height: decoded.height, rgba };
}

export function makeCircularPng(pngBytes: Uint8Array, inset = 1) {
  return makeCircularImage(pngBytes, inset);
}

export function makeCircularImage(imageBytes: Uint8Array, inset = 1, size?: number) {
  let { width, height, rgba } = decodeRgba(imageBytes);
  if (size && (width !== size || height !== size)) {
    rgba = cropResizeSquare(rgba, width, height, size);
    width = size;
    height = size;
  }
  applyCircleAlpha(rgba, width, height, inset);
  return encodePng(rgba, width, height);
}
