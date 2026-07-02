// ===== CSS STYLES =====
// Extracted from index.html <style> tag for better organization

export const cssStyles = `
:root {
  --bg:#f0ede8;--surface:#faf8f5;--border:#ddd8cf;
  --accent:#2e7d6b;--accent2:#e8f5f1;--accent3:#1a5c4e;
  --danger:#c0392b;--danger-bg:#fdf2f0;
  --warn:#d97706;--warn-bg:#fffbeb;
  --blue:#1d6fa4;--blue-bg:#e8f2fb;
  --purple:#7c3aed;--purple-bg:#f5f3ff;
  --text:#1c1a17;--text2:#6b6355;--text3:#9d9185;
  --shadow:0 2px 12px rgba(0,0,0,.08);--shadow-lg:0 8px 32px rgba(0,0,0,.14);
  --radius:14px;--radius-sm:8px;
}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Nunito',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

/* HEADER */
header{background:var(--accent);color:white;padding:0 16px;height:56px;display:flex;align-items:center;justify-content:space-between;box-shadow:0 2px 16px rgba(46,125,107,.3);position:sticky;top:0;z-index:100}
.logo{font-family:'DM Serif Display',serif;font-size:1.2rem;cursor:pointer}
.logo span{font-style:italic;opacity:.7;font-size:.85rem;margin-left:4px}
.nav-tabs{display:flex;gap:2px;background:rgba(255,255,255,.15);border-radius:10px;padding:3px}
.nav-tab{padding:5px 12px;border-radius:7px;cursor:pointer;font-weight:700;font-size:.78rem;color:rgba(255,255,255,.7);border:none;background:none;transition:all .2s;white-space:nowrap}
.nav-tab.active{background:white;color:var(--accent)}
.clock{font-family:'DM Mono',monospace;font-size:.78rem;opacity:.85;white-space:nowrap}

.page{display:none}
.page.active{display:flex}

/* BANNER */
.banner-wrap{position:sticky;top:56px;z-index:90}
.banner{padding:10px 16px;font-size:.82rem;font-weight:700;display:flex;align-items:center;gap:8px;cursor:pointer;transition:all .2s}
.banner.warn{background:#fef3c7;color:var(--warn);border-bottom:2px solid #fcd34d}
.banner.danger{background:#fee2e2;color:var(--danger);border-bottom:2px solid #fca5a5}
.banner-close{margin-left:auto;opacity:.6;font-size:1rem}

/* LOGIN PAGE */
#page-login{position:fixed;inset:0;background:var(--accent);z-index:999;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0}
#page-login.hidden{display:none}
.login-box{background:var(--surface);border-radius:24px;padding:32px 28px;width:320px;max-width:92vw;display:flex;flex-direction:column;align-items:center;gap:18px;box-shadow:var(--shadow-lg)}
.login-logo{font-family:'DM Serif Display',serif;font-size:1.5rem;color:var(--accent);text-align:center}
.login-logo span{font-style:italic;opacity:.6;font-size:1rem;display:block;margin-top:2px}
.login-title{font-size:.78rem;font-weight:800;text-transform:uppercase;letter-spacing:.8px;color:var(--text3);text-align:center}
.pin-display{display:flex;gap:10px;margin:4px 0}
.pin-dot{width:16px;height:16px;border-radius:50%;border:2.5px solid var(--border);background:transparent;transition:all .15s}
.pin-dot.filled{background:var(--accent);border-color:var(--accent)}
.pin-dot.error{background:var(--danger);border-color:var(--danger)}
.pin-pad{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;width:100%}
.pin-btn{padding:16px 8px;border-radius:var(--radius);border:2px solid var(--border);background:var(--bg);font-family:'DM Mono',monospace;font-size:1.3rem;font-weight:500;cursor:pointer;transition:all .15s}
.pin-btn:hover{border-color:var(--accent);background:var(--accent2)}
.pin-btn:active{transform:scale(.93)}
.pin-btn.del{font-size:1rem;color:var(--text3)}
.pin-btn.del:hover{border-color:var(--danger);color:var(--danger);background:var(--danger-bg)}
.pin-btn.empty{border-color:transparent;background:transparent;cursor:default}
.pin-btn.empty:hover{border-color:transparent;background:transparent;transform:none}
.login-error{font-size:.8rem;color:var(--danger);font-weight:700;text-align:center;min-height:20px}
.logout-btn{background:rgba(255,255,255,.15);border:none;color:white;border-radius:8px;padding:5px 10px;font-family:'Nunito',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;transition:all .2s}
.logout-btn:hover{background:rgba(255,255,255,.25)}
.user-info{font-size:.72rem;opacity:.8;white-space:nowrap}

/* KASIR PAGE */
#page-kasir{flex-direction:column;height:calc(100vh - 56px);overflow:hidden}
.kasir-inner{display:flex;flex:1;overflow:hidden;min-height:0}
.product-panel{flex:1;display:flex;flex-direction:column;overflow:hidden;padding:12px 12px 12px 14px;gap:10px;min-width:0}
.search-input{width:100%;padding:8px 13px;border:2px solid var(--border);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.88rem;background:var(--surface);outline:none;transition:border .2s}
.search-input:focus{border-color:var(--accent)}
.cat-filter{display:flex;gap:6px;overflow-x:auto;padding-bottom:2px;flex-shrink:0}
.cat-filter::-webkit-scrollbar{display:none}
.cat-btn{padding:4px 12px;border-radius:20px;border:2px solid var(--border);background:var(--surface);font-family:'Nunito',sans-serif;font-size:.75rem;font-weight:700;cursor:pointer;white-space:nowrap;transition:all .15s}
.cat-btn.active{border-color:var(--accent);background:var(--accent);color:white}
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(108px,1fr));gap:8px;overflow-y:auto;align-content:start}
.product-grid::-webkit-scrollbar{width:3px}
.product-grid::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
.product-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);cursor:pointer;transition:all .15s;position:relative;overflow:hidden;aspect-ratio:1/1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px}
.product-card:hover{border-color:var(--accent);box-shadow:var(--shadow);transform:translateY(-2px)}
.product-card:active{transform:scale(.96)}
.product-card.in-cart{border-color:var(--accent);background:var(--accent2)}
.p-icon{font-size:1.5rem;line-height:1}
.p-name{font-size:.7rem;font-weight:700;line-height:1.2;color:var(--text)}
.p-unit{font-size:.6rem;color:var(--text3);font-weight:600}
.p-price{font-family:'DM Mono',monospace;font-size:.7rem;color:var(--accent);margin-top:1px}
.p-badge{position:absolute;top:4px;right:4px;background:var(--accent);color:white;border-radius:8px;padding:0 5px;font-size:.62rem;font-weight:800;line-height:17px;height:17px}

/* CART */
.cart-panel{width:310px;min-width:290px;background:var(--surface);border-left:2px solid var(--border);display:flex;flex-direction:column;overflow:hidden;flex-shrink:0}
.cart-header{padding:12px 14px 10px;border-bottom:2px solid var(--border);display:flex;justify-content:space-between;align-items:center}
.cart-title{font-family:'DM Serif Display',serif;font-size:1.05rem}
.cart-clear{font-size:.7rem;color:var(--danger);cursor:pointer;font-weight:700;padding:3px 8px;border-radius:6px;border:1.5px solid var(--danger);background:none;transition:all .15s}
.cart-clear:hover{background:var(--danger-bg)}
.customer-section{padding:9px 14px;border-bottom:2px solid var(--border);display:flex;flex-direction:column;gap:6px}
.customer-section label{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3)}
.customer-section input{padding:6px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.83rem;background:var(--bg);outline:none;transition:border .2s}
.customer-section input:focus{border-color:var(--accent)}
.cart-items{flex:1;overflow-y:auto;padding:9px 11px;display:flex;flex-direction:column;gap:6px}
.cart-items::-webkit-scrollbar{width:3px}
.cart-empty{text-align:center;color:var(--text3);padding:28px 14px;font-size:.83rem}
.cart-empty .e-icon{font-size:2rem;margin-bottom:6px}
.cart-item{background:var(--bg);border-radius:var(--radius-sm);padding:8px 9px;display:flex;align-items:center;gap:7px;border:1.5px solid var(--border);animation:slideIn .15s ease}
@keyframes slideIn{from{opacity:0;transform:translateX(8px)}to{opacity:1;transform:translateX(0)}}
.ci-icon{font-size:1.1rem;flex-shrink:0}
.ci-info{flex:1;min-width:0}
.ci-name{font-size:.78rem;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ci-price{font-family:'DM Mono',monospace;font-size:.73rem;color:var(--accent)}
.qty-ctrl{display:flex;align-items:center;gap:4px;flex-shrink:0}
.qty-btn{width:20px;height:20px;border-radius:5px;border:1.5px solid var(--border);background:var(--surface);cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;transition:all .15s}
.qty-btn:hover{border-color:var(--accent);color:var(--accent)}
.qty-num{font-family:'DM Mono',monospace;font-size:.8rem;min-width:16px;text-align:center}
.ci-del{color:var(--text3);cursor:pointer;font-size:.85rem;background:none;border:none;padding:2px;transition:color .1s}
.ci-del:hover{color:var(--danger)}
.ci-weight{font-size:.68rem;color:var(--blue);font-weight:700;background:var(--blue-bg);border-radius:4px;padding:1px 5px;margin-top:1px;display:inline-block}
.cart-footer{border-top:2px solid var(--border);padding:10px 14px;display:flex;flex-direction:column;gap:7px}
.sum-row{display:flex;justify-content:space-between;font-size:.82rem;color:var(--text2)}
.sum-row.total{font-size:.98rem;font-weight:800;color:var(--text);padding-top:6px;border-top:1.5px dashed var(--border)}
.sum-row .mono{font-family:'DM Mono',monospace}
.disc-row{display:flex;align-items:center;gap:6px;font-size:.78rem;color:var(--text2)}
.disc-row input{width:56px;padding:3px 6px;border:1.5px solid var(--border);border-radius:6px;font-family:'DM Mono',monospace;font-size:.78rem;outline:none;background:var(--bg);text-align:right}
.disc-row input:focus{border-color:var(--accent)}
.btn-row{display:flex;gap:6px}
.bayar-btn{flex:1;background:var(--accent);color:white;border:none;border-radius:var(--radius);padding:11px 7px;font-family:'Nunito',sans-serif;font-size:.88rem;font-weight:800;cursor:pointer;transition:all .15s}
.bayar-btn:hover{background:var(--accent3);transform:translateY(-1px)}
.bayar-btn:disabled{background:var(--border);cursor:not-allowed;transform:none;color:var(--text3)}
.pending-btn{background:var(--blue-bg);color:var(--blue);border:2px solid #93c5fd;border-radius:var(--radius);padding:11px 7px;font-family:'Nunito',sans-serif;font-size:.8rem;font-weight:800;cursor:pointer;transition:all .15s}
.pending-btn:hover{background:#dbeafe}
.pending-btn:disabled{opacity:.4;cursor:not-allowed}
.scan-btn{width:100%;padding:8px;border-radius:var(--radius-sm);border:2px dashed var(--blue);background:var(--blue-bg);color:var(--blue);font-family:'Nunito',sans-serif;font-weight:800;font-size:.75rem;cursor:pointer;transition:all .15s}
.scan-btn:hover{background:#dbeafe}
.pending-badge{background:var(--blue);color:white;border-radius:8px;padding:1px 6px;font-size:.65rem;font-weight:800;margin-left:4px}

/* MODAL */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:200;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity .2s}
.modal-overlay.open{opacity:1;pointer-events:all}
.modal{background:var(--surface);border-radius:20px;padding:22px;width:370px;max-width:95vw;max-height:90vh;overflow-y:auto;transform:scale(.95);transition:transform .2s;box-shadow:var(--shadow-lg)}
.modal-overlay.open .modal{transform:scale(1)}
.modal-title{font-family:'DM Serif Display',serif;font-size:1.2rem;margin-bottom:16px;text-align:center}
.modal-info{background:var(--bg);border-radius:var(--radius-sm);padding:11px 13px;margin-bottom:13px;display:flex;flex-direction:column;gap:5px}
.modal-row{display:flex;justify-content:space-between;font-size:.85rem}
.modal-row.big{font-size:1rem;font-weight:800;padding-top:6px;margin-top:3px;border-top:1.5px dashed var(--border)}
.modal-row .mval{font-family:'DM Mono',monospace}
.pay-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:13px}
.pay-tab{padding:8px 3px;border-radius:var(--radius-sm);border:2px solid var(--border);background:var(--bg);cursor:pointer;font-family:'Nunito',sans-serif;font-size:.72rem;font-weight:700;text-align:center;transition:all .15s}
.pay-tab.active{border-color:var(--accent);background:var(--accent2);color:var(--accent3)}
.pay-tab.blue-tab.active{border-color:var(--blue);background:var(--blue-bg);color:var(--blue)}
.pay-tab .pt-icon{font-size:1.1rem;display:block;margin-bottom:2px}
.tunai-section label{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);display:block;margin-bottom:4px}
.tunai-section input{width:100%;padding:8px 12px;border:2px solid var(--border);border-radius:var(--radius-sm);font-family:'DM Mono',monospace;font-size:.98rem;outline:none;margin-bottom:8px;background:var(--bg);transition:border .2s}
.tunai-section input:focus{border-color:var(--accent)}
.kembalian-box{background:var(--accent2);border:2px solid var(--accent);border-radius:var(--radius-sm);padding:8px 12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}
.kembalian-box .lbl{font-size:.8rem;font-weight:700;color:var(--accent3)}
.kembalian-box .val{font-family:'DM Mono',monospace;font-size:1rem;font-weight:700;color:var(--accent3)}
.pending-form{background:var(--blue-bg);border:2px solid #93c5fd;border-radius:var(--radius-sm);padding:13px;margin-bottom:13px;display:flex;flex-direction:column;gap:9px}
.pending-form .pf-label{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--blue);display:block;margin-bottom:3px}
.pending-form input,.pending-form select{width:100%;padding:7px 10px;border:1.5px solid #93c5fd;border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.83rem;background:white;outline:none;transition:border .2s}
.pending-form input:focus,.pending-form select:focus{border-color:var(--blue)}
.pf-hint{font-size:.68rem;color:var(--blue);opacity:.8;margin-top:2px}
.transfer-box{background:var(--accent2);border:2px solid var(--accent);border-radius:var(--radius-sm);padding:11px 13px;margin-bottom:13px;text-align:center;color:var(--accent3);font-weight:700;font-size:.85rem}
.modal-actions{display:flex;gap:7px}
.btn-cancel{flex:1;padding:10px;border-radius:var(--radius);border:2px solid var(--border);background:none;font-family:'Nunito',sans-serif;font-weight:700;cursor:pointer;color:var(--text2);transition:all .15s}
.btn-cancel:hover{background:var(--bg)}
.btn-confirm{flex:2;padding:10px;border-radius:var(--radius);border:none;background:var(--accent);color:white;font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;cursor:pointer;transition:all .15s}
.btn-confirm:hover{background:var(--accent3)}
.btn-confirm.blue{background:var(--blue)}
.btn-confirm.blue:hover{background:#155e8a}

/* SCAN MODAL */
.scan-drop{border:2px dashed var(--blue);border-radius:var(--radius);padding:28px 16px;text-align:center;cursor:pointer;transition:all .2s;color:var(--blue);background:var(--blue-bg);margin-bottom:13px}
.scan-drop:hover{background:#dbeafe}
.scan-drop .sd-icon{font-size:2.2rem;margin-bottom:6px}
.scan-drop p{font-size:.83rem;font-weight:700}
.scan-drop small{font-size:.72rem;opacity:.7}
.scan-preview{width:100%;border-radius:var(--radius-sm);margin-bottom:12px;max-height:200px;object-fit:contain}
.scan-result-box{background:var(--accent2);border:2px solid var(--accent);border-radius:var(--radius-sm);padding:10px 13px;display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}
.scan-result-box .sr-label{font-size:.8rem;color:var(--accent3);font-weight:700}
.scan-result-box .sr-val{font-family:'DM Mono',monospace;font-size:1.2rem;font-weight:700;color:var(--accent)}
.scan-loading{text-align:center;padding:20px;color:var(--blue);font-weight:700;font-size:.88rem}
.scan-loading .spin{font-size:1.5rem;display:block;animation:spin 1s linear infinite;margin-bottom:6px}
@keyframes spin{to{transform:rotate(360deg)}}

/* SUCCESS */
.success-modal{text-align:center;padding:6px 0}
.success-icon{font-size:2.6rem;margin-bottom:7px;animation:pop .4s cubic-bezier(.175,.885,.32,1.275)}
@keyframes pop{from{transform:scale(0)}to{transform:scale(1)}}
.success-modal h2{font-family:'DM Serif Display',serif;font-size:1.25rem;margin-bottom:5px;color:var(--accent)}
.success-modal p{font-size:.85rem;color:var(--text2);margin-bottom:3px}
.kembalian-besar{font-family:'DM Mono',monospace;font-size:1.4rem;color:var(--accent);font-weight:700;margin:9px 0}
.btn-selesai{margin-top:12px;width:100%;padding:11px;border-radius:var(--radius);border:none;background:var(--accent);color:white;font-family:'Nunito',sans-serif;font-weight:800;font-size:.93rem;cursor:pointer;transition:all .15s}
.btn-selesai:hover{background:var(--accent3)}

/* LAPORAN PAGE */
#page-laporan{flex-direction:column;overflow-y:auto}
.lap-inner{padding:18px 22px;display:flex;flex-direction:column;gap:16px;max-width:1100px;width:100%;margin:0 auto}
.lap-header{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.lap-title{font-family:'DM Serif Display',serif;font-size:1.35rem}
.lap-tabs{display:flex;gap:5px;flex-wrap:wrap}
.lap-tab{padding:5px 13px;border-radius:20px;border:2px solid var(--border);background:var(--surface);font-family:'Nunito',sans-serif;font-size:.78rem;font-weight:700;cursor:pointer;color:var(--text2);transition:all .15s}
.lap-tab.active{border-color:var(--accent);background:var(--accent);color:white}
.lap-tab.blue-active.active{border-color:var(--blue);background:var(--blue)}
.filter-row{display:flex;gap:5px;flex-wrap:wrap;align-items:center}
.filter-btn{padding:4px 12px;border-radius:20px;border:2px solid var(--border);background:var(--surface);font-family:'Nunito',sans-serif;font-size:.76rem;font-weight:700;cursor:pointer;color:var(--text2);transition:all .15s}
.filter-btn.active{border-color:var(--accent);background:var(--accent);color:white}
.export-btn{padding:5px 14px;border-radius:20px;border:2px solid var(--purple);background:var(--purple-bg);font-family:'Nunito',sans-serif;font-size:.76rem;font-weight:700;cursor:pointer;color:var(--purple);transition:all .15s}
.export-btn:hover{background:#ede9fe}
.stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(155px,1fr));gap:11px}
.stat-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:14px 16px;display:flex;flex-direction:column;gap:3px}
.slbl{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text3)}
.sval{font-family:'DM Mono',monospace;font-size:1.3rem;color:var(--accent)}
.ssub{font-size:.72rem;color:var(--text3)}
.stat-card.accent{background:var(--accent);border-color:var(--accent)}
.stat-card.accent .slbl{color:rgba(255,255,255,.65)}
.stat-card.accent .sval,.stat-card.accent .ssub{color:rgba(255,255,255,.9)}
.stat-card.blue-card{background:var(--blue-bg);border-color:#93c5fd}
.stat-card.blue-card .sval{color:var(--blue)}
.chart-box{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:16px}
.chart-box h3{font-size:.83rem;font-weight:800;margin-bottom:12px}
.bar-chart{display:flex;gap:7px;align-items:flex-end;height:120px}
.bar-col{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px}
.bar-fill{width:100%;background:var(--accent);border-radius:5px 5px 0 0;transition:height .4s ease;min-height:3px;position:relative;cursor:pointer}
.bar-fill:hover{background:var(--accent3)}
.bar-fill .bar-tip{position:absolute;top:-26px;left:50%;transform:translateX(-50%);background:var(--text);color:white;font-family:'DM Mono',monospace;font-size:.62rem;padding:2px 5px;border-radius:4px;opacity:0;transition:opacity .2s}
.bar-fill:hover .bar-tip{opacity:1}
.bar-label{font-size:.65rem;color:var(--text3);font-weight:700}
.section-label{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.6px;color:var(--text3)}
.tx-wrap{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);overflow:hidden}
.tx-table{width:100%;border-collapse:collapse;font-size:.82rem}
.tx-table th{background:var(--bg);padding:9px 13px;text-align:left;font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);border-bottom:2px solid var(--border)}
.tx-table td{padding:9px 13px;border-bottom:1.5px solid var(--border);vertical-align:middle}
.tx-table tr:last-child td{border-bottom:none}
.tx-table tr:hover td{background:var(--bg)}
.mono{font-family:'DM Mono',monospace}
.bm{display:inline-block;padding:2px 7px;border-radius:9px;font-size:.68rem;font-weight:700}
.bm-tunai{background:#e8f5e9;color:#2e7d32}
.bm-transfer{background:#e3f2fd;color:#1565c0}
.bm-qris{background:#f3e5f5;color:#7b1fa2}
.bm-pending{background:var(--blue-bg);color:var(--blue)}
.no-data{text-align:center;padding:32px;color:var(--text3);font-size:.86rem}

/* PENDING LIST */
.pending-list{display:flex;flex-direction:column;gap:9px}
.pending-card{background:var(--surface);border:2px solid #93c5fd;border-radius:var(--radius);overflow:hidden}
.pending-card-header{background:var(--blue-bg);padding:9px 13px;display:flex;justify-content:space-between;align-items:center;gap:7px}
.pc-name{font-weight:800;font-size:.88rem;color:var(--blue)}
.pc-phone{font-size:.72rem;color:var(--text3)}
.pc-status{display:inline-flex;align-items:center;gap:3px;font-size:.7rem;font-weight:800;padding:3px 8px;border-radius:10px;background:var(--blue);color:white}
.pending-card-body{padding:11px 13px;display:flex;flex-direction:column;gap:7px}
.pc-dates{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.pc-date-box{background:var(--bg);border-radius:var(--radius-sm);padding:7px 9px}
.pc-date-label{font-size:.62rem;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--text3);margin-bottom:2px}
.pc-date-val{font-size:.8rem;font-weight:700}
.pc-date-val.est{color:var(--accent)}
.pc-countdown{font-size:.68rem;color:var(--text3);margin-top:1px}
.pc-countdown.overdue{color:var(--danger);font-weight:700}
.pc-countdown.today{color:var(--warn);font-weight:700}
.pc-items{font-size:.76rem;color:var(--text2);line-height:1.5}
.pc-note{font-size:.72rem;color:var(--text3);font-style:italic}
.pending-card-footer{padding:9px 13px;border-top:1.5px solid #dbeafe;display:flex;justify-content:space-between;align-items:center}
.pc-total{font-family:'DM Mono',monospace;font-size:.95rem;font-weight:700;color:var(--blue)}
.pc-actions{display:flex;gap:6px}
.selesai-btn{background:var(--accent);color:white;border:none;border-radius:8px;padding:5px 12px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.76rem;cursor:pointer;transition:all .15s}
.selesai-btn:hover{background:var(--accent3)}
.batal-pending-btn{background:none;color:var(--danger);border:1.5px solid var(--danger);border-radius:8px;padding:4px 9px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.72rem;cursor:pointer;transition:all .15s}
.batal-pending-btn:hover{background:var(--danger-bg)}

/* KURIR PAGE */
#page-kurir{flex-direction:column;overflow-y:auto}
.kurir-card{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:14px 16px;display:flex;flex-direction:column;gap:8px}
.kurir-card.jemput{border-color:#93c5fd}
.kurir-card.antar{border-color:#86efac}
.kc-header{display:flex;justify-content:space-between;align-items:center}
.kc-name{font-weight:800;font-size:.92rem}
.kc-badge{font-size:.68rem;font-weight:800;padding:3px 9px;border-radius:10px}
.kc-badge.jemput{background:var(--blue-bg);color:var(--blue)}
.kc-badge.antar{background:#dcfce7;color:#166534}
.kc-badge.selesai{background:#f0fdf4;color:#15803d}
.kc-info{font-size:.78rem;color:var(--text2);display:flex;flex-direction:column;gap:3px}
.kc-info a{color:var(--blue);font-weight:700;text-decoration:none}
.kc-info a:hover{text-decoration:underline}
.kc-total{font-family:'DM Mono',monospace;font-size:.92rem;font-weight:700;color:var(--accent)}
.kc-cod{background:#fef3c7;color:var(--warn);border-radius:6px;padding:2px 8px;font-size:.7rem;font-weight:700}
.kc-actions{display:flex;gap:7px;flex-wrap:wrap}
.kc-btn{padding:7px 14px;border-radius:8px;border:none;font-family:'Nunito',sans-serif;font-weight:800;font-size:.78rem;cursor:pointer;transition:all .15s}
.kc-btn.primary{background:var(--accent);color:white}
.kc-btn.primary:hover{background:var(--accent3)}
.kc-btn.blue{background:var(--blue);color:white}
.kc-btn.blue:hover{background:#155e8a}
.kc-btn.outline{background:none;border:1.5px solid var(--border);color:var(--text2)}
.kc-btn.outline:hover{border-color:var(--accent);color:var(--accent)}

/* PENGATURAN PAGE */
#page-pengaturan{flex-direction:column;overflow-y:auto}
.set-inner{padding:18px 22px;display:flex;flex-direction:column;gap:20px;max-width:700px;width:100%;margin:0 auto}
.set-section{background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:18px 20px;display:flex;flex-direction:column;gap:14px}
.set-section-title{font-family:'DM Serif Display',serif;font-size:1.05rem;margin-bottom:2px}
.set-field{display:flex;flex-direction:column;gap:5px}
.set-field label{font-size:.68rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3)}
.set-field input{padding:8px 12px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.88rem;background:var(--bg);outline:none;transition:border .2s}
.set-field input:focus{border-color:var(--accent)}
.set-field small{font-size:.72rem;color:var(--text3)}
.set-save-btn{background:var(--accent);color:white;border:none;border-radius:var(--radius);padding:10px 20px;font-family:'Nunito',sans-serif;font-weight:800;font-size:.9rem;cursor:pointer;align-self:fit-content;transition:all .15s}
.set-save-btn:hover{background:var(--accent3)}
.set-saved{color:var(--accent);font-size:.8rem;font-weight:700;display:none}

/* Layanan editor */
.service-list{display:flex;flex-direction:column;gap:7px}
.service-row{display:grid;grid-template-columns:2.5rem 1fr 1fr auto;gap:7px;align-items:center}
.service-row input{padding:6px 10px;border:1.5px solid var(--border);border-radius:var(--radius-sm);font-family:'Nunito',sans-serif;font-size:.83rem;background:var(--bg);outline:none;transition:border .2s}
.service-row input:focus{border-color:var(--accent)}
.service-row .icon-inp{text-align:center;font-size:1rem}
/* Icon Picker */
.icon-pick-btn{width:2.5rem;height:2.5rem;border-radius:var(--radius-sm);border:1.5px solid var(--border);background:var(--bg);font-size:1.3rem;cursor:pointer;transition:all .15s;display:flex;align-items:center;justify-content:center}
.icon-pick-btn:hover{border-color:var(--accent);background:var(--accent2)}
.icon-picker-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:998;display:none}
.icon-picker-overlay.open{display:block}
.icon-picker-popup{position:fixed;z-index:999;background:var(--surface);border:2px solid var(--border);border-radius:var(--radius);padding:12px;box-shadow:var(--shadow-lg);width:280px;max-height:60vh;overflow-y:auto;display:none;animation:popupSlide .2s ease}
.icon-picker-popup.open{display:block}
@keyframes popupSlide{from{transform:scale(.9);opacity:0}to{transform:scale(1);opacity:1}}
.icon-picker-title{font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.5px;color:var(--text3);margin-bottom:8px}
.icon-picker-section{margin-bottom:8px}
.icon-picker-section-label{font-size:.65rem;font-weight:700;color:var(--text3);margin-bottom:4px;text-transform:uppercase}
.icon-picker-grid{display:flex;flex-wrap:wrap;gap:4px}
.icon-option{width:32px;height:32px;border-radius:6px;border:1.5px solid var(--border);background:var(--bg);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .1s}
.icon-option:hover{border-color:var(--accent);background:var(--accent2);transform:scale(1.1)}
.del-svc-btn{background:none;border:none;color:var(--text3);cursor:pointer;font-size:1rem;padding:4px;transition:color .1s}
.del-svc-btn:hover{color:var(--danger)}
.add-svc-btn{background:var(--accent2);color:var(--accent3);border:2px dashed var(--accent);border-radius:var(--radius-sm);padding:8px;font-family:'Nunito',sans-serif;font-weight:700;font-size:.8rem;cursor:pointer;transition:all .15s;width:100%}
.add-svc-btn:hover{background:var(--accent);color:white}
.svc-header{display:grid;grid-template-columns:2.5rem 1fr 1fr auto;gap:7px;padding:0 2px}
.svc-header span{font-size:.65rem;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:var(--text3)}

@media(max-width:680px){
  #page-kasir .kasir-inner{flex-direction:column}
  .cart-panel{width:100%;min-width:unset;border-left:none;border-top:2px solid var(--border);max-height:52vh}
  .product-panel{max-height:44vh;padding:8px}
  .product-grid{grid-template-columns:repeat(auto-fill,minmax(88px,1fr));gap:7px}
}
`;

export default cssStyles;
