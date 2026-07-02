// ===== LAUNDRY POS - MAIN APPLICATION LOGIC =====

// ===== STATE =====
let tokoConfig = JSON.parse(localStorage.getItem('lpos_toko') || '{"nama":"LaundryPOS","tagline":"kasir digital","rekening":"BCA 1234567890 a/n Laundry Kami","logo":null}');
let logoData = null;

// ===== LOGO MANAGEMENT =====
function uploadLogo(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  // Validasi ukuran file (max 500KB)
  if (file.size > 500000) {
    alert('❌ Ukuran logo terlalu besar! Maksimal 500KB.');
    return;
  }
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result;
    tokoConfig.logo = base64;
    logoData = base64;
    localStorage.setItem('lpos_toko', JSON.stringify(tokoConfig));
    displayLogo();
    alert('✅ Logo berhasil diupload!');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function displayLogo() {
  const preview = document.getElementById('logoPreview');
  if (tokoConfig.logo) {
    preview.innerHTML = `<img src="${tokoConfig.logo}" alt="Logo" style="max-width:150px;max-height:80px">`;
    logoData = tokoConfig.logo;
  } else {
    preview.innerHTML = '<div style="color:var(--text3);font-size:.8rem">📸 Belum ada logo</div>';
    logoData = null;
  }
}

function clearLogo() {
  if (confirm('Hapus logo?')) {
    tokoConfig.logo = null;
    logoData = null;
    localStorage.setItem('lpos_toko', JSON.stringify(tokoConfig));
    displayLogo();
    alert('✅ Logo berhasil dihapus!');
  }
}

// ===== TOKO CONFIG =====
function renderPengaturan() {
  document.getElementById('set-nama-toko').value = tokoConfig.nama || '';
  document.getElementById('set-tagline').value = tokoConfig.tagline || '';
  document.getElementById('set-rekening').value = tokoConfig.rekening || '';
  displayLogo();
}

function saveToko() {
  tokoConfig.nama = document.getElementById('set-nama-toko').value;
  tokoConfig.tagline = document.getElementById('set-tagline').value;
  tokoConfig.rekening = document.getElementById('set-rekening').value;
  localStorage.setItem('lpos_toko', JSON.stringify(tokoConfig));
  document.getElementById('tokoSaved').style.display = 'inline';
  setTimeout(() => document.getElementById('tokoSaved').style.display = 'none', 2000);
}

// ===== PRINT STRUK DENGAN LOGO =====
function printStruk(txId, total) {
  const tx = transactions.find(t => t.id === txId);
  if (!tx) return;
  
  const doc = new jsPDF('p', 'mm', 'a4');
  let yPos = 10;
  
  // Tambah LOGO jika ada
  if (logoData) {
    doc.addImage(logoData, 'PNG', 75, yPos, 50, 30);
    yPos += 35;
  }
  
  // Nama Toko
  doc.setFontSize(14);
  doc.text(tokoConfig.nama || 'LaundryPOS', 105, yPos, { align: 'center' });
  yPos += 8;
  
  // Tagline
  doc.setFontSize(9);
  doc.text(tokoConfig.tagline || 'kasir digital', 105, yPos, { align: 'center' });
  yPos += 10;
  
  // Garis pembatas
  doc.line(10, yPos, 200, yPos);
  yPos += 5;
  
  // Detail transaksi
  doc.setFontSize(8);
  doc.text(`No. Transaksi: ${txId}`, 15, yPos);
  yPos += 5;
  doc.text(`Waktu: ${tx.waktu}`, 15, yPos);
  yPos += 5;
  doc.text(`Pelanggan: ${tx.customer}`, 15, yPos);
  yPos += 10;
  
  // Garis pembatas
  doc.line(10, yPos, 200, yPos);
  yPos += 5;
  
  // Header tabel
  doc.setFont(undefined, 'bold');
  doc.text('Item', 15, yPos);
  doc.text('Qty', 100, yPos);
  doc.text('Total', 170, yPos);
  yPos += 5;
  doc.setFont(undefined, 'normal');
  doc.line(10, yPos, 200, yPos);
  yPos += 5;
  
  // Items
  tx.items.split(', ').forEach(item => {
    if (yPos > 260) { doc.addPage(); yPos = 10; }
    doc.text(item.substring(0, 40), 15, yPos);
    yPos += 5;
  });
  
  yPos += 5;
  doc.line(10, yPos, 200, yPos);
  yPos += 5;
  
  // Total
  doc.setFont(undefined, 'bold');
  doc.setFontSize(10);
  doc.text(`Total: ${fmt(total)}`, 170, yPos, { align: 'right' });
  yPos += 10;
  
  // Metode pembayaran
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('Metode: ' + tx.metode, 15, yPos);
  yPos += 10;
  
  // Garis pembatas
  doc.line(10, yPos, 200, yPos);
  yPos += 5;
  
  // Rekening
  doc.text(tokoConfig.rekening || 'BCA 1234567890 a/n Laundry Kami', 105, yPos + 5, { align: 'center', fontSize: 7 });
  
  doc.save(`struk_${txId}.pdf`);
}

// ===== UTILITY FUNCTIONS =====
const fmt = n => 'Rp ' + Math.round(n).toLocaleString('id-ID');

// ===== INIT =====
window.addEventListener('DOMContentLoaded', () => {
  renderPengaturan();
});

// Placeholder untuk transaksi
let transactions = JSON.parse(localStorage.getItem('lpos_tx') || '[]');
