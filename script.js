(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];
  const toast = (message) => {
    const el = $("#toast"); if (!el) return;
    el.textContent = message; el.classList.add("show");
    clearTimeout(window.__velyraToast); window.__velyraToast = setTimeout(()=>el.classList.remove("show"),2400);
  };

  // Mobile navigation
  const menuToggle = $("#menuToggle"), mainNav = $("#mainNav");
  menuToggle?.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.textContent = open ? "×" : "☰";
  });
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("open"); menuToggle?.setAttribute("aria-expanded","false");
    if(menuToggle) menuToggle.textContent = "☰";
  }));

  // Sonidos opcionales y distintos según la interacción (se activan solo si la persona lo desea)
  let soundOn = false, audioContext;
  const soundToggle = $("#soundToggle");
  function playSound(kind="tap"){
    if(!soundOn) return;
    try{
      audioContext ||= new (window.AudioContext || window.webkitAudioContext)();
      if(audioContext.state === "suspended") audioContext.resume();
      const now=audioContext.currentTime;
      const presets={
        tap:[740,988], nav:[523,659], filter:[587,784], add:[659,880,1175],
        app:[784,988,1318], chat:[440,587,740], send:[659,784],
        modal:[523,784,1047], toggle:[784,1175]
      };
      const notes=presets[kind]||presets.tap;
      notes.forEach((hz,i)=>{
        const osc=audioContext.createOscillator(),gain=audioContext.createGain();
        const start=now+i*(kind==="add"?0.055:0.075),duration=kind==="add"?0.18:0.15;
        osc.type=(kind==="add"||kind==="modal")?"sine":"triangle";
        osc.frequency.setValueAtTime(hz,start);
        osc.frequency.exponentialRampToValueAtTime(hz*1.13,start+duration*.65);
        gain.gain.setValueAtTime(.0001,start);
        gain.gain.exponentialRampToValueAtTime(kind==="add"?.035:.022,start+.018);
        gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
        osc.connect(gain);gain.connect(audioContext.destination);osc.start(start);osc.stop(start+duration+.02);
      });
    }catch(e){}
  }
  soundToggle?.addEventListener("click",()=>{
    soundOn=!soundOn;
    soundToggle.textContent=soundOn?"♫ On":"♫";
    soundToggle.setAttribute("aria-label",soundOn?"Silenciar sonidos":"Activar sonidos");
    toast(soundOn?"Sonidos activados · ¡prueba los botones!":"Sonidos silenciados");
    if(soundOn) playSound("toggle");
  });

  // Destellos y pequeñas burbujas donde se toca o hace clic
  const sparkleLayer=$("#sparkleLayer");
  function makeSpark(x,y){
    if(!sparkleLayer)return;
    const symbols=["✦","✧","✶","·"];
    for(let i=0;i<3;i++){
      const el=document.createElement("span");
      el.className=i===2?"tap-bubble":"tap-spark";
      if(i!==2)el.textContent=symbols[Math.floor(Math.random()*symbols.length)];
      el.style.setProperty("--x",`${x+(Math.random()*34-17)}px`);
      el.style.setProperty("--y",`${y+(Math.random()*28-14)}px`);
      el.style.setProperty("--size",`${14+Math.random()*15}px`);
      el.style.setProperty("--spark",["#f7c8d3","#fff7e6","#d8c9ef","#a8b58a"][Math.floor(Math.random()*4)]);
      sparkleLayer.appendChild(el);el.addEventListener("animationend",()=>el.remove(),{once:true});
    }
  }
  document.addEventListener("click",e=>{
    const target=e.target.closest("a,button,.product-photo,.phone-feature,.phone-shortcuts span");
    if(!target)return;
    makeSpark(e.clientX,e.clientY);
    if(target===soundToggle)return;
    let kind="tap";
    if(target.closest("#mainNav,.footer-links"))kind="nav";
    else if(target.closest(".filter"))kind="filter";
    else if(target.closest(".quick-add"))kind="add";
    else if(target.closest(".app-tab"))kind="app";
    else if(target.closest("#chatForm,.quick-prompts"))kind="chat";
    else if(target.closest("#appDownload,.modal"))kind="modal";
    else if(target.closest("#contactForm"))kind="send";
    playSound(kind);
  },true);

  const modal=$("#modalBackdrop"), closeModal=()=>modal?.classList.remove("open");
  function showModal(title,text){$("#modalTitle").textContent=title;$("#modalText").textContent=text;modal?.classList.add("open");}

  // Catálogo: filtros, búsqueda, orden, favoritos y bolsa persistente (demo local)
  const readStore = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } };
  let bag = readStore("velyraBag", []);
  let favorites = readStore("velyraFavorites", []);
  const bagCount = bag.reduce((sum, item) => sum + item.qty, 0);
  $("#bagCount").textContent = bagCount;
  $$(".favorite-toggle").forEach(btn => {
    const card = btn.closest(".product-card");
    const name = card.dataset.name;
    const active = favorites.includes(name);
    btn.classList.toggle("is-favorite", active);
    btn.setAttribute("aria-pressed", String(active));
    btn.textContent = active ? "♥" : "♡";
  });
  function addToBag(card) {
    const name = card.dataset.name;
    const existing = bag.find(item => item.name === name);
    if (existing) existing.qty += 1; else bag.push({name, price:Number(card.dataset.price), qty:1});
    localStorage.setItem("velyraBag", JSON.stringify(bag));
    $("#bagCount").textContent = bag.reduce((sum,item)=>sum+item.qty,0);
    toast(name + " añadido a tu bolsa");
  }
  $$(".quick-add").forEach(btn=>btn.addEventListener("click",e=>{e.stopPropagation();addToBag(btn.closest(".product-card"));}));
  $$(".favorite-toggle").forEach(btn=>btn.addEventListener("click",e=>{
    e.stopPropagation(); const name=btn.closest(".product-card").dataset.name;
    favorites = favorites.includes(name) ? favorites.filter(x=>x!==name) : [...favorites,name];
    localStorage.setItem("velyraFavorites",JSON.stringify(favorites));
    const active=favorites.includes(name);btn.classList.toggle("is-favorite",active);btn.setAttribute("aria-pressed",String(active));btn.textContent=active?"♥":"♡";
    toast(active?name+" guardado en favoritos":"Pieza retirada de favoritos");
  }));
  function refreshCatalog(){
    const activeFilter=$(".filter.active")?.dataset.filter||"todos";
    const term=( $("#catalogSearch")?.value || "").trim().toLocaleLowerCase("es-CO");
    const cards=$$(".product-card");
    const sort=$("#catalogSort")?.value||"featured";
    const grid=$("#productGrid");
    const ordered=[...cards].sort((a,b)=>{
      if(sort==="low")return Number(a.dataset.price)-Number(b.dataset.price);
      if(sort==="high")return Number(b.dataset.price)-Number(a.dataset.price);
      if(sort==="az")return a.dataset.name.localeCompare(b.dataset.name,"es");
      return Number(a.dataset.order||0)-Number(b.dataset.order||0);
    });
    ordered.forEach(card=>grid.appendChild(card));
    let shown=0;
    cards.forEach(card=>{const matchesFilter=activeFilter==="todos"||card.dataset.category===activeFilter;const matchesText=(card.dataset.name+" "+card.textContent).toLocaleLowerCase("es-CO").includes(term);const visible=matchesFilter&&matchesText;card.hidden=!visible;if(visible)shown++;});
    $("#catalogCount").textContent=String(shown).padStart(2,"0")+" PIEZAS";
    $("#catalogEmpty").hidden=shown!==0;
  }
  $$(".product-card").forEach((card,i)=>card.dataset.order=String(i));
  $$(".filter").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".filter").forEach(b=>b.classList.remove("active"));btn.classList.add("active");refreshCatalog();
  }));
  $("#catalogSearch")?.addEventListener("input",refreshCatalog);
  $("#catalogSort")?.addEventListener("change",refreshCatalog);
  $("#bagButton")?.addEventListener("click",()=>{
    const total=bag.reduce((sum,item)=>sum+item.price*item.qty,0);
    const details=bag.length?bag.map(item=>`${item.name} × ${item.qty} — $${(item.price*item.qty).toLocaleString("es-CO")}`).join("\n")+`\n\nTotal de referencia: $${total.toLocaleString("es-CO")} COP\n\nEsta bolsa es demostrativa: no procesa pedidos ni pagos.`:"Tu bolsa está esperando una pieza especial. Explora el catálogo y añade tus favoritas. ♡";
    showModal("Tu bolsa VELYRA",details);
  });

  // Vista rápida: tocar la fotografía de cada pieza abre su ficha
  $$(".product-photo").forEach(photo=>photo.addEventListener("click",e=>{
    if(e.target.closest(".quick-add"))return;
    const card=photo.closest(".product-card"),title=card.dataset.name;
    const description=card.querySelector(".product-info p")?.textContent||"Pieza de la selección VELYRA";
    const price=card.querySelector(".product-info strong")?.textContent||"";
    showModal(title,`${description}. Precio de referencia: ${price}. Esta ficha forma parte del catálogo demostrativo de VELYRA.`);
  }));

  // App preview screens
  const appScreens = {
    inicio:{title:"Tu espacio creativo",text:"Encuentra inspiración y guarda ideas para construir looks que se sientan tuyos.",greeting:"Hola, creativa.",feature:"Soft<br>midnight",tag:"✧ TU MOOD DE HOY"},
    looks:{title:"Looks que hablan de ti",text:"Explora combinaciones para distintas ocasiones y crea tu propio tablero de inspiración.",greeting:"Hoy puedes probar…",feature:"City<br>romance",tag:"◈ INSPIRACIÓN DE LOOK"},
    beauty:{title:"Beauty a tu manera",text:"Aprende técnicas, explora referencias y encuentra ideas de maquillaje según el estilo que quieras expresar.",greeting:"Un toque de color.",feature:"Rosy<br>glow",tag:"✧ BEAUTY MOOD"},
    ideas:{title:"Crea y comparte",text:"Organiza ideas para fotos, videos y contenido que refleje tu personalidad.",greeting:"Tu próxima idea.",feature:"Dream<br>in frames",tag:"♡ CREATIVE CORNER"}
  };
  $$(".app-tab").forEach(btn=>btn.addEventListener("click",()=>{
    $$(".app-tab").forEach(b=>b.classList.remove("active"));btn.classList.add("active");
    const s=appScreens[btn.dataset.screen];$("#appScreenTitle").textContent=s.title;$("#appScreenText").textContent=s.text;
    $("#phoneGreeting").textContent=s.greeting;$("#phoneFeature").querySelector("b").innerHTML=s.feature;$("#phoneFeature").querySelector("span").textContent=s.tag;
  }));

  // Modal
  $("#appDownload")?.addEventListener("click",()=>showModal("VELYRA está tomando forma","La app móvil todavía no está publicada. Por ahora puedes explorar esta demostración interactiva de sus pantallas y funciones."));
  $("#modalClose")?.addEventListener("click",closeModal);$("#modalOk")?.addEventListener("click",closeModal);
  modal?.addEventListener("click",e=>{if(e.target===modal)closeModal();});
  document.addEventListener("keydown",e=>{if(e.key==="Escape")closeModal();});

  // Friendly rule-based assistant demo
  const chatMessages=$("#chatMessages"), chatForm=$("#chatForm"), chatInput=$("#chatInput");
  function addMessage(text,who){const div=document.createElement("div");div.className="chat-bubble "+who;div.textContent=text;chatMessages.appendChild(div);chatMessages.scrollTop=chatMessages.scrollHeight;}
  function replyTo(message){
    const m=message.toLowerCase();
    if(/look|ropa|outfit|vest|combina/.test(m))return "¡Vamos a crear algo lindo! ✨ Para un look casual prueba una blusa básica, un jean recto y accesorios plateados. Si quieres algo más elegante, suma una pieza protagonista y mantén el resto sencillo. ¿Para qué ocasión lo necesitas?";
    if(/maquill|beauty|piel/.test(m))return "Podemos empezar por el mood que quieres: natural, luminoso, romántico o más dramático. En VELYRA la idea es explorar referencias y aprender a adaptar las tendencias a tus gustos, sin reglas rígidas. ✨";
    if(/contenido|foto|video|redes|crear/.test(m))return "¡Idea creativa! Elige una paleta de 2 o 3 colores, define una inspiración y crea una mini secuencia: detalle del outfit, accesorio protagonista y resultado final. Así tu contenido se ve coherente sin perder naturalidad.";
    if(/velyra|página|pagina|funciona|app|navegar/.test(m))return "VELYRA reúne moda, belleza, inspiración y creación de contenido. En esta página puedes explorar el catálogo, probar las pantallas de la app y conocer la idea de nuestro espacio físico creativo. La app aún es un concepto y esta asistente es una demostración. 🐰";
    if(/presupuesto|precio|cuesta|valor|dinero/.test(m))return "En el catálogo encontrarás precios de referencia en pesos colombianos. Son valores ilustrativos para el proyecto académico, no cotizaciones ni inventario confirmado. 🌷";
    if(/contacto|correo|mensaje/.test(m))return "Puedes escribirnos desde el formulario de contacto al final de la página o enviar un correo a sofimayita9@gmail.com. ✉️";
    if(/hola|buenas|hey/.test(m))return "¡Holiii! 🐰💜 Qué gusto tenerte por aquí. ¿Hoy vienes por inspiración de moda, beauty o ideas para crear contenido?";
    return "Te leo. 🌷 Cuéntame un poquito más: ¿buscas inspiración de moda, ideas de maquillaje, ayuda para crear contenido o información sobre el proyecto VELYRA?";
  }
  async function sendChat(text){
    const value=text.trim();if(!value)return;addMessage(value,"user");chatInput.value="";
    try{const response=await fetch("/api/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({message:value})});if(!response.ok)throw new Error("API no disponible");const data=await response.json();addMessage(data.reply||replyTo(value),"bot");}
    catch{window.setTimeout(()=>addMessage(replyTo(value),"bot"),350);}
  }
  chatForm?.addEventListener("submit",e=>{e.preventDefault();sendChat(chatInput.value);});
  $$(".quick-prompts button").forEach(b=>b.addEventListener("click",()=>sendChat(b.dataset.prompt)));

  // Contacto: usa el backend Node cuando está disponible; en Pages conserva una demo local.
  $("#contactForm")?.addEventListener("submit",async e=>{
    e.preventDefault();const form=e.currentTarget;const data=Object.fromEntries(new FormData(form).entries());
    const feedback=$("#contactFeedback");const submit=form.querySelector('button[type="submit"]');
    submit.disabled=true;feedback.textContent="Enviando tu mensaje…";
    try{
      const response=await fetch("/api/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
      if(!response.ok)throw new Error("Backend no disponible");
      const result=await response.json();feedback.textContent=result.message||"¡Gracias! Recibimos tu mensaje.";
    }catch{
      const messages=readStore("velyraMessages",[]);messages.push({...data,date:new Date().toISOString()});
      localStorage.setItem("velyraMessages",JSON.stringify(messages));
      feedback.textContent="¡Gracias! Tu mensaje quedó guardado en este navegador (modo demostración).";
    }
    form.reset();submit.disabled=false;
  });

  // Reveal elements on scroll
  if("IntersectionObserver" in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}}),{threshold:.12});
    $$(".product-card,.values-row,.experience-grid,.section-heading,.app-showcase,.chat-shell,.contact-form,.catalog-note").forEach(el=>{el.classList.add("observe");observer.observe(el);});
  }
})();