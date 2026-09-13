// ============================================================
// J APP PRO POS — Google Sheets Sync
// ============================================================

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzOCSLX8xPYSW4hFqQFbRx3AMOuJmBdNJGeMvgM6SqufxeGILrKpbIPr_xgXdnuwr1e/exec';
const SYNC_QUEUE = 'lpos_sync_queue';
let syncInProgress = false;

// ============================================================
// SEND DATA (POST)
// ============================================================
async function syncToSheets(action, data) {
  if (!navigator.onLine) {
    console.log('📡 Offline — queued:', action);
    queueSync(action, data);
    return false;
  }

  try {
    const response = await fetch(SCRIPT_URL, {
      method: 'POST',
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (result.ok) {
      console.log('✅ Synced:', action);
      return true;
    } else {
      console.error('❌ Sync error:', result.error);
      queueSync(action, data); // Queue for retry
      return false;
    }
  } catch (err) {
    console.error('📡 Network error:', err.message);
    queueSync(action, data); // Queue for retry
    return false;
  }
}

// ============================================================
// SYNC TRANSAKSI
// ============================================================
async function syncTransaksi(tx) {
  return await syncToSheets('addTransaksi', {
    waktu: tx.time,
    namaPelanggan: tx.customer,
    noHP: tx.phone,
    items: tx.items,
    subtotal: tx.subtotal,
    diskon: tx.discount || 0,
    total: tx.total,
    metodeBayar: tx.method,
    kembalian: tx.kembalian || 0,
    kasir: currentUser?.nama || 'Unknown',
  });
}

// ============================================================
// SYNC PENDING
// ============================================================
async function syncPending(p, isNew = true) {
  if (isNew) {
    return await syncToSheets('addPending', {
      createdAt: p.id || new Date().toISOString(),
      tglMasuk: p.tglMasuk,
      tglEst: p.tglEst,
      namaPelanggan: p.customer,
      noHP: p.phone,
      items: p.items,
      subtotal: p.subtotal,
      diskon: p.discount || 0,
      total: p.total,
      catatan: p.note || '',
      status: p.status || 'PENDING',
      alamat: p.alamat || '',
      tipeOrder: p.tipeOrder || 'NORMAL',
      statusKurir: p.statusKurir || '',
      cod: p.cod || 'TIDAK',
      namaKurir: p.namaKurir || '',
    });
  } else {
    // Update existing pending
    return await syncToSheets('updatePending', {
      id: p.id,
      status: p.status,
      tglSelesai: p.doneTime || '',
      statusKurir: p.statusKurir,
      namaKurir: p.namaKurir,
      catatan: p.note || '',
    });
  }
}

// ============================================================
// SYNC LAYANAN
// ============================================================
async function syncLayanan(services) {
  return await syncToSheets('saveLayanan', { data: services });
}

// ============================================================
// FETCH DATA (GET)
// ============================================================
async function fetchFromSheets(action) {
  if (!navigator.onLine) {
    console.log('📡 Offline — cannot fetch');
    return null;
  }

  try {
    const response = await fetch(`${SCRIPT_URL}?action=${action}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const result = await response.json();
    if (result.ok) {
      console.log('✅ Fetched:', action);
      return result.data;
    } else {
      console.error('❌ Fetch error:', result.error);
      return null;
    }
  } catch (err) {
    console.error('📡 Network error:', err.message);
    return null;
  }
}

// ============================================================
// QUEUE SYSTEM (untuk retry offline)
// ============================================================
function queueSync(action, data) {
  const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE) || '[]');
  queue.push({
    action,
    data,
    timestamp: new Date().toISOString(),
  });
  localStorage.setItem(SYNC_QUEUE, JSON.stringify(queue));
  console.log('📋 Queued:', action, '| Total:', queue.length);
}

async function processQueue() {
  if (syncInProgress || !navigator.onLine) return;

  const queue = JSON.parse(localStorage.getItem(SYNC_QUEUE) || '[]');
  if (queue.length === 0) return;

  syncInProgress = true;
  console.log('🔄 Processing queue...');

  for (let i = 0; i < queue.length; i++) {
    const { action, data } = queue[i];
    const success = await syncToSheets(action, data);
    if (success) {
      queue.splice(i, 1);
      i--;
    } else {
      break; // Stop jika gagal, retry nanti
    }
  }

  localStorage.setItem(SYNC_QUEUE, JSON.stringify(queue));
  syncInProgress = false;
  console.log('✅ Queue processed. Remaining:', queue.length);
}

// ============================================================
// AUTO SYNC HANDLERS (panggil saat transaksi/pending)
// ============================================================
function onTransaksiSuccess(tx) {
  syncTransaksi(tx);
  processQueue(); // Coba process queue setelah sukses
}

function onPendingCreated(p) {
  syncPending(p, true);
  processQueue();
}

function onPendingUpdated(p) {
  syncPending(p, false);
  processQueue();
}

// ============================================================
// PERIODIC SYNC
// ============================================================
// Coba sync queue tiap 30 detik kalau online
setInterval(() => {
  if (navigator.onLine) {
    processQueue();
  }
}, 30000);

// Dengarkan perubahan online/offline
window.addEventListener('online', () => {
  console.log('🟢 Online — syncing queued data...');
  processQueue();
});

window.addEventListener('offline', () => {
  console.log('🔴 Offline — queuing data');
});
