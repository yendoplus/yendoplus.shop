const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS10PBfQSSGt0J_UBzOrnICPcVjKV1smtbm36aBdPuokZaaiJgdScdwOWig8PqIDJyBTIX2fk4q4QzU/pub?gid=0&single=true&output=csv";

function parseCSV(text){
  const rows=[]; let row=[]; let field=''; let inQuotes=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(inQuotes){
      if(c=='"'){ if(text[i+1]=='"'){field+='"';i++;} else inQuotes=false; }
      else field+=c;
    } else {
      if(c=='"') inQuotes=true;
      else if(c==','){ row.push(field); field=''; }
      else if(c=='\n'){ row.push(field); rows.push(row); row=[]; field=''; }
      else if(c=='\r'){ /* skip */ }
      else field+=c;
    }
  }
  if(field.length||row.length){ row.push(field); rows.push(row); }
  return rows.filter(r=>r.length>1);
}

function toObjects(rows){
  const headers=rows[0].map(h=>h.trim());
  return rows.slice(1).map(r=>{
    const o={};
    headers.forEach((h,i)=>o[h]=(r[i]||'').trim());
    return o;
  });
}

function loadProducts(callback){
  fetch(CSV_URL)
    .then(r=>r.text())
    .then(text=>{
      const rows = parseCSV(text);
      const products = toObjects(rows).filter(p=>p.name);
      callback(products, null);
    })
    .catch(err=>callback([], err));
}

/* El stock real es el numero de la columna "stock" del Excel.
   0 o vacio = agotado. Cualquier numero mayor a 0 = esa es la cantidad maxima comprable. */
function getStockNum(p){
  const n = parseInt(p.stock);
  return isNaN(n) ? 0 : n;
}

function isInStock(p){
  return getStockNum(p) > 0;
}

function productCardHTML(p){
  const stockNum = getStockNum(p);
  const inStock = stockNum > 0;
  return `<div class="prod-card">
    <div class="prod-img ${inStock?'':'out-of-stock'}">
      <span class="stock-badge ${inStock?'in':'out'}">${inStock?'En stock':'Agotado'}</span>
      <img src="${p.id}.jpg" alt="${p.name}" loading="lazy" class="zoomable" onerror="if(this.src!=='${p.img}'){this.src='${p.img}';}else{this.style.display='none';}">
    </div>
    <div class="prod-body">
      <span class="prod-cat">${p.category||''}</span>
      <div class="prod-name">${p.name}</div>
      <div class="prod-footer">
        <div class="price"><span class="yn">S/</span>${(parseFloat(p.price)||0).toFixed(2)}</div>
        <a class="prod-link" href="${p.url}" target="_blank">Ver ficha →</a>
      </div>
      ${inStock
        ? `<button class="add-cart-btn" data-id="${p.id}">Agregar al carro</button>`
        : `<button class="add-cart-btn" disabled>Agotado</button>`}
    </div>
  </div>`;
}

function attachProductGridHandlers(container, products){
  container.addEventListener('click', (e)=>{
    const btn = e.target.closest('.add-cart-btn');
    if(btn && !btn.disabled){
      const p = products.find(x => x.id === btn.dataset.id);
      if(p){
        addToCart({ id:p.id, name:p.name, price:p.price, img:`${p.id}.jpg`, stock: getStockNum(p) });
        const original = btn.textContent;
        btn.textContent = 'Agregado al carrito de compras';
        setTimeout(()=>{ btn.textContent = original; }, 1200);
      }
      return;
    }
    const img = e.target.closest('.zoomable');
    if(img && typeof openImgModal === 'function'){
      openImgModal(img.src, img.alt);
    }
  });
}

function openImgModal(src, alt){
  const pic = document.getElementById('imgModalPic');
  const modal = document.getElementById('imgModal');
  if(!pic || !modal) return;
  pic.src = src;
  pic.alt = alt || '';
  modal.classList.add('open');
}

function closeImgModal(){
  const modal = document.getElementById('imgModal');
  if(modal) modal.classList.remove('open');
}

document.addEventListener('DOMContentLoaded', ()=>{
  const closeBtn = document.getElementById('imgModalClose');
  const modal = document.getElementById('imgModal');
  if(closeBtn) closeBtn.addEventListener('click', closeImgModal);
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target.id === 'imgModal') closeImgModal();
    });
  }
  document.addEventListener('keydown', (e)=>{
    if(e.key === 'Escape') closeImgModal();
  });

  const backToTop = document.getElementById('backToTop');
  if(backToTop){
    window.addEventListener('scroll', ()=>{
      backToTop.classList.toggle('show', window.scrollY > 400);
    });
    backToTop.addEventListener('click', ()=>{
      window.scrollTo({top:0, behavior:'smooth'});
    });
  }
});
