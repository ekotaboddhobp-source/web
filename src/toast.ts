export const showToast = (message: string, type: string = 'error') => {
  if (!document.getElementById('toast-styles')) {
    const s = document.createElement('style');
    s.id = 'toast-styles';
    s.innerHTML = '.custom-toast{position:fixed;top:20px;left:50%;transform:translateX(-50%);padding:12px 20px;border-radius:12px;color:#fff;font-family:Hind Siliguri,sans-serif;font-weight:600;font-size:14px;z-index:99999;box-shadow:0 4px 15px rgba(0,0,0,0.2);animation:slideDownToast 0.3s ease-out;max-width:90%;text-align:center;display:flex;align-items:center;gap:8px}.custom-toast.error{background:#ff4757}.custom-toast.success{background:#2ed573}.custom-toast.info{background:#6C63FF}@keyframes slideDownToast{from{top:-50px;opacity:0}to{top:20px;opacity:1}}';
    document.head.appendChild(s);
  }
  const t = document.createElement('div');
  t.className = 'custom-toast ' + type;
  t.innerHTML = (type === 'error' ? '❌' : type === 'success' ? '✅' : 'ℹ️') + ' <span>' + message + '</span>';
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.transition = 'opacity 0.3s ease, top 0.3s ease';
    t.style.opacity = '0';
    t.style.top = '-50px';
    setTimeout(() => t.remove(), 300);
  }, 3000);
};