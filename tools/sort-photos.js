/* Sortir 157 foto di aiv-data.js secara kronologis (tertua -> terbaru),
   lalu bagi ulang ke 5 babak. Jalankan: node tools/sort-photos.js */
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'aiv-data.js');

const content = fs.readFileSync(DATA_FILE, 'utf8');
const data = JSON.parse(content.replace(/^window\.AIV_DATA=/, '').replace(/;\s*$/, ''));

const all = [];
data.slides.forEach(s => s.photos.forEach(p => all.push({ name: p.name, src: p.src })));

const MONTHS = {
  Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
  Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
};

/* Kunci tanggal YYYYMMDDHHMMSS dari nama file.
   Foto tanpa tanggal (hash Canva, IMG_9948) diasumsikan awal Agustus 2025
   (awal kisah), diurutkan stabil sesuai nomor urutnya. */
function dateKey(name) {
  // IMG_20250810_194911 / VID_20251214_035201 / Seputar_Gcam20251009_090849 / WA: 20251107
  let m = name.match(/202[56][-_]?([01]\d)[- _]?([0-3]\d)(?:[-_ ]?([0-2]\d)([0-5]\d)([0-5]\d)?)?/);
  if (m) return m[0].replace(/[-_]/g, '').padEnd(14, '0');

  // Preset Gcam/iPhone tanpa tahun: "18_Oct_13_02", "1_Jan_09_59", "26_Dec_16_46"
  m = name.match(/(\d{1,2})_(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:_(\d{2})_(\d{2}))?/);
  if (m) {
    const day = m[1].padStart(2, '0');
    const mon = MONTHS[m[2]];
    const hh = m[3] || '12';
    const mm = m[4] || '00';
    const year = ['Oct', 'Nov', 'Dec'].includes(m[2]) ? '2025' : '2026';
    return `${year}${mon}${day}${hh}${mm}00`;
  }

  // Tanpa tanggal -> awal kisah (Agustus 2025), pakai nomor urut agar stabil
  m = name.match(/^(\d{3})_Copy_of_/);
  return `20250801000000_${m ? m[1] : '999'}`;
}

all.forEach(p => { p._k = dateKey(p.name); });
all.sort((a, b) => a._k.localeCompare(b._k));
all.forEach(p => delete p._k);

const SLIDES = [
  { babak: 1, title: 'Awal Kisah Kita',
    sub: 'Momen-momen kecil sebelum dan sesudah 7 September 2025 yang membawa kita ke sini.' },
  { babak: 2, title: 'Hari-Hari yang Makin Dekat',
    sub: 'Dari obrolan sederhana sampai tawa yang tidak direncanakan, hari biasa berubah jadi cerita.' },
  { babak: 3, title: 'Rumah di Tengah Ramai',
    sub: 'Bersamamu, perjalanan panjang dan hari yang melelahkan selalu punya tempat untuk pulang.' },
  { babak: 4, title: 'Hal-Hal Kecil yang Jadi Besar',
    sub: 'Foto-foto ini menyimpan bukti bahwa bahagia sering datang dari momen sederhana.' },
  { babak: 5, title: 'Kita, Hari Ini dan Seterusnya',
    sub: 'Satu tahun pertama selesai. Cerita untuk terus tumbuh dan tertawa baru dimulai.' },
];

/* PERINGATAN: script ini MENIMPA aiv-data.js. Urutan & pembagian babak
   yang ada sekarang sudah dikurasi manual — jangan dijalankan ulang
   kecuali memang mau regenerasi penuh dari nol. */

const out = { slides: [], total: all.length };

/* Bagi merata: tiap slide dapat ~round(n/slide), sisanya ke slide terakhir */
let offset = 0;
out.slides = SLIDES.map((meta, i) => {
  const count = i === SLIDES.length - 1
    ? all.length - offset
    : Math.round(all.length / SLIDES.length);
  const photos = all.slice(offset, offset + count);
  offset += photos.length;
  return { ...meta, count: photos.length, photos };
});

fs.writeFileSync(DATA_FILE, 'window.AIV_DATA=' + JSON.stringify(out) + ';\n', 'utf8');
console.log(`OK — ${all.length} foto terurut kronologis ke ${DATA_FILE}`);
