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
    let input = '';
    const dots = document.querySelectorAll('#pin-dots span');
    const errEl = document.getElementById('lock-error');

    function render(){
      dots.forEach((d,i)=> d.classList.toggle('on', i < input.length));
    }
    window.lkPress = function(k){
      if(input.length >= 6) return;
      input += k; render();
      if(input.length === 6){
        if(input === CONFIG.pin){
          setTimeout(()=>{
            document.getElementById('layer1').classList.add('hidden');
            document.getElementById('layer3').classList.remove('hidden');
          }, 250);
        } else {
          setTimeout(()=>{
            errEl.textContent = 'Kode salah, coba lagi ya 🙈';
            input=''; render();
            setTimeout(()=>{ errEl.textContent=''; }, 1800);
          }, 200);
        }
      }
    };
    window.lkBack = function(){ input = input.slice(0,-1); render(); };
    document.addEventListener('keydown', e=>{
      if(document.getElementById('layer1').classList.contains('hidden')) return;
      if(/^[0-9]$/.test(e.key)) window.lkPress(e.key);
      if(e.key==='Backspace') window.lkBack();
    });
  }catch(err){ console.error('gate pin:', err); }
})();

/* ===== 2. GATE: RIDDLE (dihapus — PIN langsung ke hold) ===== */

/* ===== 3. GATE: HOLD HEART ===== */
(function(){
  try{
    const HOLD_MS = 3000;
    const CIRC = 2 * Math.PI * 54;
    const ring = document.getElementById('hold-prog');
    const pct  = document.getElementById('hold-pct');
    const btn  = document.getElementById('hold-btn');
    let startT = 0, timer = null;

    function done(){
      btn.classList.remove('pressing');
      btn.classList.add('done');
      btn.querySelector('span').textContent = 'Terbuka!';
      pct.textContent = '100% ♥';
      setTimeout(unlockAll, 400);
    }
    function tick(){
      const p = Math.min(1,(Date.now()-startT)/HOLD_MS);
      ring.style.strokeDashoffset = (CIRC*(1-p)) + 'px';
      pct.textContent = Math.round(p*100) + '%';
      if(p >= 1){ done(); return; }
      timer = setTimeout(tick, 40);
    }
    function start(e){
      if(e.cancelable) e.preventDefault();
      if(timer) return;
      btn.classList.add('pressing');
      startT = Date.now(); tick();
    }
    function stop(){
      btn.classList.remove('pressing');
      if(!timer || btn.classList.contains('done')) { timer=null; return; }
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

    window.unlockAll = function(){
      document.querySelectorAll('.gate').forEach(g=>g.classList.add('hidden'));
      document.body.style.overflow = '';
      const mt = document.getElementById('music-toggle');
      if(mt) mt.classList.add('show');
      const pn = document.getElementById('page-nav');
      if(pn) pn.classList.add('show');
      if(typeof window.playBlossomTransition==='function') window.playBlossomTransition();
      setTimeout(()=>{ toggleMusic().catch(()=>{}); }, 1200);
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
        ['cd-d','cd-h','cd-m','cd-s'].forEach(id=>{
          const el=document.getElementById(id); if(el) el.textContent='00';
        });
      } else {
        const d=Math.floor(diff/864e5), h=Math.floor((diff%864e5)/36e5),
              m=Math.floor((diff%36e5)/6e4), s=Math.floor((diff%6e4)/1e3);
        const set=(id,v)=>{const el=document.getElementById(id); if(el) el.textContent=String(v).padStart(2,'0');};
        set('cd-d',d); set('cd-h',h); set('cd-m',m); set('cd-s',s);
      }
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
const LETTER = `Untuk ${CONFIG.nameDia},

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
    if(!DATA || !DATA.slides) return;
    const mess = document.getElementById('polaroidMess');
    if(!mess) return;

    /* Flatten semua foto & urutkan kronologis dari yang tertua */
    const MONTHS = { Jan:'01', Feb:'02', Mar:'03', Apr:'04', May:'05', Jun:'06', Jul:'07', Aug:'08', Sep:'09', Oct:'10', Nov:'11', Dec:'12' };
    function photoKey(name){
      let m = name.match(/202[56][-_]?([01]\d)[- _]?([0-3]\d)(?:[-_ ]?([0-2]\d)([0-5]\d)([0-5]\d)?)?/);
      if(m) return m[0].replace(/[-_ ]/g, '').padEnd(14, '0');
      m = name.match(/(\d{1,2})_(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)(?:_(\d{2})_(\d{2}))?/);
      if(m){
        const d = m[1].padStart(2, '0'), mon = MONTHS[m[2]], hh = m[3] || '12', mm = m[4] || '00';
        const y = ['Oct','Nov','Dec'].includes(m[2]) ? '2025' : '2026';
        return `${y}${mon}${d}${hh}${mm}00`;
      }
      m = name.match(/^(\d{3})_Copy_of_/);
      return `20250801000000_${m ? m[1] : '999'}`;
    }

    const allPhotos = [];
    DATA.slides.forEach(s=>s.photos.forEach(p=>allPhotos.push(p)));
    allPhotos.sort((a, b) => photoKey(a.name).localeCompare(photoKey(b.name)));
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

    /* Lightbox + navigasi prev/next */
    const lb = document.getElementById('lightbox');
    const lbImg = document.getElementById('lb-img');
    let lbIndex = 0;
    function showLB(i){
      lbIndex = (i + all.length) % all.length;
      lbImg.src = all[lbIndex];
      lb.classList.add('show');
    }
    document.getElementById('lb-close').addEventListener('click', ()=>{ lb.classList.remove('show'); });
    document.getElementById('lb-prev').addEventListener('click', e=>{ e.stopPropagation(); showLB(lbIndex - 1); });
    document.getElementById('lb-next').addEventListener('click', e=>{ e.stopPropagation(); showLB(lbIndex + 1); });
    lb.addEventListener('click', e=>{ if(e.target===lb) lb.classList.remove('show'); });
    window.openLB = function(src){
      const idx = all.indexOf(src);
      showLB(idx >= 0 ? idx : 0);
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
        showLB(lbIndex + (dx < 0 ? 1 : -1));
        swiped = true;
      }
    }, {passive:true});
    /* Panah keyboard */
    document.addEventListener('keydown', e=>{
      if(!lb.classList.contains('show')) return;
      if(e.key === 'ArrowRight') showLB(lbIndex + 1);
      if(e.key === 'ArrowLeft')  showLB(lbIndex - 1);
      if(e.key === 'Escape')     lb.classList.remove('show');
    });
  }catch(err){ console.error('galeri:', err); }
})();

/* ===== 7. STATS COUNTER DENGAN ANIMASI COUNT-UP ===== */
(function(){
  try{
    const sec = document.getElementById('stats-section');
    if(!sec) return;
    const photoCount = window.AIV_DATA?.total || 157;
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
    const colors = ['#FF9EC4','#FFD6E8','#E85A8A','#E8365D','#FFF0F6','#FFD54F'];
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

window.openGift = function(){
  const gb = document.getElementById('gift-box');
  if(gb) gb.classList.add('opened');
  window.launchConfetti();
  const rb = document.getElementById('surprise-reveal');
  if(rb) rb.classList.add('show');
};

window.toggleEnvelope = function(idx){
  const envs = document.querySelectorAll('.envelope');
  if(envs[idx]){
    envs[idx].classList.toggle('open');
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
    synthStart();
  }
}
window.toggleMusic = toggleMusic;
const musicBtn = document.getElementById('music-toggle');
if(musicBtn) musicBtn.addEventListener('click', ()=>toggleMusic().catch(()=>{}));

let synthCtx = null, synthTimer = null, synthGain = null;
function synthStart(){
  try{
    if(synthCtx) { synthCtx.resume(); scheduleLoop(); return; }
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
  if(synthCtx) synthCtx.suspend();
}

/* ===== 11. FLOATING PETALS (sakura) + HATI ===== */
(function(){
  try{
    const bg = document.getElementById('hearts-bg');
    const svgHeart = '<svg viewBox="0 0 24 24"><path d="M12 21C5.5 16.5 2.8 12.6 2.8 8.6 2.8 5.4 5.1 3.4 7.8 3.6c2 .1 3.6 1.2 4.2 2.8.6-1.6 2.2-2.7 4.2-2.8 2.7-.2 5 1.8 5 5 0 4-2.7 7.9-9.2 12.4z" fill="{c}"/></svg>';
    const colors = ['#FF9EC4','#FFC8DC','#E85A8A','#FFD6E8'];
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
      const variants = ['blossom-a.png', 'blossom-b.png', 'pinkblossom2.png'];
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
      });
    };
    document.querySelectorAll('#page-nav button').forEach(b=>{
      b.addEventListener('click', ()=>gotoPage(b.getAttribute('data-page')));
    });
  }catch(err){ console.error('transition:', err); }
})();
