/* ==========================================================
   KADO DIGITAL HELLO KITTY — Anniversary JS
   Modul kecil & independen, masing-masing aman (try/catch)
   ========================================================== */

const CONFIG = {
  nameDia : "Aisyah",
  nameAku : "Ryan",
  anniversaryDate: new Date("2026-09-07T00:00:00"),
  startDate      : new Date("2025-09-07T00:00:00"),
  pin     : "070925",
};

/* ===== 1. GATE: PIN ===== */
(function(){
  try{
    let input = '', errTimer = null, resetTimer = null, locked = false;
    const dots = document.querySelectorAll('#pin-dots span');
    const errEl = document.getElementById('lock-error');

    function render(){
      dots.forEach((d,i)=> d.classList.toggle('on', i < input.length));
    }
    window.lkPress = function(k){
      if(locked || input.length >= 6) return;
      input += k; render();
      if(input.length === 6){
        if(input === CONFIG.pin){
          locked = true;
          setTimeout(()=>{
            document.getElementById('layer1').classList.add('hidden');
            document.getElementById('layer3').classList.remove('hidden');
          }, 250);
        } else {
          locked = true;
          resetTimer = setTimeout(()=>{
            errEl.textContent = 'Kode salah, coba lagi ya 🙈';
            input=''; render(); locked = false;
            clearTimeout(errTimer);
            errTimer = setTimeout(()=>{ errEl.textContent=''; }, 1800);
          }, 200);
        }
      }
    };
    window.lkBack = function(){
      if(locked) return;
      input = input.slice(0,-1); render();
    };
    document.addEventListener('keydown', e=>{
      if(document.getElementById('layer1').classList.contains('hidden')) return;
      if(/^[0-9]$/.test(e.key)) window.lkPress(e.key);
      if(e.key==='Backspace') window.lkBack();
    });
  }catch(err){ console.error('gate pin:', err); }
})();

/* ===== 2. GATE: RIDDLE (dihapus — PIN langsung ke hold) ===== */

/* ===== 3. GATE: HOLD HEART (getar → meletup) ===== */
(function(){
  try{
    const HOLD_MS = 3000;
    const CIRC = 2 * Math.PI * 54;
    const ring = document.getElementById('hold-prog');
    const pct  = document.getElementById('hold-pct');
    const btn  = document.getElementById('hold-btn');
    let startT = 0, timer = null, burst = null;

    /* Getar makin cepat & besar mendekati 100% — via durasi animasi.
       d dikuantisasi ke step 10ms agar restart animasi jarang (bukan tiap tick 40ms) */
    function setQuiverSpeed(p){
      const d = (Math.round((0.16 - p*0.09)*100)/100).toFixed(2);  /* .16s → .07s */
      const s = (1.06 + p*0.14).toFixed(2);   /* scale 1.06 → 1.20 */
      btn.style.setProperty('--qd', d+'s');
      btn.style.setProperty('--qs', s);
      if(btn.dataset.qd !== d){
        btn.dataset.qd = d;
        btn.style.animation = 'none';
        void btn.offsetWidth;               /* restart animation */
        btn.style.animation = `holdQuiver var(--qd) linear infinite`;
      }
    }

    function explode(){
      /* Ring kejut */
      burst = document.createElement('div');
      burst.className = 'burst-ring go';
      btn.parentElement.appendChild(burst);
      setTimeout(()=>burst && burst.remove(), 600);

      btn.classList.remove('pressing');
      btn.classList.add('exploding');
      btn.querySelector('span').textContent = '💗';
      pct.textContent = '100% ♥';
      setTimeout(()=>{
        btn.classList.remove('exploding');
        btn.classList.add('done');
        btn.style.animation = '';
        btn.querySelector('span').textContent = 'Terbuka!';
        /* Wave hilang -> blur in -> tahan -> sakura langsung tutupi blur */
        const gate = document.getElementById('layer3');
        if(gate) gate.classList.add('blur-out');
        setTimeout(unlockAll, 1400);
      }, 560);
    }
    function tick(){
      const p = Math.min(1,(Date.now()-startT)/HOLD_MS);
      ring.style.strokeDashoffset = (CIRC*(1-p)) + 'px';
      pct.textContent = Math.round(p*100) + '%';
      setQuiverSpeed(p);
      if(p >= 1){ explode(); return; }
      timer = setTimeout(tick, 40);
    }
    function start(e){
      if(e.cancelable) e.preventDefault();
      if(btn.classList.contains('exploding')) return;
      if(timer) return;
      btn.classList.add('pressing');
      startT = Date.now(); tick();
    }
    function stop(){
      if(btn.classList.contains('exploding')) return;
      btn.classList.remove('pressing');
      btn.style.animation = '';
      delete btn.dataset.qd;
      if(!timer) return;
      clearTimeout(timer); timer = null;
      ring.style.strokeDashoffset = CIRC + 'px';
      pct.textContent = '0%';
    }

    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', stop);
    btn.addEventListener('mouseleave', stop);
    btn.addEventListener('touchstart', start, {passive:false});
    btn.addEventListener('touchend', stop);
    btn.addEventListener('touchcancel', stop);
    btn.addEventListener('contextmenu', e=>e.preventDefault());

    /* Keyboard: tahan Spasi/Enter untuk mengisi ring (aksesibilitas) */
    btn.addEventListener('keydown', e=>{
      if((e.key===' '||e.key==='Enter') && !e.repeat){ e.preventDefault(); start(e); }
    });
    btn.addEventListener('keyup', e=>{
      if(e.key===' '||e.key==='Enter'){ e.preventDefault(); stop(); }
    });

    window.unlockAll = function(){
      /* Sakura sweep mulai; gate baru disembunyikan saat layar sudah
         tertutup penuh (550ms) — hero tidak sempat terlihat duluan */
      if(typeof window.playBlossomTransition==='function') window.playBlossomTransition();
      setTimeout(()=>{
        document.querySelectorAll('.gate').forEach(g=>g.classList.add('hidden'));
      }, 540);
      document.body.style.overflow = '';
      const mt = document.getElementById('music-toggle');
      if(mt) mt.classList.add('show');
      const pn = document.getElementById('page-nav');
      if(pn) pn.classList.add('show');
      const fb = document.getElementById('fullscreen-toggle');
      if(fb) fb.classList.add('show');
      /* Coba putar musik otomatis sekali — hanya jika user belum menyalakan
         sendiri dalam jendela 1200ms (hindari membalik pilihan user) */
      setTimeout(()=>{
        if(!musicState) toggleMusic().catch(()=>{});
      }, 1200);
    };
  }catch(err){ console.error('hold:', err); }
})();

/* ===== 4. COUNTDOWN + DAYS TOGETHER ===== */
(function(){
  try{
    function tickCd(){
      const now = new Date();
      let diff = CONFIG.anniversaryDate - now;
      if(diff <= 0){
        /* Hari-H: judul berganti, kotak jadi ✨ */
        const daysAfter = Math.max(0, Math.floor((now - CONFIG.anniversaryDate)/864e5));
        ['cd-d','cd-h','cd-m','cd-s'].forEach(id=>{
          const el=document.getElementById(id); if(el) el.textContent='00';
        });
        const titleEl = document.querySelector('#countdown-section .sec-title');
        if(titleEl && daysAfter < 2){
          titleEl.textContent = 'Hari Ini Hari Istimewa Kita! 🎉';
          document.querySelectorAll('.cd-box span').forEach(sp=>sp.textContent='✨');
        } else {
          /* Lewat dari hari-H: catatan hari setelahnya, hentikan loop */
          const note = document.createElement('p');
          note.className = 'together';
          note.id = 'cd-after-note';
          note.innerHTML = `Sudah <b>${(daysAfter+1).toLocaleString('id-ID')}</b> hari melewati hari istimewa itu 💞`;
          const grid = document.querySelector('.cd-grid');
          if(grid && !document.getElementById('cd-after-note')){
            grid.parentNode.insertBefore(note, grid.nextSibling);
          }
        }
      } else {
        const d=Math.floor(diff/864e5), h=Math.floor((diff%864e5)/36e5),
              m=Math.floor((diff%36e5)/6e4), s=Math.floor((diff%6e4)/1e3);
        const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=String(v).padStart(2,'0');};
        set('cd-d',d); set('cd-h',h); set('cd-m',m); set('cd-s',s);
      }
      if(diff <= 0) return; /* hari-H: tidak perlu loop tiap detik */
      const daysEl = document.getElementById('days-together');
      if(daysEl){
        const days = Math.max(0, Math.floor((now - CONFIG.startDate)/864e5));
        daysEl.textContent = days.toLocaleString('id-ID');
      }
      setTimeout(tickCd, 1000);
    }
    tickCd();
  }catch(err){ console.error('countdown:', err); }
})();

/* ===== 5. TYPING LETTER ===== */
const LETTER = `Untuk ${CONFIG.nameDia}ku,

7 September 2025 — tanggal kecil yang mengubah segalanya. Sejak hari itu setiap hariku penuh warna karena ada kamu.

Makasih udah jadi rumah, teman tawa, dan tempat pulang. Setahun ini nggak selalu sempurna, tapi selalu berarti.

Happy first anniversary, sayang.
Aku sayang kamu, hari ini dan seterusnya 💕

— ${CONFIG.nameAku}`;

(function(){
  try{
    const el = document.getElementById('typed-text');
    const cur = document.getElementById('cursor');
    if(!el) return;
    let i = 0, started = false;
    cur.style.display='none';
    const io = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting && !started){
        started = true; io.disconnect();
        cur.style.display='inline';
        (function type(){
          if(i < LETTER.length){
            el.textContent += LETTER[i++];
            setTimeout(type, i<80 ? 32 : 17);
          } else {
            setTimeout(()=>{ cur.style.display='none'; }, 1200);
          }
        })();
      }
    }, {threshold:.35});
    io.observe(document.getElementById('letter-section'));
  }catch(err){ console.error('letter:', err); }
})();

/* ===== 6. GALERI: POLAROID BERSERAKAN + LIGHTBOX ===== */
(function(){
  try{
    const DATA = window.AIV_DATA;
    const mess = document.getElementById('polaroidMess');
    /* Data gagal load: sembunyikan tombol + sediakan no-op agar
       onclick inline tidak melempar ReferenceError */
    window.loadMorePolaroids = function(){};
    const lmBtn = document.getElementById('loadMoreBtn');
    if((!DATA || !DATA.slides || !mess) && lmBtn){
      lmBtn.style.display = 'none';
      return;
    }
    if(!DATA || !DATA.slides || !mess) return;

    /* Flatten semua foto — PERTAHANKAN urutan kurasi dari aiv-data.js
       (sudah kronologis; jangan re-sort di runtime, parser duplikat
       bisa menghasilkan urutan berbeda dari data) */
    const allPhotos = [];
    DATA.slides.forEach(s=>s.photos.forEach(p=>allPhotos.push(p)));
    const all = allPhotos.map(p => p.src);

    let shown = 0;
    const BATCH = 18;

    function addBatch(){
      const batch = all.slice(shown, shown + BATCH);
      batch.forEach((src, idx)=>{
        const card = document.createElement('div');
        card.className = 'polaroid';
        const rot = (Math.random()*24 - 12).toFixed(1);
        card.style.setProperty('--rot', rot+'deg');
        card.style.animationDelay = (idx*60)+'ms';

        const img = document.createElement('img');
        img.src = src; img.loading='lazy'; img.alt='';
        card.addEventListener('click', ()=>openLB(src));
        card.appendChild(img);
        mess.appendChild(card);
      });
      shown += batch.length;
      const btn = document.getElementById('loadMoreBtn');
      if(btn){
        btn.style.display = shown >= all.length ? 'none' : 'inline-block';
        btn.textContent = `🎀 Tampilkan Lagi (${all.length - shown} foto)`;
      }
    }
    window.loadMorePolaroids = addBatch;
    addBatch();

    /* Benang penghubung antar polaroid — SVG path melengkung dari
       titik selotip satu polaroid ke polaroid berikutnya */
    const svgNS = 'http://www.w3.org/2000/svg';
    const threadSvg = document.createElementNS(svgNS, 'svg');
    threadSvg.id = 'threadSvg';
    mess.insertBefore(threadSvg, mess.firstChild);

    function drawThreads(){
      const cards = [...mess.querySelectorAll('.polaroid')];
      const mr = mess.getBoundingClientRect();
      if(!cards.length){ threadSvg.innerHTML=''; return; }
      threadSvg.setAttribute('viewBox', `0 0 ${mr.width} ${mr.height}`);
      let paths = '';
      for(let i=0; i<cards.length-1; i++){
        const a = cards[i].getBoundingClientRect();
        const b = cards[i+1].getBoundingClientRect();
        /* Titik awal/akhir: tengah-selotip (atas kartu) */
        const x1 = a.left - mr.left + a.width/2, y1 = a.top - mr.top + 2;
        const x2 = b.left - mr.left + b.width/2, y2 = b.top - mr.top + 2;
        /* Kontrol melengkung — searah rotasi biar natural */
        const cx = (x1+x2)/2;
        const cy = Math.max(y1,y2) + Math.abs(x2-x1)*0.35 + 14;
        paths += `<path d="M ${x1.toFixed(1)} ${y1} Q ${cx} ${cy} ${x2.toFixed(1)} ${y2}" fill="none" stroke="#E8A0B4" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`;
      }
      /* Benang pertama & terakhir menjuntai ke atas (kayu dijahit) */
      const f = cards[0].getBoundingClientRect(), l = cards[cards.length-1].getBoundingClientRect();
      const fx = f.left - mr.left + f.width/2, lx = l.left - mr.left + l.width/2;
      paths += `<path d="M ${fx.toFixed(1)} ${f.top-mr.top+2} Q ${(fx-18).toFixed(1)} ${(f.top-mr.top-26)} ${(fx+10).toFixed(1)} ${(f.top-mr.top-34)}" fill="none" stroke="#E8A0B4" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`;
      paths += `<path d="M ${lx.toFixed(1)} ${l.top-mr.top+2} Q ${(lx+18).toFixed(1)} ${(l.top-mr.top-26)} ${(lx-10).toFixed(1)} ${(l.top-mr.top-34)}" fill="none" stroke="#E8A0B4" stroke-width="1.6" stroke-linecap="round" opacity=".85"/>`;
      threadSvg.innerHTML = paths;
    }

    /* Jangan gambar saat halaman hidden (getBoundingClientRect = 0).
       Redraw dipicu saat halaman galeri benar-benar tampil (lihat
       window._onGalleryVisible yang dipanggil gotoPage) + resize + load */
    function isHidden(){
      const page = document.getElementById('page-gallery');
      return !page || page.classList.contains('hidden') || !mess.offsetWidth;
    }
    window.addEventListener('load', ()=>{ if(!isHidden()) drawThreads(); });
    window.addEventListener('resize', ()=>{ clearTimeout(window._threadT); if(!isHidden()) window._threadT = setTimeout(drawThreads, 150); });
    window._onGalleryVisible = function(){
      if(isHidden()) return;
      /* Tunggu animasi polaroidIn selesai agar posisi kartu final */
      clearTimeout(window._threadT);
      window._threadT = setTimeout(drawThreads, 1350);
    };
    const _origAddBatch = addBatch;
    window.loadMorePolaroids = function(){ _origAddBatch(); setTimeout(drawThreads, 80); };

    /* Lightbox + navigasi prev/next + focus trap */
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    const lbBtns = lb.querySelectorAll('button');
    let lbIndex = 0, lbPrevFocus = null;

    function closeLB(){
      lb.classList.remove('show');
      delete lb.dataset.dir;
      const frame = lb.querySelector('.lb-frame');
      if(frame){
        frame.onanimationend = null;
        frame.style.animation = '';
      }
      document.removeEventListener('keydown', lbKeyTrap);
      if(lbPrevFocus) lbPrevFocus.focus();
    }
    function lbKeyTrap(e){
      if(e.key==='Escape'){ closeLB(); return; }
      if(e.key!=='Tab') return;
      const first = lbBtns[0], last = lbBtns[lbBtns.length-1];
      if(e.shiftKey && document.activeElement===first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement===last){ e.preventDefault(); first.focus(); }
    }
    let lbAnimSeq = 0;
    function showLB(i, navDir){
      if(!all.length) return;
      const isOpen = lb.classList.contains('show');
      const prev = lbIndex;
      lbIndex = (i + all.length) % all.length;
      lbPrevFocus = isOpen ? lbPrevFocus : document.activeElement;
      const frame = lb.querySelector('.lb-frame');
      if(isOpen && navDir){
        /* Navigasi di dalam lightbox: slide-out lama, slide-in baru */
        const seq = ++lbAnimSeq;
        frame.onanimationend = null;
        frame.style.animation = 'none';
        void frame.offsetWidth;
        lb.dataset.dir = navDir;
        frame.onanimationend = ()=>{
          if(seq !== lbAnimSeq) return;
          frame.onanimationend = null;
          /* Foto baru masuk dengan lbIn */
          delete lb.dataset.dir;
          lbImg.src = all[lbIndex];
          frame.style.animation = 'none';
          void frame.offsetWidth;
          frame.style.animation = '';
        };
      } else {
        /* Buka pertama kali: lbIn scale */
        lbImg.src = all[lbIndex];
        frame.style.animation = 'none';
        void frame.offsetWidth;
        frame.style.animation = '';
      }
      lb.classList.add('show');
      document.addEventListener('keydown', lbKeyTrap);
      lbBtns[0].focus();
    }
    document.getElementById('lb-close').addEventListener('click', closeLB);
    document.getElementById('lb-prev').addEventListener('click', e=>{ e.stopPropagation(); showLB(lbIndex - 1, 'right'); });
    document.getElementById('lb-next').addEventListener('click', e=>{ e.stopPropagation(); showLB(lbIndex + 1, 'left'); });
    lb.addEventListener('click', e=>{ if(e.target===lb) closeLB(); });
    window.openLB = function(src){
      const idx = all.indexOf(src);
      if(lb.classList.contains('show')) closeLB();
      setTimeout(()=> showLB(idx >= 0 ? idx : 0), 50);
    };

    /* Swipe kiri/kanan & pan untuk pindah foto */
    let touchX = 0, touchY = 0, swiped = false;
    lb.addEventListener('touchstart', e=>{
      touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; swiped = false;
    }, {passive:true});
    lb.addEventListener('touchmove', e=>{
      if(swiped) return;
      const dx = e.touches[0].clientX - touchX;
      const dy = e.touches[0].clientY - touchY;
      if(Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)){
        showLB(lbIndex + (dx < 0 ? 1 : -1), dx < 0 ? 'left' : 'right');
        swiped = true;
      }
    }, {passive:true});
    /* Panah keyboard — Escape ditangani lbKeyTrap */
    document.addEventListener('keydown', e=>{
      if(!lb.classList.contains('show')) return;
      if(e.key === 'ArrowRight') showLB(lbIndex + 1, 'left');
      if(e.key === 'ArrowLeft')  showLB(lbIndex - 1, 'right');
    });
  }catch(err){ console.error('galeri:', err); }
})();

/* ===== 7. STATS COUNTER DENGAN ANIMASI COUNT-UP ===== */
(function(){
  try{
    const sec = document.getElementById('stats-section');
    if(!sec) return;
    const photoCount = window.AIV_DATA?.slides
      ? window.AIV_DATA.slides.reduce((n, s) => n + s.photos.length, 0)
      : (window.AIV_DATA?.total || 0);
    const now = new Date();
    const daysTogether = Math.max(1, Math.floor((now - CONFIG.startDate)/864e5));
    const targets = {
      days:    daysTogether,
      photos:  photoCount,
      months:  Math.max(1, Math.round(daysTogether / 30.4)),
      hours:   daysTogether * 24,
      seconds: Math.round((daysTogether * 86400) / 1000000 * 10) / 10
    };

    function animateValue(el, start, end, duration, formatFn){
      if(!el) return;
      const startT = performance.now();
      function step(nowT){
        const progress = Math.min(1, (nowT - startT) / duration);
        const ease = 1 - Math.pow(1 - progress, 3); // cubic out
        const current = start + (end - start) * ease;
        el.textContent = formatFn ? formatFn(current) : Math.floor(current).toLocaleString('id-ID');
        if(progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    let started = false;
    function runStats(){
      if(started) return;
      started = true;
      animateValue(document.querySelector('[data-days]'), 0, targets.days, 1200);
      animateValue(document.querySelector('[data-photos]'), 0, targets.photos, 1400);
      animateValue(document.querySelector('[data-months]'), 0, targets.months, 1000);
      animateValue(document.querySelector('[data-hours]'), 0, targets.hours, 1600);
      animateValue(document.querySelector('[data-seconds]'), 0, targets.seconds, 1500, v => v.toFixed(1) + 'M');

      const bar = document.getElementById('love-bar');
      if(bar) setTimeout(()=> { bar.style.width = '100%'; }, 200);
    }

    const io = new IntersectionObserver(entries=>{
      if(entries[0].isIntersecting){
        io.disconnect();
        runStats();
      }
    }, {threshold:.25});
    io.observe(sec);
  }catch(err){ console.error('stats:', err); }
})();

/* ===== 8. SCROLL POP-IN ===== */
(function(){
  try{
    const io = new IntersectionObserver(entries=>{
      entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('in'); });
    }, {threshold:.12});
    document.querySelectorAll('.pop-section').forEach(s=>io.observe(s));
  }catch(err){ console.error('reveal:', err); }
})();

/* ===== 9. CONFETTI & CLOSING INTERACTIONS ===== */
window.launchConfetti = function(){
  try{
    const colors = ['#FF9EC4','#FFD6E8','#D64477','#E8365D','#FFF0F6','#FFD54F'];
    for(let i=0;i<90;i++){
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random()*100 + 'vw';
      c.style.background = colors[i % colors.length];
      c.style.animation = `confettiFall ${2+Math.random()*2}s linear ${(Math.random()*.7)}s forwards`;
      c.style.transform = `rotate(${Math.random()*360}deg)`;
      document.body.appendChild(c);
      setTimeout(()=>c.remove(), 5500);
    }
  }catch(err){ console.error('confetti:', err); }
};

let giftOpened = false;
window.openGift = function(){
  const gb = document.getElementById('gift-box');
  if(gb) gb.classList.add('opened');
  if(!giftOpened){
    giftOpened = true;
    window.launchConfetti();
  }
  const rb = document.getElementById('surprise-reveal');
  if(rb) rb.classList.add('show');
};

window.toggleEnvelope = function(idx){
  const envs = document.querySelectorAll('.envelope');
  if(envs[idx]){
    const open = envs[idx].classList.toggle('open');
    envs[idx].setAttribute('aria-expanded', open);
  }
};
const style = document.createElement('style');
style.textContent = '@keyframes confettiFall{to{transform:translateY(110vh) rotate(720deg)}}';
document.head.appendChild(style);

/* ===== 10. MUSIC (MP3 + fallback WebAudio) ===== */
let musicState = false;
async function toggleMusic(){
  const audio = document.getElementById('bg-audio');
  const btn = document.getElementById('music-toggle');
  if(musicState){
    musicState = false;
    audio.pause(); audio.currentTime = 0;
    synthStop();
    btn.classList.add('off');
    return;
  }
  musicState = true;
  btn.classList.remove('off');
  try{
    await audio.play();
  }catch(e){
    /* play() bisa reject terlambat (autoplay policy) — jangan nyalakan
       synth jika user sudah toggle off saat menunggu promise */
    if(musicState) synthStart();
  }
}
window.toggleMusic = toggleMusic;
const musicBtn = document.getElementById('music-toggle');
if(musicBtn) musicBtn.addEventListener('click', ()=>toggleMusic().catch(()=>{}));

let synthCtx = null, synthTimer = null, synthGain = null;
function synthStart(){
  try{
    if(synthCtx && synthCtx.state !== 'closed'){
      synthGain.gain.value = .12;
      synthGain.connect(synthCtx.destination);
      scheduleLoop();
      return;
    }
    synthCtx = new (window.AudioContext||window.webkitAudioContext)();
    synthGain = synthCtx.createGain();
    synthGain.gain.value = .12;
    synthGain.connect(synthCtx.destination);
    scheduleLoop();
  }catch(e){}
}
function scheduleLoop(){
  const seq = [523,587,659,784, 659,587,523,440, 523,587,659,784, 988,880,784,659];
  const step = .34;
  seq.forEach((f,i)=>{
    const t = synthCtx.currentTime + .05 + i*step;
    playNote(f, t, step*2.4);
  });
  synthTimer = setTimeout(()=>{
    if(musicState) scheduleLoop();
  }, seq.length*step*1000);
}
function playNote(f,t,dur){
  const o=synthCtx.createOscillator(), g=synthCtx.createGain();
  o.type='sine'; o.frequency.value=f;
  g.gain.setValueAtTime(.001,t);
  g.gain.linearRampToValueAtTime(.14,t+.02);
  g.gain.exponentialRampToValueAtTime(.001,t+dur);
  o.connect(g); g.connect(synthGain);
  o.start(t); o.stop(t+dur+.05);
}
function synthStop(){
  if(synthTimer){ clearTimeout(synthTimer); synthTimer=null; }
  if(synthGain) synthGain.disconnect();
}

/* ===== 11. FLOATING PETALS (sakura) + HATI ===== */
(function(){
  try{
    const bg = document.getElementById('hearts-bg');
    const svgHeart = '<svg viewBox="0 0 24 24"><path d="M12 21C5.5 16.5 2.8 12.6 2.8 8.6 2.8 5.4 5.1 3.4 7.8 3.6c2 .1 3.6 1.2 4.2 2.8.6-1.6 2.2-2.7 4.2-2.8 2.7-.2 5 1.8 5 5 0 4-2.7 7.9-9.2 12.4z" fill="{c}"/></svg>';
    const colors = ['#FF9EC4','#FFC8DC','#D64477','#FFD6E8'];
    /* Kelopak: gradasi radial pink lembut, bulat — bukan kotak */
    const petalHTML = '<div class="petal-core"></div>';

    /* Kelopak sakura: melayang dari bawah ke atas sambil bergoyang */
    function spawnPetal(){
      const el = document.createElement('div');
      el.className = 'f-petal';
      const size = 16 + Math.random()*20;
      el.style.cssText = `left:${Math.random()*100}vw;width:${size}px;height:${size}px;animation-duration:${9+Math.random()*9}s;animation-delay:-${Math.random()*9}s;--sway:${(Math.random()*120-60).toFixed(0)}px;`;
      el.innerHTML = petalHTML;
      bg.appendChild(el);
      setTimeout(()=>el.remove(), 24000);
    }
    /* Hati pink kecil sesekali */
    function spawnHeart(){
      const el = document.createElement('div');
      el.className = 'f-heart';
      const size = 13 + Math.random()*18;
      el.style.cssText = `left:${Math.random()*96}vw;width:${size}px;height:${size}px;animation-duration:${8+Math.random()*10}s;animation-delay:-${Math.random()*8}s;`;
      el.innerHTML = svgHeart.replace('{c}', colors[Math.floor(Math.random()*colors.length)]);
      bg.appendChild(el);
      setTimeout(()=>el.remove(), 20000);
    }
    setInterval(spawnPetal, 700);
    setInterval(spawnHeart, 1800);
    for(let i=0;i<8;i++){ spawnPetal(); }
    for(let i=0;i<3;i++) spawnHeart();
  }catch(err){ console.error('particles:', err); }
})();

/* ===== 12. SAKURA TRANSITION (kiri-bawah → kanan-atas penuh layar) ===== */
(function(){
  try{
    window.playBlossomTransition = function(callback){
      const t = document.createElement('div');
      t.className = 'blossom-transition';

      /* Preload 3 varian blossom — hindari lag saat render pertama */
      const variants = ['blossom-a.png', 'blossom-b.png', 'pinkblossom2.webp'];
      if(!window._btPreloaded){
        window._btPreloaded = true;
        variants.forEach(v=>{ const i=new Image(); i.src='assets/transisi/'+v; });
      }

      /* 8 blossom — animasi transform-only (GPU), tanpa left/top */
      const lanes = ['lane-topleft', 'lane-midtop', 'lane-center', 'lane-midbot', 'lane-botright'];
      for(let i=0; i<8; i++){
        const img = document.createElement('img');
        img.src = 'assets/transisi/' + variants[i % variants.length];
        img.alt = '';
        img.className = 'bt-img ' + lanes[i % lanes.length];
        img.style.animationDelay = (i * 70) + 'ms';
        t.appendChild(img);
      }

      document.body.appendChild(t);
      requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('run')));

      /* Saat blossom sudah memenuhi layar (0.55s) -> Ganti Halaman */
      setTimeout(() => {
        if(typeof callback === 'function') callback();
      }, 550);

      /* Hold lalu fade keluar & bersihkan */
      setTimeout(() => {
        t.classList.add('fade');
        setTimeout(() => t.remove(), 650);
      }, 1800);
    };

    /* Navigasi antar halaman dengan transisi sakura */
    const PAGES = ['hero','letter','gallery','stats','closing'];
    window.gotoPage = function(name){
      if(!PAGES.includes(name)) return;
      playBlossomTransition(()=>{
        PAGES.forEach(p=>{
          const el = document.getElementById('page-'+p);
          if(el) el.classList.toggle('hidden', p!==name);
        });
        document.querySelectorAll('#page-nav button').forEach(b=>{
          b.classList.toggle('on', b.getAttribute('data-page')===name);
        });
        window.scrollTo(0,0);
        const active = document.querySelector('#page-'+name+' .pop-section');
        if(active){
          active.classList.remove('in');
          setTimeout(()=>active.classList.add('in'), 350);
        }
        if(typeof window._onGalleryVisible === 'function') window._onGalleryVisible();
      });
    };
    document.querySelectorAll('#page-nav button').forEach(b=>{
      b.addEventListener('click', ()=>gotoPage(b.getAttribute('data-page')));
    });
  }catch(err){ console.error('transition:', err); }
})();

/* ===== 13. PROTEKSI MOBILE ===== */
(function(){
  try{
    /* Long-press gambar -> cegah menu simpan (iOS Safari butuh preventDefault) */
    document.addEventListener('contextmenu', e=>{
      if(e.target && e.target.tagName === 'IMG') e.preventDefault();
    });

    /* Long-press teks/gambar di mobile: blokir seleksi & callout */
    document.addEventListener('touchstart', function(e){
      const t = e.target;
      if(t && (t.tagName === 'IMG' || t.tagName === 'P' || t.tagName === 'B' || t.tagName === 'SPAN')){
        t.style.webkitUserSelect = 'none';
        t.style.userSelect = 'none';
      }
    }, {passive:true});
  }catch(err){ console.error('proteksi:', err); }
})();

/* ===== 14. FULLSCREEN TOGGLE + SERVICE WORKER ===== */
(function(){
  try{
    const fsBtn = document.getElementById('fullscreen-toggle');
    /* Fullscreen API tidak ada di iOS Safari halaman web — sembunyikan tombol;
       di iPhone jalur layar penuh adalah Add to Home Screen (PWA) */
    if(fsBtn && document.documentElement.requestFullscreen){
      fsBtn.classList.add('available');
      fsBtn.addEventListener('click', ()=>{
        const doc = document, root = doc.documentElement;
        if(!doc.fullscreenElement && !doc.webkitFullscreenElement){
          (root.requestFullscreen || root.webkitRequestFullscreen).call(root).catch(()=>{});
        } else {
          (doc.exitFullscreen || doc.webkitExitFullscreen).call(doc);
        }
      });
      const sync = ()=> fsBtn.classList.toggle('fs-on', !!(document.fullscreenElement || document.webkitFullscreenElement));
      document.addEventListener('fullscreenchange', sync);
      document.addEventListener('webkitfullscreenchange', sync);
    }

    /* Register service worker hanya via http/https (bukan file://) */
    if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
      window.addEventListener('load', ()=>{
        navigator.serviceWorker.register('sw.js').catch(()=>{});
      });
    }
  }catch(err){ console.error('fullscreen/sw:', err); }
})();
