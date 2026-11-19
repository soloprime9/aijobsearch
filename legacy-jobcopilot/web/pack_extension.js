// Standalone Pure-Node Chrome Extension ZIP Builder (Zero external dependencies)
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EXTENSION_DIR = path.join(ROOT_DIR, 'extension');
const OUTPUT_ZIP = path.join(__dirname, 'public', 'ai-job-copilot-extension.zip');

// CRC32 implementation (RFC 1952)
function getCrc32(buf) {
  if (typeof zlib.crc32 === 'function') {
    return zlib.crc32(buf);
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

const table = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  table[i] = c;
}

function getAllFiles(dir, prefix = '') {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      result.push(...getAllFiles(fullPath, relPath));
    } else {
      result.push({ fullPath, relPath });
    }
  }
  return result;
}

export function buildExtensionZip() {
  const files = getAllFiles(EXTENSION_DIR);
  const localHeaders = [];
  const centralHeaders = [];
  let offset = 0;

  for (const file of files) {
    const rawData = fs.readFileSync(file.fullPath);
    const crc = getCrc32(rawData);
    const compressed = zlib.deflateRawSync(rawData);
    const nameBuf = Buffer.from(file.relPath.replace(/\\/g, '/'), 'utf8');

    // Local file header (30 bytes + nameBuf.length)
    const lh = Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50, 0); // local file header signature
    lh.writeUInt16LE(20, 4);         // version needed to extract (2.0)
    lh.writeUInt16LE(0, 6);          // general purpose bit flag
    lh.writeUInt16LE(8, 8);          // compression method (deflate)
    lh.writeUInt16LE(0, 10);         // last mod file time
    lh.writeUInt16LE(0, 12);         // last mod file date
    lh.writeUInt32LE(crc, 14);       // crc-32
    lh.writeUInt32LE(compressed.length, 18); // compressed size
    lh.writeUInt32LE(rawData.length, 22);    // uncompressed size
    lh.writeUInt16LE(nameBuf.length, 26);    // file name length
    lh.writeUInt16LE(0, 28);                 // extra field length

    localHeaders.push(lh, nameBuf, compressed);

    // Central directory header (46 bytes + nameBuf.length)
    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0); // central file header signature
    cd.writeUInt16LE(20, 4);         // version made by
    cd.writeUInt16LE(20, 6);         // version needed to extract
    cd.writeUInt16LE(0, 8);          // general purpose bit flag
    cd.writeUInt16LE(8, 10);         // compression method (deflate)
    cd.writeUInt16LE(0, 12);         // last mod time
    cd.writeUInt16LE(0, 14);         // last mod date
    cd.writeUInt32LE(crc, 16);       // crc-32
    cd.writeUInt32LE(compressed.length, 20); // compressed size
    cd.writeUInt32LE(rawData.length, 24);    // uncompressed size
    cd.writeUInt16LE(nameBuf.length, 28);    // file name length
    cd.writeUInt16LE(0, 30);                 // extra field length
    cd.writeUInt16LE(0, 32);                 // file comment length
    cd.writeUInt16LE(0, 34);                 // disk number start
    cd.writeUInt16LE(0, 36);                 // internal file attributes
    cd.writeUInt32LE(0, 38);                 // external file attributes
    cd.writeUInt32LE(offset, 42);            // relative offset of local header

    centralHeaders.push(cd, nameBuf);
    offset += lh.length + nameBuf.length + compressed.length;
  }

  const centralDirBuffer = Buffer.concat(centralHeaders);
  const centralDirSize = centralDirBuffer.length;
  const centralDirOffset = offset;

  // End of central directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0); // end of central dir signature
  eocd.writeUInt16LE(0, 4);          // number of this disk
  eocd.writeUInt16LE(0, 6);          // number of the disk with start of central dir
  eocd.writeUInt16LE(files.length, 8); // total number of entries in central dir on this disk
  eocd.writeUInt16LE(files.length, 10); // total number of entries in central dir
  eocd.writeUInt32LE(centralDirSize, 12); // size of central directory
  eocd.writeUInt32LE(centralDirOffset, 16); // offset of start of central dir
  eocd.writeUInt16LE(0, 20);          // .ZIP file comment length

  const finalZip = Buffer.concat([...localHeaders, centralDirBuffer, eocd]);
  fs.writeFileSync(OUTPUT_ZIP, finalZip);
  console.log(`[ZIP BUILDER] ✓ Successfully built ${OUTPUT_ZIP} (${(finalZip.length / 1024).toFixed(1)} KB) containing ${files.length} extension files!`);
  return OUTPUT_ZIP;
}

if (process.argv[1] && process.argv[1].endsWith('pack_extension.js')) {
  buildExtensionZip();
}
