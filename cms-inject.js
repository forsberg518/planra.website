(async () => {
  function esc(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function set(sel, val) {
    const el = document.querySelector(sel);
    if (el && val !== undefined) el.textContent = val;
  }

  function setSrc(sel, val) {
    const el = document.querySelector(sel);
    if (el && val !== undefined) el.src = val;
  }

  function attachFaqListeners() {
    document.querySelectorAll('.faq-trigger-index').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.faq-item-index');
        const answer = item.querySelector('.faq-answer-index');
        const icon = trigger.querySelector('.faq-icon-index');
        const isOpen = answer.style.gridTemplateRows === '1fr';
        document.querySelectorAll('.faq-item-index').forEach(el => {
          el.querySelector('.faq-answer-index').style.gridTemplateRows = '0fr';
          el.querySelector('.faq-icon-index').style.transform = 'rotate(0deg)';
        });
        if (!isOpen) {
          answer.style.gridTemplateRows = '1fr';
          icon.style.transform = 'rotate(45deg)';
        }
      });
    });
  }

  try {
    const res = await fetch('/content.json?v=' + Date.now());
    if (!res.ok) return;
    const c = await res.json();

    // Hero
    set('[data-cms="hero_badge"]', c.hero_badge);
    set('[data-cms="hero_tittel_1"]', c.hero_tittel_1);
    set('[data-cms="hero_tittel_highlight"]', c.hero_tittel_highlight);
    set('[data-cms="hero_tittel_3"]', c.hero_tittel_3);
    set('[data-cms="hero_tekst"]', c.hero_tekst);

    // Trener
    set('[data-cms="trener_overskrift"]', c.trener_overskrift);
    set('[data-cms="trener_overskrift_highlight"]', c.trener_overskrift_highlight);
    set('[data-cms="trener_tekst"]', c.trener_tekst);
    setSrc('[data-cms-src="trener_bilde"]', c.trener_bilde);
    (c.trener_funksjoner || []).forEach((f, i) => {
      set(`[data-cms="trener_f${i + 1}_tittel"]`, f.tittel);
      set(`[data-cms="trener_f${i + 1}_tekst"]`, f.beskrivelse);
    });

    // Kunde
    set('[data-cms="kunde_overskrift"]', c.kunde_overskrift);
    set('[data-cms="kunde_overskrift_highlight"]', c.kunde_overskrift_highlight);
    set('[data-cms="kunde_tekst"]', c.kunde_tekst);
    setSrc('[data-cms-src="kunde_bilde"]', c.kunde_bilde);
    (c.kunde_funksjoner || []).forEach((f, i) => {
      set(`[data-cms="kunde_f${i + 1}_tittel"]`, f.tittel);
      set(`[data-cms="kunde_f${i + 1}_tekst"]`, f.beskrivelse);
    });

    // Chat
    set('[data-cms="chat_overskrift"]', c.chat_overskrift);
    set('[data-cms="chat_overskrift_highlight"]', c.chat_overskrift_highlight);
    set('[data-cms="chat_tekst"]', c.chat_tekst);
    setSrc('[data-cms-src="chat_bilde"]', c.chat_bilde);

    // Pris
    set('[data-cms="pris_trener_kr"]', c.pris_trener_kr);
    set('[data-cms="pris_proveperiode"]', c.pris_proveperiode);
    (c.pris_trener_punkter || []).forEach((p, i) => {
      set(`[data-cms="pris_trener_p${i + 1}"]`, p);
    });
    (c.pris_kunde_punkter || []).forEach((p, i) => {
      set(`[data-cms="pris_kunde_p${i + 1}"]`, p);
    });

    // CTA
    set('[data-cms="cta_overskrift_1"]', c.cta_overskrift_1);
    set('[data-cms="cta_overskrift_highlight"]', c.cta_overskrift_highlight);
    set('[data-cms="cta_overskrift_3"]', c.cta_overskrift_3);
    set('[data-cms="cta_tekst"]', c.cta_tekst);

    // FAQ — rebuild HTML then re-attach accordion listeners
    if (c.faq && c.faq.length) {
      const container = document.getElementById('faq-index');
      if (container) {
        container.innerHTML = c.faq.map(item => `
          <div class="faq-item-index glass rounded-2xl overflow-hidden reveal">
            <button class="faq-trigger-index w-full flex items-center justify-between px-5 py-4 text-left gap-4">
              <span class="font-medium text-sm sm:text-base">${esc(item.sporsmal)}</span>
              <svg class="faq-icon-index w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
            </button>
            <div class="faq-answer-index" style="display:grid;grid-template-rows:0fr;transition:grid-template-rows 0.3s ease;">
              <div style="overflow:hidden;"><div class="px-5 pb-4 text-slate-400 text-sm leading-relaxed">${esc(item.svar)}</div></div>
            </div>
          </div>
        `).join('');
        attachFaqListeners();
      }
    }

  } catch (e) {
    console.warn('CMS inject failed:', e);
  }
})();
