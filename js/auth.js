// ===== AUTH MODULE =====
// Mengelola login, role, dan session management

const Auth = {
  // Get current user
  getCurrentUser() {
    const user = localStorage.getItem('lpos_user');
    return user ? JSON.parse(user) : null;
  },

  // Check if user is logged in
  isLoggedIn() {
    return !!this.getCurrentUser();
  },

  // Get user role
  getUserRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  },

  // Get username
  getUsername() {
    const user = this.getCurrentUser();
    return user ? user.username : 'Guest';
  },

  // Logout
  logout() {
    localStorage.removeItem('lpos_user');
    window.location.href = 'login.html';
  },

  // Check if user has specific role
  hasRole(role) {
    return this.getUserRole() === role;
  },

  // Check if user has any of the roles
  hasAnyRole(roles) {
    const userRole = this.getUserRole();
    return roles.includes(userRole);
  },

  // Redirect to login if not authenticated
  requireLogin() {
    if (!this.isLoggedIn()) {
      window.location.href = 'login.html';
    }
  },

  // Redirect if user doesn't have required role
  requireRole(role) {
    if (!this.hasRole(role)) {
      alert(`❌ Akses ditolak! Halaman ini hanya untuk ${role.toUpperCase()}.`);
      window.location.href = 'index.html';
    }
  },

  // Get display name for role
  getRoleDisplay(role) {
    const displays = {
      kasir: '🧾 Kasir',
      kurir: '🛵 Kurir',
      admin: '⚙️ Admin'
    };
    return displays[role] || role;
  }
};

// Auto-check login on page load
document.addEventListener('DOMContentLoaded', () => {
  Auth.requireLogin();
});
