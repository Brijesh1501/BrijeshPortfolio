// ============================================
// config.js - Supabase Configuration
// ============================================

// 🔧 REPLACE THESE WITH YOUR SUPABASE CREDENTIALS
const SUPABASE_URL = 'https://qloliaaqyokakrvpnseq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp6cG5nc250eXRldmVlanZwaGJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NTA0MDUsImV4cCI6MjA4OTEyNjQwNX0.KculkXh7LRxd2zlxtjyzqkiwUEZyVU5fkIjeJ_wDM4U';

// Initialize Supabase client (loaded via CDN in HTML)
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// THEME MANAGER
// ============================================
const ThemeManager = {
  apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  },

  async load() {
    // Try local cache first for speed
    const cached = localStorage.getItem('theme');
    if (cached) this.apply(cached);

    // Then fetch from DB
    try {
      const { data } = await supabase
        .from('settings')
        .select('value')
        .eq('key', 'theme')
        .single();
      if (data?.value) this.apply(data.value);
    } catch (e) {
      console.log('Using cached theme');
    }
  }
};

// ============================================
// SETTINGS HELPER
// ============================================
const Settings = {
  cache: {},

  async getAll() {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      data.forEach(s => { this.cache[s.key] = s.value; });
    }
    return this.cache;
  },

  get(key) { return this.cache[key] || ''; },

  async update(key, value) {
    return await supabase
      .from('settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
  }
};

// ============================================
// NAVIGATION ACTIVE STATE
// ============================================
function setActiveNav() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function formatDate(dateStr) {
  if (!dateStr) return 'Present';
  const [month, year] = dateStr.split('/');
  const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[parseInt(month)]} ${year}`;
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Load theme on every page
ThemeManager.load();
