document.addEventListener('DOMContentLoaded',()=>{
  const html=document.documentElement;
  /* Theme toggle */
  let theme=window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light';
  html.setAttribute('data-theme',theme);
  const tb=document.getElementById('theme-toggle');
  const sunSVG='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
  const moonSVG='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>';
  function updateIcon(){tb.innerHTML=theme==='dark'?sunSVG:moonSVG}
  updateIcon();
  tb.addEventListener('click',()=>{theme=theme==='dark'?'light':'dark';html.setAttribute('data-theme',theme);updateIcon()});

  /* Mobile nav */
  const overlay=document.getElementById('mobile-nav');
  document.getElementById('burger')?.addEventListener('click',()=>overlay.classList.add('open'));
  document.getElementById('close-nav')?.addEventListener('click',()=>overlay.classList.remove('open'));
  overlay?.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>overlay.classList.remove('open')));

  /* Stat counter */
  const cObs=new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(!e.isIntersecting)return;
      const el=e.target,end=parseFloat(el.dataset.count),suf=el.dataset.suffix||'',dec=el.dataset.count.includes('.');
      const t0=performance.now();
      (function tick(now){
        const p=Math.min((now-t0)/1600,1),v=1-Math.pow(1-p,3);
        el.textContent=(dec?(v*end).toFixed(1):Math.floor(v*end))+suf;
        if(p<1)requestAnimationFrame(tick);
      })(t0);
      cObs.unobserve(el);
    });
  },{threshold:.4});
  document.querySelectorAll('[data-count]').forEach(c=>cObs.observe(c));

  /* Reveal fallback for browsers without animation-timeline */
  if(!CSS.supports||!CSS.supports('animation-timeline','view()')){
    const rObs=new IntersectionObserver(entries=>{
      entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';rObs.unobserve(e.target)}});
    },{threshold:.08});
    document.querySelectorAll('.reveal').forEach(el=>rObs.observe(el));
  }

  /* Contact form — Web3Forms */
  document.getElementById('contact-form')?.addEventListener('submit',async e=>{
    e.preventDefault();
    const form=e.target,btn=form.querySelector('.btn-fill');
    btn.textContent='Sending...';btn.disabled=true;
    try{
      const res=await fetch('https://api.web3forms.com/submit',{
        method:'POST',body:new FormData(form)
      });
      const data=await res.json();
      if(data.success){
        btn.textContent='Sent! ✓';btn.style.background='var(--green)';
        form.reset();
      }else{
        btn.textContent='Error — Try Again';btn.style.background='#ef4444';
      }
    }catch{
      btn.textContent='Error — Try Again';btn.style.background='#ef4444';
    }
    setTimeout(()=>{btn.textContent='Send Message';btn.style.background='';btn.disabled=false},3000);
  });

  /* ─── NETWORK DOTS BACKGROUND ─── */
  const cvs=document.getElementById('net-bg');
  if(cvs){
    const ctx=cvs.getContext('2d');
    let w,h,dots=[];
    const COUNT=60,SPEED=.3,LINK=120;

    function resize(){
      w=cvs.width=window.innerWidth;
      h=cvs.height=window.innerHeight;
    }
    function init(){
      resize();
      dots=[];
      for(let i=0;i<COUNT;i++){
        dots.push({
          x:Math.random()*w,y:Math.random()*h,
          vx:(Math.random()-.5)*SPEED,vy:(Math.random()-.5)*SPEED,
          r:Math.random()*1.5+1
        });
      }
    }
    function getColor(){
      const s=getComputedStyle(document.documentElement);
      return s.getPropertyValue('--accent').trim()||'#0A84FF';
    }
    function draw(){
      ctx.clearRect(0,0,w,h);
      const c=getColor();
      for(let i=0;i<dots.length;i++){
        const d=dots[i];
        d.x+=d.vx;d.y+=d.vy;
        if(d.x<0||d.x>w)d.vx*=-1;
        if(d.y<0||d.y>h)d.vy*=-1;
        // dot
        ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
        ctx.fillStyle=c;ctx.globalAlpha=.6;ctx.fill();
        // lines
        for(let j=i+1;j<dots.length;j++){
          const d2=dots[j],dx=d.x-d2.x,dy=d.y-d2.y,dist=Math.sqrt(dx*dx+dy*dy);
          if(dist<LINK){
            ctx.beginPath();ctx.moveTo(d.x,d.y);ctx.lineTo(d2.x,d2.y);
            ctx.strokeStyle=c;ctx.globalAlpha=.15*(1-dist/LINK);
            ctx.lineWidth=.6;ctx.stroke();
          }
        }
      }
      ctx.globalAlpha=1;
      requestAnimationFrame(draw);
    }
    init();draw();
    window.addEventListener('resize',()=>{resize()});
  }
});
