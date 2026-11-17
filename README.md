# LP Luciano Lopes Advocacia — Previdenciário

Landing page estática (HTML/CSS/JS, sem build) — ADS BR.

- `index.html` — LP previdenciária (site `luciano-lopes`)
- `redirect.html` — obrigado → WhatsApp (11) 91159-2526, com mensagem conforme o assunto escolhido
- `config.js` — URL e chave pública do Supabase (projeto ADS BR CLIENTES `qxhnjzyhtllmtdrcyygi`)
- `app.js` — registro de visitas (`lp_visits`) e leads (`lp_leads`), UTMs, abas, FAQ e formulário
- `assets/` — imagens (Freepik, licenciadas) e logo

Fluxo: CTA → formulário (nome + WhatsApp) → grava em `lp_leads` (site `luciano-lopes`, coluna `servico` = assunto) → `/redirect` → WhatsApp.

Deploy: Vercel (projeto `lp-luciano-lopes`), sem build.
