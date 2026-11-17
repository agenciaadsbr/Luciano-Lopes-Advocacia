// Configuração pública da LP (a chave anon do Supabase é pública por design;
// só permite INSERT em lp_visits/lp_leads — a leitura dos leads exige login e é protegida por RLS).
window.LP_CONFIG = {
  site: 'luciano-lopes',
  cliente: 'Luciano Lopes Advocacia',
  whatsapp: '5511911592526',
  supabaseUrl: 'https://qxhnjzyhtllmtdrcyygi.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4aG5qenlodGxsbXRkcmN5eWdpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyMzczNjgsImV4cCI6MjA5NzgxMzM2OH0.DWf4I_x9F--H7ZZHUt_n4V3B__Nlsf1jNZdUV0vNBLU'
};
