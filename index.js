// ===== LAUNDRY POS - MAIN APPLICATION LOGIC =====
// Extracted from index.html script section

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
let tokoConfig = JSON.parse(localStorage.getItem('lpos_toko') || '{"nama":"LaundryPOS","tagline":"kasir digital","rekening":"BCA 1234567890 a/n Laundry Kami"}');
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
let editingPendingId = null;

// ===== UTILITY FUNCTIONS =====
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

// ===== PAGE NAVIGATION =====
function showPage(p) {
  document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.nav-tab').forEach(x=>x.classList.remove('active'));
  document.getElementById('page-'+p).classList.add('active');

  const tabs = document.querySelectorAll('.nav-tab');
  tabs.forEach(t => {
    if (t.getAttribute('onclick') && t.getAttribute('onclick').includes(`'${p}'`)) {
      t.classList.add('active');
    }
  });

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

// ===== CART MANAGEMENT =====
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

// ===== SCAN TIMBANGAN (WEIGHT SCALE) =====
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

// ===== PAYMENT & PENDING MODAL =====
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

// ===== CONFIRMATION & PRINT =====
function konfirmasi(){
  const total=getTotal();
  if(activePayMethod==='pending'){
    const custName=document.getElementById('custName').value.trim();
    if(!custName){alert('Nama pelanggan harus diisi untuk pending!');return;}
    const tglMasuk=document.getElementById('tglMasuk').value;
    const tglEst=document.getElementById('tglEst').value;
    const note=document.getElementById('pendingNote').value.trim();
    const items=cart.map(c=>`${c.name}${c.perKg&&c.weight?` (${c.weight}kg)`:''}×${c.qty}`).join(', ');
    const diskon=getDiscount();
    pendings.push({customer:custName,items,total,tglMasuk,tglEst,note,diskon,done:false});
    savePending();
    showSuccess(total);
  } else {
    const txItem={id:transactions.length+1,waktu:new Date().toLocaleString('id-ID'),customer:document.getElementById('custName').value||'-',items:cart.map(c=>`${c.name}${c.perKg&&c.weight?` ${c.weight}kg`:''}×${c.qty}`).join(', '),total,metode:activePayMethod};
    transactions.push(txItem);
    saveTx();
    showSuccess(total,txItem.id);
  }
}

function showSuccess(total,txId){
  const change=activePayMethod==='tunai'?Math.max(0,parseFloat(document.getElementById('cashInput')?.value||0)-total):0;
  const isText = activePayMethod === 'pending' ? 'Pending berhasil disimpan' : 'Pembayaran berhasil';
  document.getElementById('modalContent').innerHTML=`
    <div class="success-modal">
      <div class="success-icon">✅</div>
      <h2>${isText}</h2>
      <p>Total: ${fmt(total)}</p>
      ${activePayMethod==='tunai'?`<p>Kembalian: ${fmt(change)}</p>`:``}
      ${txId?`<p style="font-size:.75rem;color:var(--text3)">No. Transaksi: ${txId}</p>`:''}
      <div class="modal-actions" style="margin-top:16px">
        ${txId?`<button class="btn-confirm" onclick="printStruk(${txId},${total})">🖨️ Cetak Struk</button>`:``}
        <button class="btn-confirm blue" onclick="finishTx()">Selesai</button>
      </div>
    </div>`;
}

function printStruk(txId,total){
  const tx = transactions.find(t=>t.id===txId);
  if(!tx) return;
  const doc=new jsPDF('p','mm','a4');
  const pageHeight=doc.internal.pageSize.height;
  let yPos=10;
  doc.setFontSize(14);
  doc.text(tokoConfig.nama||'LaundryPOS',105,yPos,{align:'center'});
  yPos+=8;
  doc.setFontSize(9);
  doc.text(tokoConfig.tagline||'kasir digital',105,yPos,{align:'center'});
  yPos+=10;
  doc.line(10,yPos,200,yPos);
  yPos+=5;
  doc.setFontSize(8);
  doc.text(`No. Transaksi: ${txId}`,15,yPos);
  yPos+=5;
  doc.text(`Waktu: ${tx.waktu}`,15,yPos);
  yPos+=5;
  doc.text(`Pelanggan: ${tx.customer}`,15,yPos);
  yPos+=10;
  doc.line(10,yPos,200,yPos);
  yPos+=5;
  doc.setFont(undefined,'bold');
  doc.text('Item',15,yPos);
  doc.text('Qty',100,yPos);
  doc.text('Total',170,yPos);
  yPos+=5;
  doc.setFont(undefined,'normal');
  doc.line(10,yPos,200,yPos);
  yPos+=5;
  tx.items.split(', ').forEach(item=>{
    if(yPos>260){doc.addPage();yPos=10;}
    doc.text(item.substring(0,40),15,yPos);
    yPos+=5;
  });
  yPos+=5;
  doc.line(10,yPos,200,yPos);
  yPos+=5;
  doc.setFont(undefined,'bold');
  doc.setFontSize(10);
  doc.text(`Total: ${fmt(total)}`,170,yPos,{align:'right'});
  yPos+=10;
  doc.setFontSize(8);
  doc.setFont(undefined,'normal');
  doc.text('Metode: '+tx.metode,15,yPos);
  yPos+=10;
  doc.line(10,yPos,200,yPos);
  yPos+=5;
  doc.text(tokoConfig.rekening||'BCA 1234567890 a/n Laundry Kami',105,yPos+5,{align:'center',fontSize:7});
  doc.save(`struk_${txId}.pdf`);
}

function finishTx(){
  clearCart();
  closeModal();
  buildCategories();
  renderCategories();
  renderProducts();
}

// ===== EDIT PENDING / ADD-ON FEATURE =====
function openEditPending(pendingIndex){
  const p = pendings[pendingIndex];
  editingPendingId = pendingIndex;
  activeCategory = 'Semua';
  
  document.getElementById('modalContent').innerHTML=`
    <div class="modal-title">📝 Edit Order - ${p.customer}</div>
    <div class="modal-info">
      <div class="modal-row"><span>Total Saat Ini</span><span class="mval">${fmt(p.total)}</span></div>
    </div>
    <div style="margin-bottom:12px">
      <div style="font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:8px">📌 Item Saat Ini</div>
      <div style="font-size:.82rem;color:var(--text2);background:var(--bg);padding:8px;border-radius:8px;margin-bottom:12px">${p.items}</div>
      
      <div style="font-size:.75rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:8px">➕ Tambah Item</div>
      <div id="addOnGrid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px;max-height:200px;overflow-y:auto;margin-bottom:12px"></div>
    </div>
    <div class="modal-actions">
      <button class="btn-cancel" onclick="closeModal()">Batal</button>
      <button class="btn-confirm" onclick="saveEditPending()">✓ Simpan Perubahan</button>
    </div>`;
  
  // Render add-on items
  const addOnGrid = document.getElementById('addOnGrid');
  addOnGrid.innerHTML = products.map((prod, idx) => `
    <button style="padding:8px;border:1.5px solid var(--border);border-radius:8px;background:var(--bg);cursor:pointer;font-size:.78rem;display:flex;flex-direction:column;align-items:center;gap:4px;transition:all .15s" 
      onmouseover="this.style.background='var(--accent2)'" 
      onmouseout="this.style.background='var(--bg)'"
      onclick="addItemToPending(${idx})">
      <span style="font-size:1.2rem">${prod.icon}</span>
      <span style="font-weight:700">${prod.name}</span>
      <span style="font-size:.7rem;color:var(--text3)">${fmt(prod.price)}</span>
    </button>
  `).join('');
  
  document.getElementById('modalOverlay').classList.add('open');
}

function addItemToPending(productIndex){
  const p = pendings[editingPendingId];
  const prod = products[productIndex];
  const itemStr = `${prod.name}×1`;
  p.items = p.items + ', ' + itemStr;
  p.total += prod.price;
  
  // Update UI
  const modal = document.getElementById('modalContent');
  const itemsDisplay = modal.querySelector('[style*="📌"]').nextElementSibling;
  itemsDisplay.innerHTML = p.items;
  
  const totalDisplay = modal.querySelector('.modal-row .mval');
  totalDisplay.innerHTML = fmt(p.total);
  
  alert(`✅ ${prod.name} ditambahkan!`);
}

function saveEditPending(){
  savePending();
  closeModal();
  renderPendingList();
  alert('✅ Order berhasil diperbarui!');
}

function openAddNotePending(pendingIndex){
  const p = pendings[pendingIndex];
  const newNote = prompt('📝 Edit Catatan untuk ' + p.customer + ':', p.note || '');
  if(newNote !== null){
    p.note = newNote;
    savePending();
    renderPendingList();
    alert('✅ Catatan berhasil disimpan!');
  }
}

// ===== ICON PICKER =====
let currentIconField = null;

function bukaIconPicker(fieldElement) {
  currentIconField = fieldElement;
  document.getElementById('iconPickerOverlay').classList.add('open');
  document.getElementById('iconPickerPopup').classList.add('open');
}

function tutupIconPicker() {
  document.getElementById('iconPickerOverlay').classList.remove('open');
  document.getElementById('iconPickerPopup').classList.remove('open');
  currentIconField = null;
}

function pilihIcon(icon) {
  if(currentIconField) {
    currentIconField.value = icon;
    tutupIconPicker();
  }
}

// ===== SETTINGS PAGE =====
function renderPengaturan(){
  document.getElementById('set-nama-toko').value = tokoConfig.nama || '';
  document.getElementById('set-tagline').value = tokoConfig.tagline || '';
  document.getElementById('set-rekening').value = tokoConfig.rekening || '';
  document.getElementById('set-ai-url').value = aiConfig.url || '';
  document.getElementById('set-ai-key').value = aiConfig.key || '';
  document.getElementById('set-ai-model').value = aiConfig.model || '';
  
  const serviceList = document.getElementById('serviceList');
  serviceList.innerHTML = products.map((p,i) => `
    <div class="service-row">
      <button class="icon-pick-btn" onclick="bukaIconPicker(this.nextElementSibling)"></button>
      <input type="text" class="icon-inp" value="${p.icon}" readonly style="width:40px">
      <input type="text" value="${p.name}" placeholder="Nama..." onchange="products[${i}].name=this.value">
      <input type="number" value="${p.price}" placeholder="Harga..." onchange="products[${i}].price=parseInt(this.value)">
      <button class="del-svc-btn" onclick="products.splice(${i},1);renderPengaturan()">🗑️</button>
    </div>
  `).join('');
}

function saveToko(){
  tokoConfig.nama = document.getElementById('set-nama-toko').value;
  tokoConfig.tagline = document.getElementById('set-tagline').value;
  tokoConfig.rekening = document.getElementById('set-rekening').value;
  localStorage.setItem('lpos_toko', JSON.stringify(tokoConfig));
  applyTokoConfig();
  document.getElementById('tokoSaved').style.display = 'inline';
  setTimeout(() => document.getElementById('tokoSaved').style.display = 'none', 2000);
}

function saveAI(){
  aiConfig.url = document.getElementById('set-ai-url').value;
  aiConfig.key = document.getElementById('set-ai-key').value;
  aiConfig.model = document.getElementById('set-ai-model').value;
  localStorage.setItem('lpos_ai', JSON.stringify(aiConfig));
  document.getElementById('aiSaved').style.display = 'inline';
  setTimeout(() => document.getElementById('aiSaved').style.display = 'none', 2000);
}

function testAI(){
  alert('Test koneksi AI...\nURL: '+aiConfig.url+'\nModel: '+aiConfig.model);
}

function addService(){
  const newId = Math.max(...products.map(p=>p.id), 0) + 1;
  products.push({id:newId,name:'Layanan Baru',cat:'Lainnya',icon:'✨',price:10000,unit:'per item',perKg:false});
  renderPengaturan();
}

function saveServices(){
  localStorage.setItem('lpos_services', JSON.stringify(products));
  buildCategories();
  renderCategories();
  renderProducts();
  document.getElementById('svcSaved').style.display = 'inline';
  setTimeout(() => document.getElementById('svcSaved').style.display = 'none', 2000);
}

// ===== LAPORAN PAGE =====
function renderLaporan(){
  const filtered = activeFilter === 'hari' ? transactions.filter(t=>fmtDate(t.waktu) === fmtDate(new Date())) :
                   activeFilter === 'minggu' ? transactions.filter(t=>new Date(t.waktu) > new Date(Date.now() - 7*24*60*60*1000)) :
                   activeFilter === 'bulan' ? transactions.filter(t=>new Date(t.waktu) > new Date(Date.now() - 30*24*60*60*1000)) :
                   transactions;
  
  const total = filtered.reduce((s,t)=>s+t.total,0);
  const count = filtered.length;
  
  document.getElementById('statsGrid').innerHTML = `
    <div class="stat-card accent">
      <div class="slbl">Total Transaksi</div>
      <div class="sval">${count}</div>
    </div>
    <div class="stat-card">
      <div class="slbl">Total Penjualan</div>
      <div class="sval">${fmt(total)}</div>
    </div>
  `;
  
  const txBody = document.getElementById('txBody');
  txBody.innerHTML = filtered.map((t,i) => `
    <tr>
      <td>${i+1}</td>
      <td>${t.waktu}</td>
      <td>${t.customer}</td>
      <td>${t.items}</td>
      <td>${fmt(t.total)}</td>
      <td><span class="bm bm-${t.metode}">${t.metode}</span></td>
      <td><button onclick="printStruk(${t.id},${t.total})">🖨️</button></td>
    </tr>
  `).join('');
}

function setFilter(f, btn){
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderLaporan();
}

function setLapTab(tab, btn){
  activeLapTab = tab;
  document.querySelectorAll('.lap-tab').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  if(tab === 'transaksi'){
    document.getElementById('lapTransaksi').style.display = 'block';
    document.getElementById('lapPending').style.display = 'none';
    renderLaporan();
  } else {
    document.getElementById('lapTransaksi').style.display = 'none';
    document.getElementById('lapPending').style.display = 'block';
    renderPendingList();
  }
}

function exportCSV(){
  const csv = [['#','Waktu','Pelanggan','Items','Total','Metode']];
  transactions.forEach((t,i)=>{
    csv.push([i+1,t.waktu,t.customer,t.items,t.total,t.metode]);
  });
  const csvContent = csv.map(row=>row.map(c=>`"${c}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], {type:'text/csv'});
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'laporan_transaksi.csv';
  a.click();
}

// ===== PENDING LIST =====
function renderPendingList(){
  const active = pendings.filter(p=>!p.done);
  const pendingCount = document.getElementById('pendingCount');
  if(active.length > 0) pendingCount.style.display = 'inline';
  pendingCount.textContent = active.length;
  
  const pendingList = document.getElementById('pendingList');
  if(active.length === 0){
    pendingList.innerHTML = '<div class="no-data">Tidak ada order pending</div>';
    return;
  }
  
  pendingList.innerHTML = active.map((p, idx)=>{
    const countdown = getCountdown(p.tglEst);
    return `
      <div class="pending-card">
        <div class="pending-card-header">
          <div><div class="pc-name">${p.customer}</div><div class="pc-phone">${p.phone||'-'}</div></div>
          <span class="pc-status">Pending</span>
        </div>
        <div class="pending-card-body">
          <div class="pc-dates">
            <div class="pc-date-box"><div class="pc-date-label">Masuk</div><div class="pc-date-val">${fmtDate(p.tglMasuk)}</div></div>
            <div class="pc-date-box"><div class="pc-date-label">Est. Selesai</div><div class="pc-date-val est">${fmtDate(p.tglEst)}</div></div>
          </div>
          <div class="pc-items">${p.items}</div>
          ${p.note ? `<div class="pc-note">📝 ${p.note}</div>` : ''}
          <div class="pc-countdown ${countdown.cls}">${countdown.text}</div>
        </div>
        <div class="pending-card-footer">
          <div class="pc-total">${fmt(p.total)}</div>
          <div class="pc-actions">
            <button class="selesai-btn" onclick="selesaiPending('${p.customer}')">✓ Selesai</button>
            <button class="kc-btn primary" style="padding:5px 10px;font-size:.75rem" onclick="openEditPending(${idx})">➕ Add On</button>
            <button class="kc-btn blue" style="padding:5px 10px;font-size:.75rem" onclick="openAddNotePending(${idx})">📝 Nota</button>
            <button class="batal-pending-btn" onclick="batalPending('${p.customer}')">✕ Batal</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function selesaiPending(customer){
  const p = pendings.find(x=>x.customer===customer);
  if(p) p.done=true;
  savePending();
  renderPendingList();
}

function batalPending(customer){
  pendings = pendings.filter(p=>p.customer!==customer);
  savePending();
  renderPendingList();
}

// ===== KURIR PAGE (Courier/Delivery) =====
function renderKurir(){
  document.getElementById('kurirList').innerHTML = '<div style="text-align:center;padding:40px;color:var(--text3)">Fitur Kurir sedang dikembangkan</div>';
}

function setKurirTab(tab, btn){
  document.querySelectorAll('#kurirTabs .filter-btn').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
}

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  buildCategories();
  renderCategories();
  renderProducts();
  applyTokoConfig();
  checkBanner();
});

// LOGIN PLACEHOLDER (implementation needed)
let currentUser = null;

function pinInput(digit){
  console.log('PIN digit:', digit);
}

function pinDelete(){
  console.log('PIN delete');
}

function doLogout(){
  currentUser = null;
  document.getElementById('page-login').classList.remove('hidden');
  document.getElementById('logoutBtn').style.display = 'none';
}
