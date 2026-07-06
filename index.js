// ===== LAUNDRY POS - MAIN APPLICATION LOGIC =====
// Direkonstruksi dari versi single-file index.html (setelah pemisahan
// file sebelumnya error karena style.js pakai sintaks ES module).
// Fitur upload logo toko untuk struk ditambahkan di sini (uploadLogo/
// displayLogo/clearLogo) dan dipakai juga oleh cetakNotaDigital &
// cetakLabelThermal sebagai pengganti logo default jika toko sudah upload logo sendiri.

// ===== DEFAULT SERVICES =====
const defaultServices = [
  {id:1,name:'Cuci Reguler',cat:'Cuci',icon:'👕',price:7000,unit:'per kg',perKg:true},
  {id:2,name:'Cuci Express',cat:'Cuci',icon:'⚡',price:12000,unit:'per kg',perKg:true},
  {id:3,name:'Cuci + Setrika',cat:'Cuci',icon:'🧺',price:10000,unit:'per kg',perKg:true},
  {id:4,name:'Cuci Sepatu',cat:'Cuci',icon:'👟',price:30000,unit:'per pasang',perKg:false},
  {id:5,name:'Cuci Tas',cat:'Cuci',icon:'👜',price:35000,unit:'per item',perKg:false},
  {id:6,name:'Setrika Reguler',cat:'Setrika',icon:'🔥',price:5000,unit:'per kg',perKg:true},
  {id:7,name:'Setrika Express',cat:'Setrika',icon:'💨',price:8000,unit:'per kg',perKg:true},
  {id:8,name:'Setrika Saja',cat:'Setrika',icon:'👔',price:4000,unit:'per item',perKg:false},
  {id:9,name:'Dry Clean Jas',cat:'Dry Clean',icon:'🥼',price:60000,unit:'per item',perKg:false},
  {id:10,name:'Dry Clean Dress',cat:'Dry Clean',icon:'👗',price:55000,unit:'per item',perKg:false},
  {id:11,name:'Dry Clean Selimut',cat:'Dry Clean',icon:'🛏️',price:45000,unit:'per item',perKg:false},
  {id:12,name:'Karpet Kecil',cat:'Karpet',icon:'🪮',price:40000,unit:'per item',perKg:false},
  {id:13,name:'Karpet Besar',cat:'Karpet',icon:'🪟',price:80000,unit:'per item',perKg:false},
  {id:14,name:'Parfum Laundry',cat:'Tambahan',icon:'✨',price:5000,unit:'per sachet',perKg:false},
  {id:15,name:'Pelembut Ekstra',cat:'Tambahan',icon:'💧',price:3000,unit:'per sachet',perKg:false},
  {id:16,name:'Antar Jemput',cat:'Tambahan',icon:'🛵',price:15000,unit:'per trip',perKg:false},
];

// ===== STATE =====
let products = JSON.parse(localStorage.getItem('lpos_services') || 'null') || defaultServices;
let tokoConfig = JSON.parse(localStorage.getItem('lpos_toko') || '{"nama":"LaundryPOS","tagline":"kasir digital","rekening":"BCA 1234567890 a/n Laundry Kami","logo":null}');
let aiConfig = JSON.parse(localStorage.getItem('lpos_ai') || '{"url":"https://ai.sumopod.com","key":"","model":"gpt-4.1-nano"}');
let categories = [];
let activeCategory = 'Semua';
let cart = [];
let transactions = JSON.parse(localStorage.getItem('lpos_tx') || '[]');
let pendings = JSON.parse(localStorage.getItem('lpos_pending') || '[]');
let activeFilter = 'hari';
let activePayMethod = 'tunai';
let activeLapTab = 'transaksi';
let scanningForCartId = null;
let bannerDismissed = false;

// ===== UTILS =====
const fmt = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');
const fmtShort = n => n>=1000000?(n/1000000).toFixed(1)+'jt':n>=1000?(n/1000).toFixed(0)+'rb':String(Math.round(n));
const saveTx = () => localStorage.setItem('lpos_tx', JSON.stringify(transactions));
const savePending = () => localStorage.setItem('lpos_pending', JSON.stringify(pendings));
const fmtDate = iso => new Date(iso).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'});

function getEstimasi(items) {
  const cats = items.map(i=>i.cat);
  if(cats.includes('Dry Clean')) return 3;
  if(cats.includes('Karpet')) return 2;
  return 1;
}
function getCountdown(estIso) {
  const now=new Date();now.setHours(0,0,0,0);
  const est=new Date(estIso+'T00:00:00');est.setHours(0,0,0,0);
  const diff=Math.round((est-now)/86400000);
  if(diff<0) return{text:`Terlambat ${Math.abs(diff)} hari`,cls:'overdue'};
  if(diff===0) return{text:'Selesai hari ini!',cls:'today'};
  if(diff===1) return{text:'Besok',cls:''};
  return{text:`${diff} hari lagi`,cls:''};
}

// ===== CLOCK =====
setInterval(()=>{
  const n=new Date();
  document.getElementById('clock').textContent=n.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
},1000);

// ===== TOKO CONFIG =====
function applyTokoConfig() {
  document.title = tokoConfig.nama || 'LaundryPOS';
  document.getElementById('logoText').innerHTML = `${tokoConfig.nama||'LaundryPOS'} <span>${tokoConfig.tagline||'kasir digital'}</span>`;
}

// ===== BANNER (notifikasi jatuh tempo) =====
function checkBanner() {
  if(bannerDismissed) return;
  const now = new Date(); now.setHours(0,0,0,0);
  const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate()+1);
  const active = pendings.filter(p=>!p.done);
  const overdue = active.filter(p=>new Date(p.tglEst+'T00:00:00')<now);
  const dueToday = active.filter(p=>{const d=new Date(p.tglEst+'T00:00:00');return d.getTime()===now.getTime();});
  const dueTomorrow = active.filter(p=>{const d=new Date(p.tglEst+'T00:00:00');return d.getTime()===tomorrow.getTime();});
  const wrap=document.getElementById('bannerWrap');
  const el=document.getElementById('bannerEl');
  const txt=document.getElementById('bannerText');
  if(overdue.length>0){
    wrap.style.display='block';
    el.className='banner danger';
    txt.textContent=`🚨 ${overdue.length} order TERLAMBAT! Segera hubungi pelanggan.`;
  } else if(dueToday.length>0){
    wrap.style.display='block';
    el.className='banner warn';
    txt.textContent=`⏰ ${dueToday.length} order harus selesai HARI INI: ${dueToday.map(p=>p.customer).join(', ')}`;
  } else if(dueTomorrow.length>0){
    wrap.style.display='block';
    el.className='banner warn';
    txt.textContent=`📅 ${dueTomorrow.length} order perlu selesai besok: ${dueTomorrow.map(p=>p.customer).join(', ')}`;
  } else {
    wrap.style.display='none';
  }
}
function closeBanner(){bannerDismissed=true;document.getElementById('bannerWrap').style.display='none';}

// ===== PAGE NAV =====
function showPage(p) {
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');

  // Update active tab
  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(`'${p}'`)) {
      t.classList.add('active');
    }
  });

  // Kalau kasir buka laporan tapi role KASIR → langsung ke tab pending
  if (p === 'laporan') {
    if (currentUser && currentUser.role === 'KASIR') {
      setLapTab('pending', document.querySelector('.lap-tab'));
    } else {
      renderLaporan();
    }
  }
  if (p === 'pengaturan') renderPengaturan();
  if (p === 'kasir') checkBanner();
  if (p === 'kurir') renderKurir();
}

// ===== CATEGORIES =====
function buildCategories(){
  categories=['Semua',...new Set(products.map(p=>p.cat))];
}
function renderCategories(){
  document.getElementById('catFilter').innerHTML=categories.map(c=>
    `<button class="cat-btn ${c===activeCategory?'active':''}" onclick="setCategory('${c}')">${c}</button>`
  ).join('');
}
function setCategory(c){activeCategory=c;renderCategories();renderProducts();}

// ===== PRODUCTS =====
function renderProducts(){
  const q=document.getElementById('searchInput').value.toLowerCase();
  const filtered=products.filter(p=>
    (activeCategory==='Semua'||p.cat===activeCategory)&&
    (p.name.toLowerCase().includes(q)||p.cat.toLowerCase().includes(q))
  );
  const el=document.getElementById('productGrid');
  if(!filtered.length){el.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:28px;color:var(--text3);font-size:.83rem">Tidak ditemukan</div>';return;}
  el.innerHTML=filtered.map(p=>{
    const inCart=cart.find(c=>c.id===p.id);
    return `<div class="product-card ${inCart?'in-cart':''}" onclick="addToCart(${p.id})">
      ${inCart?`<div class="p-badge">${inCart.qty}</div>`:''}
      <div class="p-icon">${p.icon}</div>
      <div class="p-name">${p.name}</div>
      <div class="p-unit">${p.unit}</div>
      <div class="p-price">${fmt(p.price)}</div>
    </div>`;
  }).join('');
}

// ===== CART =====
function addToCart(id){
  const p=products.find(x=>x.id===id);
  const ex=cart.find(c=>c.id===id);
  if(ex) ex.qty++;
  else cart.push({...p,qty:1,weight:null});
  renderCart();renderProducts();
}
function changeQty(id,d){
  const i=cart.findIndex(c=>c.id===id);
  if(i<0)return;
  cart[i].qty+=d;
  if(cart[i].qty<=0)cart.splice(i,1);
  renderCart();renderProducts();
}
function removeItem(id){cart=cart.filter(c=>c.id!==id);renderCart();renderProducts();}
function clearCart(){
  cart=[];
  document.getElementById('custName').value='';
  document.getElementById('custPhone').value='';
  document.getElementById('discountInput').value='0';
  renderCart();renderProducts();
}

function getSubtotal(){
  return cart.reduce((s,c)=>{
    if(c.perKg&&c.weight) return s+c.price*c.weight;
    return s+c.price*c.qty;
  },0);
}
function getDiscount(){return Math.min(100,Math.max(0,parseFloat(document.getElementById('discountInput')?.value||0)));}
function getTotal(){const s=getSubtotal();return Math.round(s-s*getDiscount()/100);}

function renderCart(){
  const el=document.getElementById('cartItems');
  el.innerHTML=!cart.length
    ?'<div class="cart-empty"><div class="e-icon">🧺</div>Belum ada item.<br>Tap layanan untuk menambah.</div>'
    :cart.map(c=>{
      const showScan = c.perKg && aiConfig.key;
      const weightLabel = c.weight ? `<div class="ci-weight">⚖️ ${c.weight} kg = ${fmt(c.price*c.weight)}</div>` : '';
      return `<div class="cart-item">
        <div class="ci-icon">${c.icon}</div>
        <div class="ci-info">
          <div class="ci-name">${c.name}</div>
          <div class="ci-price">${c.perKg&&c.weight?fmt(c.price*c.weight):fmt(c.price*c.qty)}</div>
          ${weightLabel}
          ${showScan?`<button class="scan-btn" onclick="openScan(${c.id})">📷 Scan Timbangan</button>`:''}
        </div>
        <div class="qty-ctrl">
          <button class="qty-btn" onclick="changeQty(${c.id},-1)">−</button>
          <span class="qty-num">${c.qty}</span>
          <button class="qty-btn" onclick="changeQty(${c.id},1)">+</button>
        </div>
        <button class="ci-del" onclick="removeItem(${c.id})">✕</button>
      </div>`;
    }).join('');
  renderFooter();
}

function renderFooter(){
  document.getElementById('subtotalVal').textContent=fmt(getSubtotal());
  document.getElementById('totalVal').textContent=fmt(getTotal());
  const has=cart.length>0;
  document.getElementById('bayarBtn').disabled=!has;
  document.getElementById('pendingBtn').disabled=!has;
}

// ===== SCAN TIMBANGAN =====
function openScan(cartId){
  scanningForCartId=cartId;
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-title">📷 Scan Timbangan</div>
    <div class="scan-drop" onclick="document.getElementById('fileInput').click()">
      <div class="sd-icon">📸</div>
      <p>Tap untuk ambil foto / upload</p>
      <small>Foto timbangan digital atau analog</small>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Batal</button>
    </div>`;
  document.getElementById('modalOverlay').classList.add('open');
}

function handleFileSelect(e){
  const file=e.target.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=ev=>{
    const b64=ev.target.result.split(',')[1];
    const mtype=file.type||'image/jpeg';
    showScanPreview(ev.target.result,b64,mtype);
  };
  reader.readAsDataURL(file);
  e.target.value='';
}

function showScanPreview(dataUrl,b64,mtype){
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-title">📷 Scan Timbangan</div>
    <img src="${dataUrl}" class="scan-preview" alt="preview">
    <div class="modal-actions">
      <button class="btn-cancel" onclick="openScan(${scanningForCartId})">↩ Ulangi</button>
      <button class="btn-confirm blue" onclick="doScan('${b64}','${mtype}')">🔍 Analisis AI</button>
    </div>`;
}

async function doScan(b64,mtype){
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-title">📷 Menganalisis...</div>
    <div class="scan-loading"><span class="spin">⚙️</span>AI sedang membaca angka timbangan...</div>`;
  try{
    const resp=await fetch(`${aiConfig.url}/v1/chat/completions`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${aiConfig.key}`},
      body:JSON.stringify({
        model:aiConfig.model,
        max_tokens:100,
        messages:[{role:'user',content:[
          {type:'image_url',image_url:{url:`data:${mtype};base64,${b64}`}},
          {type:'text',text:'Lihat gambar timbangan ini. Berapa berat yang tertera? Jawab HANYA angka desimalnya saja dalam kilogram, contoh: 2.3 atau 0.8 atau 1.5. Jangan tulis kata-kata lain.'}
        ]}]
      })
    });
    const data=await resp.json();
    if(!resp.ok) throw new Error(data.error?.message||'API error');
    const raw=data.content?.[0]?.text||data.choices?.[0]?.message?.content||'';
    const match=raw.match(/[\d]+\.?[\d]*/);
    if(!match) throw new Error('Tidak bisa membaca angka dari gambar');
    const weight=parseFloat(match[0]);
    if(isNaN(weight)||weight<=0||weight>100) throw new Error(`Angka tidak valid: ${raw}`);

    const item=cart.find(c=>c.id===scanningForCartId);
    const total=item?fmt(item.price*weight):'';
    document.getElementById('modalContent').innerHTML=`
      <div class="modal-title">✅ Hasil Scan</div>
      <div class="scan-result-box">
        <span class="sr-label">⚖️ Berat Terdeteksi</span>
        <span class="sr-val">${weight} kg</span>
      </div>
      ${item?`<div style="text-align:center;margin-bottom:14px;font-size:.85rem;color:var(--text2)">${item.icon} ${item.name} × ${weight}kg = <strong>${total}</strong></div>`:''}
      <div class="modal-actions">
        <button class="btn-cancel" onclick="openScan(${scanningForCartId})">↩ Ulangi</button>
        <button class="btn-confirm" onclick="applyWeight(${weight})">✓ Gunakan ${weight} kg</button>
      </div>`;
  }catch(err){
    document.getElementById('modalContent').innerHTML=`
      <div class="modal-title">❌ Gagal Membaca</div>
      <div style="text-align:center;padding:16px;color:var(--danger);font-size:.85rem;margin-bottom:14px">
        <div style="font-size:2rem;margin-bottom:8px">😕</div>
        ${err.message}<br><small style="color:var(--text3);margin-top:6px;display:block">Coba foto lebih dekat & pencahayaan lebih terang.</small>
      </div>
      <div class="modal-actions">
        <button class="btn-cancel" onclick="closeModal()">Tutup</button>
        <button class="btn-confirm blue" onclick="openScan(${scanningForCartId})">🔄 Coba Lagi</button>
      </div>`;
  }
}

function applyWeight(w){
  const item=cart.find(c=>c.id===scanningForCartId);
  if(item){item.weight=w;item.qty=1;}
  closeModal();renderCart();
}

// ===== BAYAR/PENDING MODAL =====
function openBayar(){activePayMethod='tunai';renderBayarModal();document.getElementById('modalOverlay').classList.add('open');}
function openPending(){activePayMethod='pending';renderBayarModal();document.getElementById('modalOverlay').classList.add('open');}
function closeModal(){document.getElementById('modalOverlay').classList.remove('open');}
document.getElementById('modalOverlay').addEventListener('click',function(e){if(e.target===this)closeModal();});

function renderBayarModal(){
  const total=getTotal();const isPending=activePayMethod==='pending';
  const defDays=getEstimasi(cart);
  const estDate=new Date();estDate.setDate(estDate.getDate()+defDays);
  const estStr=estDate.toISOString().split('T')[0];
  const todayStr=new Date().toISOString().split('T')[0];
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-title">${isPending?'🕐 Simpan Pending':'💳 Pembayaran'}</div>
    <div class="modal-info">
      <div class="modal-row"><span>Subtotal</span><span class="mval">${fmt(getSubtotal())}</span></div>
      ${getDiscount()>0?`<div class="modal-row"><span>Diskon ${getDiscount()}%</span><span class="mval" style="color:var(--danger)">−${fmt(getSubtotal()*getDiscount()/100)}</span></div>`:''}
      <div class="modal-row big"><span>Total</span><span class="mval">${fmt(total)}</span></div>
    </div>
    <div class="pay-tabs">
      <button class="pay-tab ${activePayMethod==='tunai'?'active':''}" onclick="selMethod('tunai')"><span class="pt-icon">💵</span>Tunai</button>
      <button class="pay-tab ${activePayMethod==='transfer'?'active':''}" onclick="selMethod('transfer')"><span class="pt-icon">🏦</span>Transfer</button>
      <button class="pay-tab ${activePayMethod==='qris'?'active':''}" onclick="selMethod('qris')"><span class="pt-icon">📱</span>QRIS</button>
      <button class="pay-tab blue-tab ${activePayMethod==='pending'?'active':''}" onclick="selMethod('pending')"><span class="pt-icon">🕐</span>Pending</button>
    </div>
    ${activePayMethod==='tunai'?`
      <div class="tunai-section">
        <label>Uang Diterima</label>
        <input type="number" id="cashInput" value="${total}" oninput="updateKembalian()">
      </div>
      <div class="kembalian-box"><span class="lbl">Kembalian</span><span class="val" id="kembalianVal">${fmt(0)}</span></div>`
    :activePayMethod==='pending'?`
      <div class="pending-form">
        <div><span class="pf-label">📅 Tanggal Masuk</span><input type="date" id="tglMasuk" value="${todayStr}"></div>
        <div><span class="pf-label">✅ Estimasi Selesai</span><input type="date" id="tglEst" value="${estStr}"><div class="pf-hint">💡 Default ${defDays} hari</div></div>
        <div><span class="pf-label">📝 Catatan</span><input type="text" id="pendingNote" placeholder="Misal: express, antar rumah..."></div>
      </div>`:`
      <div class="transfer-box">${activePayMethod==='qris'?'📱 Scan QR Code pada mesin kasir':`🏦 ${tokoConfig.rekening||'BCA 1234567890 a/n Laundry Kami'}`}</div>`}
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Batal</button>
      <button class="btn-confirm ${isPending?'blue':''}" onclick="konfirmasi()">${isPending?'🕐 Simpan Pending':'✓ Konfirmasi Bayar'}</button>
    </div>`;
  if(activePayMethod==='tunai')setTimeout(updateKembalian,10);
}
function selMethod(m){activePayMethod=m;renderBayarModal();}
function updateKembalian(){
  const cash=parseFloat(document.getElementById('cashInput')?.value||0);
  document.getElementById('kembalianVal').textContent=fmt(Math.max(0,cash-getTotal()));
}

function konfirmasi(){
  const total=getTotal();
  const custName=document.getElementById('custName').value.trim()||'Umum';
  const custPhone=document.getElementById('custPhone').value.trim()||'-';
  if(activePayMethod==='pending'){
    if(!document.getElementById('custName').value.trim()){alert('Isi nama pelanggan!');return;}
    const tglMasuk=document.getElementById('tglMasuk').value;
    const tglEst=document.getElementById('tglEst').value;
    const note=document.getElementById('pendingNote').value;
    if(!tglMasuk||!tglEst){alert('Isi tanggal masuk & estimasi!');return;}
    if(new Date(tglEst)<new Date(tglMasuk)){alert('Estimasi tidak boleh sebelum tanggal masuk!');return;}
    const p={id:Date.now(),createdAt:new Date().toISOString(),tglMasuk,tglEst,customer:custName,phone:custPhone,items:[...cart],subtotal:getSubtotal(),discount:getDiscount(),total,note,done:false};
    pendings.unshift(p);savePending();updatePendingBadge();bannerDismissed=false;checkBanner();
    document.getElementById('modalContent').innerHTML=`
      <div class="success-modal">
        <div class="success-icon">🕐</div>
        <h2 style="color:var(--blue)">Order Disimpan!</h2>
        <p>Pelanggan: <strong>${custName}</strong></p>
        <p>Total: <strong>${fmt(total)}</strong></p>
        <p style="margin-top:7px;font-size:.8rem">📅 Masuk: <strong>${fmtDate(tglMasuk+'T00:00:00')}</strong></p>
        <p style="font-size:.8rem">✅ Est. Selesai: <strong>${fmtDate(tglEst+'T00:00:00')}</strong></p>
        ${note?`<p style="font-size:.73rem;margin-top:5px;color:var(--text3)">📝 ${note}</p>`:''}
        <div style="display:flex;gap:8px;margin-top:14px">
          <button class="btn-selesai" style="background:var(--blue);flex:1" onclick="cetakLabelThermalDariPending(${p.id})">🖨️ Cetak Struk</button>
          <button class="btn-selesai" style="flex:1" onclick="selesai()">Selesai</button>
        </div>
      </div>`;
    return;
  }
  const cash=activePayMethod==='tunai'?parseFloat(document.getElementById('cashInput')?.value||0):total;
  if(activePayMethod==='tunai'&&cash<total){alert('Uang kurang!');return;}
  const kembalian=activePayMethod==='tunai'?cash-total:0;
  const tx={id:Date.now(),time:new Date().toISOString(),customer:custName,phone:custPhone,items:[...cart],subtotal:getSubtotal(),discount:getDiscount(),total,method:activePayMethod,kembalian};
  transactions.unshift(tx);saveTx();
  document.getElementById('modalContent').innerHTML=`
    <div class="success-modal">
      <div class="success-icon">✅</div>
      <h2>Pembayaran Berhasil!</h2>
      <p>Pelanggan: <strong>${custName}</strong></p>
      <p>Total: <strong>${fmt(total)}</strong></p>
      ${kembalian>0?`<div class="kembalian-besar">${fmt(kembalian)}</div><p style="color:var(--accent3);font-weight:700">Kembalian</p>`:''}
      <p style="margin-top:7px;font-size:.73rem;color:var(--text3)">ID #${tx.id}</p>
      <div style="display:flex;gap:8px;margin-top:14px">
        <button class="btn-selesai" style="background:var(--blue);flex:1" onclick="cetakNotaDigital(${tx.id},'LUNAS')">🖨️ Nota Lunas</button>
        <button class="btn-selesai" style="background:var(--accent3);flex:1" onclick="cetakLabelThermalDariTx(${tx.id})">🧾 Struk Thermal</button>
      </div>
      <button class="btn-selesai" style="margin-top:8px" onclick="selesai()">Transaksi Berikutnya</button>
    </div>`;
}
function selesai(){clearCart();closeModal();}

// ===== LAPORAN =====
function setLapTab(tab,btn){
  activeLapTab=tab;
  document.querySelectorAll('.lap-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('lapTransaksi').style.display=tab==='transaksi'?'':'none';
  document.getElementById('lapPending').style.display=tab==='pending'?'':'none';
  if(tab==='pending')renderPendingPanel();
}
function setFilter(f,btn){
  activeFilter=f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderLaporan();
}
function filterTx(){
  const now=new Date();
  return transactions.filter(tx=>{
    const d=new Date(tx.time);
    if(activeFilter==='hari')return d.toDateString()===now.toDateString();
    if(activeFilter==='minggu')return(now-d)/86400000<=7;
    if(activeFilter==='bulan')return(now-d)/86400000<=30;
    return true;
  });
}

function renderLaporan(){
  if(activeLapTab==='pending'){renderPendingPanel();return;}
  const filtered=filterTx();
  const totalRev=filtered.reduce((s,t)=>s+t.total,0);
  const avgTx=filtered.length?Math.round(totalRev/filtered.length):0;
  const activePending=pendings.filter(p=>!p.done);
  document.getElementById('statsGrid').innerHTML=`
    <div class="stat-card accent"><div class="slbl">Pendapatan</div><div class="sval">${fmtShort(totalRev)}</div><div class="ssub">${fmt(totalRev)}</div></div>
    <div class="stat-card"><div class="slbl">Transaksi</div><div class="sval">${filtered.length}</div><div class="ssub">pesanan selesai</div></div>
    <div class="stat-card"><div class="slbl">Rata-rata</div><div class="sval">${fmtShort(avgTx)}</div><div class="ssub">per transaksi</div></div>
    <div class="stat-card blue-card"><div class="slbl">Order Pending</div><div class="sval">${activePending.length}</div><div class="ssub">${fmt(activePending.reduce((s,p)=>s+p.total,0))} belum diambil</div></div>`;
  const days=[];
  for(let i=6;i>=0;i--){
    const d=new Date();d.setDate(d.getDate()-i);
    const lbl=d.toLocaleDateString('id-ID',{weekday:'short'});
    const rev=transactions.filter(t=>new Date(t.time).toDateString()===d.toDateString()).reduce((s,t)=>s+t.total,0);
    days.push({lbl,rev});
  }
  const maxR=Math.max(...days.map(d=>d.rev),1);
  document.getElementById('barChart').innerHTML=days.map(d=>`
    <div class="bar-col">
      <div class="bar-fill" style="height:${Math.max(3,(d.rev/maxR)*110)}px"><div class="bar-tip">${fmt(d.rev)}</div></div>
      <div class="bar-label">${d.lbl}</div>
    </div>`).join('');
  const tbody=document.getElementById('txBody');
  if(!filtered.length){tbody.innerHTML='<tr><td colspan="6" class="no-data">Belum ada transaksi.</td></tr>';return;}
  tbody.innerHTML=filtered.slice(0,100).map((tx,i)=>{
    const t=new Date(tx.time);
    const ts=t.toLocaleDateString('id-ID',{day:'2-digit',month:'short'})+' '+t.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    const items=tx.items.map(it=>`${it.icon}${it.name}×${it.qty}`).join(', ');
    return `<tr>
      <td style="color:var(--text3);font-family:'DM Mono',monospace;font-size:.72rem">#${i+1}</td>
      <td class="mono" style="font-size:.76rem;white-space:nowrap">${ts}</td>
      <td><strong>${tx.customer}</strong>${tx.phone!=='-'?`<div style="font-size:.7rem;color:var(--text3)">${tx.phone}</div>`:''}</td>
      <td style="font-size:.73rem;max-width:170px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${items}</td>
      <td class="mono" style="font-weight:700;color:var(--accent)">${fmt(tx.total)}</td>
      <td><span class="bm bm-${tx.method}">${tx.method}</span></td>
      <td><button style="font-size:.7rem;padding:3px 8px;border-radius:6px;border:1.5px solid var(--blue);background:var(--blue-bg);color:var(--blue);cursor:pointer;font-weight:700" onclick="cetakNotaDigital(${tx.id},'LUNAS')">🖨️ Nota</button></td>
    </tr>`;
  }).join('');
}

// ===== EXPORT CSV =====
function exportCSV(){
  const filtered=filterTx();
  if(!filtered.length){alert('Tidak ada data untuk diexport.');return;}
  const rows=[['No','Tanggal','Waktu','Pelanggan','No HP','Items','Subtotal','Diskon%','Total','Metode','Kembalian']];
  filtered.forEach((tx,i)=>{
    const d=new Date(tx.time);
    rows.push([
      i+1,
      d.toLocaleDateString('id-ID'),
      d.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}),
      tx.customer,tx.phone,
      tx.items.map(it=>`${it.name}x${it.qty}`).join('; '),
      tx.subtotal,tx.discount||0,tx.total,tx.method,tx.kembalian||0
    ]);
  });
  const csv=rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob=new Blob(['\uFEFF'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  const now=new Date();
  a.href=url;a.download=`laporan_${tokoConfig.nama||'laundry'}_${now.toISOString().split('T')[0]}.csv`;
  a.click();URL.revokeObjectURL(url);
}

// ===== PENDING PANEL =====
function renderPendingPanel(){
  const active=pendings.filter(p=>!p.done);
  const totalVal=active.reduce((s,p)=>s+p.total,0);
  const overdueCount=active.filter(p=>{const now=new Date();now.setHours(0,0,0,0);return new Date(p.tglEst+'T00:00:00')<now;}).length;
  document.getElementById('pendingStats').innerHTML=`
    <div class="stat-card blue-card"><div class="slbl">Order Aktif</div><div class="sval">${active.length}</div><div class="ssub">sedang diproses</div></div>
    <div class="stat-card"><div class="slbl">Total Tagihan</div><div class="sval">${fmtShort(totalVal)}</div><div class="ssub">${fmt(totalVal)}</div></div>
    <div class="stat-card ${overdueCount>0?'accent':''}"><div class="slbl">Terlambat</div><div class="sval">${overdueCount}</div><div class="ssub">${overdueCount>0?'segera hubungi pelanggan':'semua on time 👍'}</div></div>
    <div class="stat-card"><div class="slbl">Sudah Selesai</div><div class="sval">${pendings.filter(p=>p.done).length}</div><div class="ssub">dari ${pendings.length} total</div></div>`;
  const el=document.getElementById('pendingList');
  if(!active.length){el.innerHTML='<div class="no-data" style="background:var(--surface);border-radius:var(--radius);border:2px solid var(--border)">🎉 Tidak ada order pending saat ini!</div>';return;}
  const sorted=[...active].sort((a,b)=>new Date(a.tglEst)-new Date(b.tglEst));
  el.innerHTML=sorted.map(p=>{
    const items=p.items.map(it=>`${it.icon} ${it.name} ×${it.qty}`).join(' · ');
    const cd=getCountdown(p.tglEst);
    return `<div class="pending-card">
      <div class="pending-card-header">
        <div><div class="pc-name">👤 ${p.customer}</div>${p.phone!=='-'?`<div class="pc-phone">📞 ${p.phone}</div>`:''}</div>
        <span class="pc-status">🕐 Pending</span>
      </div>
      <div class="pending-card-body">
        <div class="pc-dates">
          <div class="pc-date-box"><div class="pc-date-label">📅 Tanggal Masuk</div><div class="pc-date-val">${fmtDate(p.tglMasuk+'T00:00:00')}</div></div>
          <div class="pc-date-box"><div class="pc-date-label">✅ Est. Selesai</div><div class="pc-date-val est">${fmtDate(p.tglEst+'T00:00:00')}</div><div class="pc-countdown ${cd.cls}">${cd.text}</div></div>
        </div>
        <div class="pc-items">${items}</div>
        ${p.note?`<div class="pc-note">📝 ${p.note}</div>`:''}
      </div>
      <div class="pending-card-footer">
        <div class="pc-total">${fmt(p.total)}</div>
        <div class="pc-actions">
          <button class="batal-pending-btn" onclick="batalPending(${p.id})">Batal</button>
          <button style="background:var(--blue-bg);color:var(--blue);border:1.5px solid #93c5fd;border-radius:8px;padding:5px 9px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.72rem;cursor:pointer" onclick="cetakLabelThermalDariPending(${p.id})">🖨️ Struk</button>
          <button class="selesai-btn" onclick="selesaikanPending(${p.id})">✓ Selesai & Bayar</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function selesaikanPending(id){
  const p=pendings.find(x=>x.id===id);if(!p)return;
  if(!confirm(`Tandai order ${p.customer} (${fmt(p.total)}) sebagai selesai?`))return;
  p.done=true;p.doneTime=new Date().toISOString();
  transactions.unshift({id:Date.now(),time:p.doneTime,customer:p.customer,phone:p.phone,items:p.items,subtotal:p.subtotal,discount:p.discount,total:p.total,method:'pending→selesai',kembalian:0});
  saveTx();savePending();updatePendingBadge();bannerDismissed=false;checkBanner();renderPendingPanel();
}
function batalPending(id){
  const p=pendings.find(x=>x.id===id);if(!p)return;
  if(!confirm(`Batalkan order ${p.customer}?`))return;
  pendings=pendings.filter(x=>x.id!==id);
  savePending();updatePendingBadge();bannerDismissed=false;checkBanner();renderPendingPanel();
}
function updatePendingBadge(){
  const n=pendings.filter(p=>!p.done).length;
  const el=document.getElementById('pendingCount');
  if(el){el.textContent=n;el.style.display=n>0?'inline':'none';}
}

// ===== KURIR =====
let activeKurirTab = 'jemput';

function setKurirTab(tab, btn) {
  activeKurirTab = tab;
  document.querySelectorAll('#kurirTabs .filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderKurir();
}

function getKurirData() {
  // Jemput: pending dengan tipeOrder JEMPUT/JEMPUT+ANTAR, statusKurir belum DIJEMPUT
  const jemput = pendings.filter(p =>
    !p.done &&
    (p.tipeOrder === 'JEMPUT' || p.tipeOrder === 'JEMPUT+ANTAR') &&
    p.statusKurir !== 'DIJEMPUT' && p.statusKurir !== 'DIANTAR'
  );
  // Antar: pending yang sudah selesai diproses & perlu diantar
  const antar = pendings.filter(p =>
    p.done &&
    (p.tipeOrder === 'ANTAR' || p.tipeOrder === 'JEMPUT+ANTAR') &&
    p.statusKurir !== 'DIANTAR'
  );
  // Selesai hari ini
  const today = new Date().toDateString();
  const selesai = pendings.filter(p =>
    p.statusKurir === 'DIANTAR' &&
    p.kurirDoneTime && new Date(p.kurirDoneTime).toDateString() === today
  );
  return { jemput, antar, selesai };
}

function renderKurir() {
  const { jemput, antar, selesai } = getKurirData();

  document.getElementById('kurirStats').innerHTML = `
    <div class="stat-card blue-card"><div class="slbl">Perlu Dijemput</div><div class="sval">${jemput.length}</div></div>
    <div class="stat-card" style="background:#dcfce7;border-color:#86efac"><div class="slbl">Perlu Diantar</div><div class="sval" style="color:#166534">${antar.length}</div></div>`;

  let list = [];
  if (activeKurirTab === 'jemput') list = jemput;
  else if (activeKurirTab === 'antar') list = antar;
  else list = selesai;

  const el = document.getElementById('kurirList');
  if (!list.length) {
    const msg = activeKurirTab === 'jemput' ? 'Tidak ada order yang perlu dijemput'
              : activeKurirTab === 'antar' ? 'Tidak ada order yang perlu diantar'
              : 'Belum ada yang selesai hari ini';
    el.innerHTML = `<div class="no-data" style="background:var(--surface);border-radius:var(--radius);border:2px solid var(--border)">🎉 ${msg}</div>`;
    return;
  }

  el.innerHTML = `<div style="display:flex;flex-direction:column;gap:10px">${list.map(p => {
    const waPhone = p.phone && p.phone !== '-' ? p.phone.replace(/^0/,'62').replace(/[^0-9]/g,'') : '';
    const mapsUrl = p.alamat ? `https://www.google.com/maps/search/${encodeURIComponent(p.alamat)}` : '';
    const codBadge = p.cod === 'YA' ? `<span class="kc-cod">💰 COD ${fmt(p.total)}</span>` : '';

    if (activeKurirTab === 'jemput') {
      return `<div class="kurir-card jemput">
        <div class="kc-header">
          <div class="kc-name">👤 ${p.customer}</div>
          <span class="kc-badge jemput">🏠 Jemput</span>
        </div>
        <div class="kc-info">
          ${waPhone ? `<a href="https://wa.me/${waPhone}" target="_blank">📞 ${p.phone}</a>` : `<span>📞 ${p.phone||'-'}</span>`}
          ${p.alamat ? `<a href="${mapsUrl}" target="_blank">📍 ${p.alamat}</a>` : '<span style="color:var(--text3)">📍 Alamat belum diisi</span>'}
          ${p.note ? `<span>📝 ${p.note}</span>` : ''}
        </div>
        <div class="kc-actions">
          <button class="kc-btn primary" onclick="tandaiDijemput(${p.id})">✓ Sudah Dijemput</button>
        </div>
      </div>`;
    }

    if (activeKurirTab === 'antar') {
      return `<div class="kurir-card antar">
        <div class="kc-header">
          <div class="kc-name">👤 ${p.customer}</div>
          <span class="kc-badge antar">📦 Antar</span>
        </div>
        <div class="kc-info">
          ${waPhone ? `<a href="https://wa.me/${waPhone}" target="_blank">📞 ${p.phone}</a>` : `<span>📞 ${p.phone||'-'}</span>`}
          ${p.alamat ? `<a href="${mapsUrl}" target="_blank">📍 ${p.alamat}</a>` : '<span style="color:var(--text3)">📍 Alamat belum diisi</span>'}
        </div>
        <div class="kc-header">
          <div class="kc-total">${fmt(p.total)}</div>
          ${codBadge}
        </div>
        <div class="kc-actions">
          <button class="kc-btn blue" onclick="tandaiDiantar(${p.id})">✓ Sudah Diantar</button>
        </div>
      </div>`;
    }

    // selesai
    return `<div class="kurir-card">
      <div class="kc-header">
        <div class="kc-name">👤 ${p.customer}</div>
        <span class="kc-badge selesai">✅ Selesai</span>
      </div>
      <div class="kc-info"><span>${fmt(p.total)}</span></div>
    </div>`;
  }).join('')}</div>`;
}

function tandaiDijemput(id) {
  const p = pendings.find(x => x.id === id);
  if (!p) return;
  if (!confirm(`Konfirmasi: barang ${p.customer} sudah dijemput?`)) return;
  p.statusKurir = 'DIJEMPUT';
  savePending();
  renderKurir();
  alert('✅ Ditandai sudah dijemput. Barang siap ditimbang di kasir.');
}

function tandaiDiantar(id) {
  const p = pendings.find(x => x.id === id);
  if (!p) return;
  const codMsg = p.cod === 'YA' ? `\n💰 Jangan lupa tagih ${fmt(p.total)} (COD)` : '';
  if (!confirm(`Konfirmasi: barang ${p.customer} sudah diantar?${codMsg}`)) return;
  p.statusKurir = 'DIANTAR';
  p.kurirDoneTime = new Date().toISOString();
  savePending();
  renderKurir();
}


function renderPengaturan(){
  document.getElementById('set-nama-toko').value=tokoConfig.nama||'';
  document.getElementById('set-tagline').value=tokoConfig.tagline||'';
  document.getElementById('set-rekening').value=tokoConfig.rekening||'';
  document.getElementById('set-ai-url').value=aiConfig.url||'https://ai.sumopod.com';
  document.getElementById('set-ai-key').value=aiConfig.key||'';
  document.getElementById('set-ai-model').value=aiConfig.model||'gpt-4.1-nano';
  displayLogo();
  buildCategories();
  renderServiceList();
}

function saveToko(){
  tokoConfig={
    ...tokoConfig,
    nama:document.getElementById('set-nama-toko').value||'LaundryPOS',
    tagline:document.getElementById('set-tagline').value||'kasir digital',
    rekening:document.getElementById('set-rekening').value||''
  };
  localStorage.setItem('lpos_toko',JSON.stringify(tokoConfig));
  applyTokoConfig();
  const el=document.getElementById('tokoSaved');el.style.display='inline';
  setTimeout(()=>el.style.display='none',2000);
}

// ===== LOGO TOKO (untuk struk) =====
function uploadLogo(event){
  const file=event.target.files[0];
  if(!file)return;
  if(file.size>500000){alert('❌ Ukuran logo terlalu besar! Maksimal 500KB.');return;}
  const reader=new FileReader();
  reader.onload=(e)=>{
    tokoConfig={...tokoConfig,logo:e.target.result};
    localStorage.setItem('lpos_toko',JSON.stringify(tokoConfig));
    displayLogo();
    alert('✅ Logo berhasil diupload!');
  };
  reader.readAsDataURL(file);
  event.target.value='';
}

function displayLogo(){
  const preview=document.getElementById('logoPreview');
  if(!preview)return;
  if(tokoConfig.logo){
    preview.innerHTML=`<img src="${tokoConfig.logo}" alt="Logo" style="max-width:150px;max-height:80px">`;
  }else{
    preview.innerHTML='<div style="color:var(--text3);font-size:.8rem">📸 Belum ada logo</div>';
  }
}

function clearLogo(){
  if(!confirm('Hapus logo?'))return;
  tokoConfig={...tokoConfig,logo:null};
  localStorage.setItem('lpos_toko',JSON.stringify(tokoConfig));
  displayLogo();
  alert('✅ Logo berhasil dihapus!');
}

function saveAI(){
  aiConfig={
    url:document.getElementById('set-ai-url').value||'https://ai.sumopod.com',
    key:document.getElementById('set-ai-key').value||'',
    model:document.getElementById('set-ai-model').value||'gpt-4.1-nano'
  };
  localStorage.setItem('lpos_ai',JSON.stringify(aiConfig));
  const el=document.getElementById('aiSaved');el.style.display='inline';
  setTimeout(()=>el.style.display='none',2000);
  renderCart();// refresh scan buttons
}

async function testAI(){
  const url=document.getElementById('set-ai-url').value;
  const key=document.getElementById('set-ai-key').value;
  const model=document.getElementById('set-ai-model').value;
  if(!key){alert('Isi API Key dulu!');return;}
  try{
    const r=await fetch(`${url}/v1/chat/completions`,{
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${key}`},
      body:JSON.stringify({model,max_tokens:10,messages:[{role:'user',content:'ping'}]})
    });
    const d=await r.json();
    if(!r.ok) throw new Error(d.error?.message||'Error '+r.status);
    alert('✅ Koneksi berhasil! Model: '+model);
  }catch(e){alert('❌ Gagal: '+e.message);}
}

// Service editor
let iconPickerTargetIdx = null;

function renderServiceList(){
  const el=document.getElementById('serviceList');
  const categoryOptions = (selected) => {
    const list = [...new Set((categories||[]).filter(c => c !== 'Semua').concat(selected || []).filter(Boolean))];
    return list.map(c => `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`).join('');
  };
  el.innerHTML=products.map((p,i)=>`
    <div class="service-row">
      <button class="icon-pick-btn" onclick="bukaIconPicker(${i},this)" title="Klik untuk pilih icon">${p.icon}</button>
      <input type="text" value="${p.name}" onchange="products[${i}].name=this.value" placeholder="Nama layanan">
      <select onchange="products[${i}].cat=this.value">${categoryOptions(p.cat)}</select>
      <input type="number" value="${p.price}" onchange="products[${i}].price=parseInt(this.value)||0" placeholder="Harga">
      <button class="del-svc-btn" onclick="deleteService(${i})">🗑</button>
    </div>`).join('');
}

function bukaIconPicker(idx, btn) {
  iconPickerTargetIdx = idx;
  document.getElementById('iconPickerPopup').classList.add('open');
  document.getElementById('iconPickerOverlay').classList.add('open');
}

function tutupPickerOutside(e) {
  const popup = document.getElementById('iconPickerPopup');
  if (!popup.contains(e.target)) tutupIconPicker();
}

function tutupIconPicker() {
  document.getElementById('iconPickerPopup').classList.remove('open');
  document.getElementById('iconPickerOverlay').classList.remove('open');
  iconPickerTargetIdx = null;
}

function pilihIcon(emoji) {
  if (iconPickerTargetIdx === null) return;
  products[iconPickerTargetIdx].icon = emoji;
  tutupIconPicker();
  renderServiceList();
}
function addService(){
  products.push({id:Date.now(),name:'Layanan Baru',cat:(categories.find(c=>c!=='Semua')||'Tambahan'),icon:'✨',price:10000,unit:'per item',perKg:false});
  buildCategories();
  renderServiceList();
}
function deleteService(i){
  if(!confirm('Hapus layanan ini?'))return;
  products.splice(i,1);renderServiceList();
}
function saveServices(){
  localStorage.setItem('lpos_services',JSON.stringify(products));
  buildCategories();renderCategories();renderProducts();
  const el=document.getElementById('svcSaved');el.style.display='inline';
  setTimeout(()=>el.style.display='none',2000);
}

// ===== PRINT FUNCTIONS =====
// Transplantasi dari J LAUNDRY EXPRESS - PRINT FUNCTIONS
// Dependency: jsPDF (sudah di-load di head)

const LOGO_B64 = "/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/wAALCABAAEABAREA/8QAGgABAAIDAQAAAAAAAAAAAAAAAAUGAgMEB//EACsQAAICAQQBBAEEAwAAAAAAAAECAAMEBREhMRJBUWEGEyJxFCMyQoH/2gAIAQEAAD8A7LEREQEREQEREX5eQyMzEBVBJJ9IHO7ftYvJyHNXnNVF01KiLokKPOz5J+fMw7DGz8mzIzMpb3lxuV5e0Y97MfUk/MzXERERerDLpsW2pLK2DpYoZWHoQdgivY3r3fjXTxg32OKKnfVYdnpBNYBG17gdne/nX5mB4dkXfEamzl3Y5ZcZLRX03qxuo+gJHaR+I9s+kcTsqeynHp3avd36z00VFoCqoCgegEDIiIiIiIiIiIiIiIiIiJ/9k=";

// Buat nota ID unik
function buatNotaId(id) {
  const d = new Date(id);
  return 'JL' + d.getFullYear().toString().slice(-2) +
    String(d.getMonth()+1).padStart(2,'0') +
    String(d.getDate()).padStart(2,'0') + '-' +
    String(id).slice(-4);
}

// Format order dari transaksi untuk print
function txToPrintOrder(tx) {
  return {
    notaUnik : buatNotaId(tx.id),
    nama     : tx.customer,
    phone    : tx.phone,
    masuk    : new Date(tx.time).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}),
    selesai  : '-',
    items    : tx.items.map(it => ({
      namaItem : it.name,
      subtotal : it.perKg && it.weight ? it.price * it.weight : it.price * it.qty,
    })),
    total    : tx.total,
    diskon   : tx.discount || 0,
  };
}

// Format order dari pending untuk print
function pendingToPrintOrder(p) {
  return {
    notaUnik : buatNotaId(p.id),
    nama     : p.customer,
    phone    : p.phone,
    masuk    : p.tglMasuk ? new Date(p.tglMasuk+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-',
    selesai  : p.tglEst ? new Date(p.tglEst+'T00:00:00').toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : '-',
    items    : p.items.map(it => ({
      namaItem : it.name,
      subtotal : it.perKg && it.weight ? it.price * it.weight : it.price * it.qty,
    })),
    total    : p.total,
    diskon   : p.discount || 0,
  };
}

// Deteksi format gambar logo custom (PNG/JPEG) agar addImage tidak salah decode
function formatLogoAktif() {
  if (tokoConfig.logo && tokoConfig.logo.startsWith('data:image/png')) return 'PNG';
  return 'JPEG';
}

// Cetak Nota Digital (A6) dari transaksi
function cetakNotaDigital(txId, jenis) {
  if(typeof window.jspdf === 'undefined') { alert('Library PDF belum siap, tunggu sebentar lalu coba lagi.'); return; }
  const tx = transactions.find(t => t.id === txId);
  if(!tx) { alert('Transaksi tidak ditemukan!'); return; }
  const order = txToPrintOrder(tx);
  const jsPDFLib = window.jspdf.jsPDF;
  const doc = new jsPDFLib({orientation:'portrait',unit:'mm',format:[148,185]});
  const img = new Image();
  img.onload = function() {
    try { doc.addImage(img,formatLogoAktif(),12,8,22,22); } catch(e) { buatLogoFallback(doc); }
    buatKontenNota(doc, order, jenis);
  };
  img.onerror = function() { buatLogoFallback(doc); buatKontenNota(doc, order, jenis); };
  img.src = tokoConfig.logo || ('data:image/jpeg;base64,' + LOGO_B64);
}

// Cetak label thermal dari transaksi
function cetakLabelThermalDariTx(txId) {
  if(typeof window.jspdf === 'undefined') { alert('Library PDF belum siap.'); return; }
  const tx = transactions.find(t => t.id === txId);
  if(!tx) { alert('Transaksi tidak ditemukan!'); return; }
  const order = txToPrintOrder(tx);
  _doCetakThermal(order);
}

// Cetak label thermal dari pending
function cetakLabelThermalDariPending(pendingId) {
  if(typeof window.jspdf === 'undefined') { alert('Library PDF belum siap.'); return; }
  const p = pendings.find(x => x.id === pendingId);
  if(!p) { alert('Order tidak ditemukan!'); return; }
  const order = pendingToPrintOrder(p);
  _doCetakThermal(order);
}

function _doCetakThermal(order) {
  const jsPDFLib = window.jspdf.jsPDF;
  const doc = new jsPDFLib({orientation:'portrait',unit:'mm',format:[76,100]});
  const img = new Image();
  img.onload = function() {
    try { doc.addImage(img,formatLogoAktif(),3,3,18,18); } catch(e) {}
    buildThermal(doc, order);
  };
  img.onerror = function() { buildThermal(doc, order); };
  img.src = tokoConfig.logo || ('data:image/jpeg;base64,' + LOGO_B64);
}

function buatLogoFallback(doc) {
  doc.setFillColor(29,78,216);
  doc.circle(23,19,10,'F');
  doc.setTextColor(255,255,255);
  doc.setFont('Helvetica','bold');
  doc.setFontSize(14);
  doc.text('J',20,23);
}

function buatKontenNota(doc, order, jenis) {
  const tX = 38;
  const namaToko = tokoConfig.nama || 'J Laundry Express';
  const rekening = tokoConfig.rekening || '';
  // Kop
  doc.setTextColor(15,23,42); doc.setFont('Helvetica','bold'); doc.setFontSize(11);
  doc.text(namaToko.toUpperCase(), tX, 14);
  doc.setFont('Helvetica','normal'); doc.setFontSize(8); doc.setTextColor(71,85,105);
  if(rekening) doc.text(rekening, tX, 19);
  // Label jenis
  if(jenis==='LUNAS') { doc.setTextColor(22,163,74); doc.text('NOTA LUNAS', 136,14,{align:'right'}); }
  else { doc.setTextColor(220,38,38); doc.text('NOTA TAGIHAN', 136,14,{align:'right'}); }
  doc.setTextColor(71,85,105); doc.setFontSize(8);
  doc.text(`No. Nota : ${order.notaUnik}`, 136,19,{align:'right'});
  doc.text(`Tanggal  : ${order.masuk}`, 136,23,{align:'right'});
  // Garis
  doc.setDrawColor(212,175,55); doc.setLineWidth(0.5); doc.line(12,28,136,28);
  // Box pelanggan
  const boxH = 13;
  doc.setFillColor(241,245,249); doc.rect(12,32,124,boxH,'F');
  doc.setDrawColor(203,213,225); doc.rect(12,32,124,boxH);
  doc.setFont('Helvetica','bold'); doc.setFontSize(10); doc.setTextColor(30,41,59);
  doc.text(`PELANGGAN : ${order.nama.toUpperCase()}`, 16,38);
  doc.setFont('Helvetica','normal'); doc.setFontSize(8.5);
  doc.text(`No. HP : ${order.phone||'-'}`, 16,43);
  // Header tabel
  let tY = 38 + boxH;
  doc.setFillColor(30,58,138); doc.rect(12,tY,124,7,'F');
  doc.setTextColor(255,255,255); doc.setFont('Helvetica','bold'); doc.setFontSize(8.5);
  doc.text('Rincian Layanan',15,tY+5);
  doc.text('Subtotal',133,tY+5,{align:'right'});
  doc.setTextColor(15,23,42); doc.setFont('Helvetica','normal');
  let isiY = tY+7;
  order.items.forEach(it => {
    doc.setDrawColor(226,232,240); doc.rect(12,isiY,124,8);
    const namaItem = it.namaItem.length>55 ? it.namaItem.substring(0,52)+'...' : it.namaItem;
    doc.text(namaItem,15,isiY+5.5);
    doc.text(`Rp ${it.subtotal.toLocaleString('id-ID')}`,133,isiY+5.5,{align:'right'});
    isiY += 8;
  });
  // Total
  let totY = isiY + 4;
  if(order.diskon>0) {
    doc.setFont('Helvetica','italic'); doc.setFontSize(8); doc.setTextColor(220,38,38);
    doc.text(`* Diskon ${order.diskon}%`,13,totY+4);
    totY += 6;
  }
  doc.setFillColor(30,58,138); doc.rect(65,totY,71,9,'F');
  doc.setDrawColor(212,175,55); doc.setLineWidth(0.4); doc.rect(65,totY,71,9);
  doc.setTextColor(255,255,255); doc.setFont('Helvetica','bold'); doc.setFontSize(9.5);
  doc.text('TOTAL BAYAR :',69,totY+6);
  doc.setTextColor(253,224,71);
  doc.text(`Rp ${order.total.toLocaleString('id-ID')}`,131,totY+6,{align:'right'});
  // Stempel
  if(jenis==='LUNAS') {
    doc.setDrawColor(22,163,74); doc.setLineWidth(0.6); doc.rect(15,totY,38,9);
    doc.setTextColor(22,163,74); doc.setFont('Helvetica','bold'); doc.setFontSize(9);
    doc.text('PAID / LUNAS',21,totY+6);
  } else {
    doc.setDrawColor(220,38,38); doc.setLineWidth(0.6); doc.rect(15,totY,38,9);
    doc.setTextColor(220,38,38); doc.setFont('Helvetica','bold'); doc.setFontSize(8.5);
    doc.text('BELUM LUNAS',20,totY+6);
  }
  // Est selesai
  if(order.selesai && order.selesai !== '-') {
    let sY2 = totY + 14;
    doc.setFont('Helvetica','normal'); doc.setFontSize(8); doc.setTextColor(71,85,105);
    doc.text(`Est. Selesai: ${order.selesai}`,13,sY2);
  }
  // S&K
  let sY = totY + 20;
  doc.setTextColor(15,23,42); doc.setFont('Helvetica','bold'); doc.setFontSize(7.5);
  doc.text('Syarat & Ketentuan:', 12, sY);
  doc.setFont('Helvetica','italic'); doc.setTextColor(100,116,139); doc.setFontSize(7);
  doc.text('1. Tunjukkan nota ini saat pengambilan.',12,sY+4);
  doc.text('2. Komplain kerusakan maks. 1x24 jam sejak serah terima.',12,sY+7.5);
  // TTD
  let ttdY = sY+16;
  doc.setFont('Helvetica','normal'); doc.setFontSize(8); doc.setTextColor(15,23,42);
  doc.text('Sistem Kasir Terverifikasi,',96,ttdY);
  doc.setFont('Helvetica','bold'); doc.setTextColor(29,78,216);
  doc.text('[ ' + namaToko.toUpperCase() + ' ]',97,ttdY+7);
  doc.save(`Nota-${jenis}-${order.notaUnik}.pdf`);
}

function buildThermal(doc, order) {
  const margin = 3;
  const pageW = 76;
  const contentW = pageW - (margin * 2);
  const namaToko = tokoConfig.nama || 'J Laundry Express';
  let y = 3;
  // Header
  doc.setFont('Helvetica','bold'); doc.setFontSize(10);
  doc.text(namaToko.toUpperCase(), 23, 9);
  doc.setFont('Helvetica','normal'); doc.setFontSize(7);
  doc.setTextColor(100,116,139);
  doc.text(tokoConfig.tagline || 'kasir digital', 23, 14);
  doc.setTextColor(0,0,0);
  y = 22;
  // Garis
  doc.setLineWidth(0.5); doc.setDrawColor(30,58,138);
  doc.line(margin, y, pageW-margin, y); y += 4;
  // Pelanggan
  doc.setFont('Helvetica','normal'); doc.setFontSize(7.5);
  doc.setTextColor(100,116,139);
  doc.text('PELANGGAN', margin, y); y += 4;
  doc.setFont('Helvetica','bold'); doc.setFontSize(14);
  doc.setTextColor(0,0,0);
  const namaLines = doc.splitTextToSize('Kak ' + order.nama, contentW);
  doc.text(namaLines, margin, y);
  y += namaLines.length * 7;
  // Garis
  doc.setLineWidth(0.3); doc.setDrawColor(180,180,180);
  doc.line(margin, y, pageW-margin, y); y += 4;
  // Nota
  doc.setFont('Helvetica','bold'); doc.setFontSize(7.5);
  doc.setTextColor(100,116,139); doc.text('NOTA', margin, y);
  doc.setFont('Helvetica','bold'); doc.setFontSize(9);
  doc.setTextColor(0,0,0); doc.text(order.notaUnik, 20, y); y += 5;
  // Masuk
  doc.setFont('Helvetica','bold'); doc.setFontSize(7.5);
  doc.setTextColor(100,116,139); doc.text('MASUK', margin, y);
  doc.setFont('Helvetica','normal'); doc.setFontSize(9);
  doc.setTextColor(0,0,0); doc.text(order.masuk || '-', 20, y); y += 5;
  // Selesai
  doc.setFont('Helvetica','bold'); doc.setFontSize(7.5);
  doc.setTextColor(100,116,139); doc.text('SELESAI', margin, y);
  doc.setFont('Helvetica','normal'); doc.setFontSize(9);
  doc.setTextColor(0,0,0); doc.text(order.selesai || '-', 20, y); y += 6;
  // Garis
  doc.setLineWidth(0.3); doc.setDrawColor(180,180,180);
  doc.line(margin, y, pageW-margin, y); y += 4;
  // Total
  doc.setFont('Helvetica','bold'); doc.setFontSize(7.5);
  doc.setTextColor(100,116,139); doc.text('TOTAL TAGIHAN', margin, y); y += 5;
  doc.setFont('Helvetica','bold'); doc.setFontSize(16);
  doc.setTextColor(30,58,138);
  doc.text('Rp ' + order.total.toLocaleString('id-ID'), margin, y); y += 8;
  doc.setTextColor(0,0,0);
  // Garis bawah
  doc.setLineWidth(0.5); doc.setDrawColor(30,58,138);
  doc.line(margin, y, pageW-margin, y);
  doc.save(`Struk-${order.notaUnik}.pdf`);
}

// Tombol print dari laporan (tabel transaksi)
function printFromLaporan(txId, jenis) {
  cetakNotaDigital(txId, jenis);
}

// ===== AUTH =====
// PIN sementara hardcode — nanti dari Google Sheets
const USERS_DEFAULT = [
  { nama: 'Owner',   pin: '1234', role: 'OWNER', device: 'Laptop' },
  { nama: 'Kasir 1', pin: '5678', role: 'KASIR',  device: 'Tablet' },
  { nama: 'Kurir 1', pin: '9012', role: 'KURIR',  device: 'HP'     },
];

let currentUser = JSON.parse(sessionStorage.getItem('lpos_user') || 'null');
let pinBuffer = '';

function pinInput(num) {
  if (pinBuffer.length >= 4) return;
  pinBuffer += num;
  updatePinDots();
  if (pinBuffer.length === 4) {
    setTimeout(cekPIN, 150);
  }
}

function pinDelete() {
  pinBuffer = pinBuffer.slice(0, -1);
  updatePinDots();
  document.getElementById('loginError').textContent = '';
  resetPinDotError();
}

function updatePinDots() {
  for (let i = 0; i < 4; i++) {
    const dot = document.getElementById('dot' + i);
    dot.classList.toggle('filled', i < pinBuffer.length);
    dot.classList.remove('error');
  }
}

function resetPinDotError() {
  for (let i = 0; i < 4; i++) {
    document.getElementById('dot' + i).classList.remove('error');
  }
}

function cekPIN() {
  const user = USERS_DEFAULT.find(u => u.pin === pinBuffer);
  if (user) {
    currentUser = user;
    sessionStorage.setItem('lpos_user', JSON.stringify(user));
    masukAplikasi(user);
  } else {
    // Tampilkan error
    for (let i = 0; i < 4; i++) {
      document.getElementById('dot' + i).classList.add('error');
      document.getElementById('dot' + i).classList.remove('filled');
    }
    document.getElementById('loginError').textContent = '❌ PIN salah, coba lagi';
    setTimeout(() => {
      pinBuffer = '';
      updatePinDots();
      document.getElementById('loginError').textContent = '';
    }, 1200);
  }
}

function masukAplikasi(user) {
  // Sembunyikan login
  document.getElementById('page-login').classList.add('hidden');
  // Tampilkan info user di header
  document.getElementById('userInfo').textContent = `${user.nama} (${user.role})`;
  document.getElementById('logoutBtn').style.display = 'block';
  // Tampilkan nav sesuai role
  renderNavByRole(user.role);
  // Arahkan ke halaman sesuai role
  if (user.role === 'KURIR') {
    showPage('kurir');
  } else {
    showPage('kasir');
  }
}

function renderNavByRole(role) {
  const nav = document.getElementById('navTabs');
  if (role === 'OWNER') {
    nav.innerHTML = `
      <button class="nav-tab active" onclick="showPage('kasir')">🧾 Kasir</button>
      <button class="nav-tab" onclick="showPage('laporan')">📊 Laporan</button>
      <button class="nav-tab" onclick="showPage('pengaturan')">⚙️</button>`;
  } else if (role === 'KASIR') {
    nav.innerHTML = `
      <button class="nav-tab active" onclick="showPage('kasir')">🧾 Kasir</button>
      <button class="nav-tab" onclick="showPage('laporan')">📋 Pending</button>`;
  } else if (role === 'KURIR') {
    nav.innerHTML = `
      <button class="nav-tab active" onclick="showPage('kurir')">🛵 Kurir</button>`;
  }
}

function doLogout() {
  if (!confirm('Keluar dari aplikasi?')) return;
  currentUser = null;
  pinBuffer = '';
  sessionStorage.removeItem('lpos_user');
  updatePinDots();
  document.getElementById('loginError').textContent = '';
  document.getElementById('page-login').classList.remove('hidden');
  document.getElementById('userInfo').textContent = '';
  document.getElementById('logoutBtn').style.display = 'none';
}

function cekSession() {
  if (currentUser) {
    masukAplikasi(currentUser);
  }
  // Kalau tidak ada session, login page tetap tampil
}

// ===== INIT =====
applyTokoConfig();
buildCategories();
renderCategories();
renderProducts();
renderCart();
updatePendingBadge();
cekSession(); // cek session dulu — kalau ada langsung masuk

// Cek banner tiap menit
setInterval(()=>{if(!bannerDismissed)checkBanner();},60000);

// ===== PWA: DAFTARKAN SERVICE WORKER =====
// (sebelumnya sw.js sudah ada tapi tidak pernah didaftarkan, jadi offline/install belum aktif)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[SW] Terdaftar:', reg.scope))
      .catch(err => console.warn('[SW] Gagal daftar:', err));
  });
}
