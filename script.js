/* Onyx BioPartners — interactions */
(function () {
    'use strict';

    // Year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Nav scroll state + mobile menu
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');

    const onScroll = () => {
        if (!nav) return;
        nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toggle && nav) {
        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('is-open');
            toggle.setAttribute('aria-expanded', String(isOpen));
        });
        nav.querySelectorAll('.nav__links a').forEach(a => {
            a.addEventListener('click', () => {
                nav.classList.remove('is-open');
                toggle.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Reveal on scroll
    const reveals = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
        reveals.forEach((el) => io.observe(el));
    } else {
        reveals.forEach((el) => el.classList.add('is-visible'));
    }

    // Contact form — POSTs to Netlify Forms via AJAX so we keep the
    // inline success/error UX (no full-page redirect to a thank-you).
    // Netlify intercepts any POST to a same-origin URL whose body
    // includes `form-name=contact` and routes it to the form handler.
    const form = document.getElementById('contactForm');
    const status = document.getElementById('formStatus');
    if (form && status) {
        const FALLBACK_EMAIL = 'info@onyx-biopartners.com';

        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!form.checkValidity()) {
                status.textContent = 'Please complete the required fields.';
                status.style.color = '#b33a5b';
                return;
            }

            const btn = form.querySelector('button[type="submit"]');
            const resetBtn = () => {
                if (btn) {
                    btn.disabled = false;
                    btn.innerHTML = 'Send message <span aria-hidden="true">→</span>';
                }
            };
            if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
            status.textContent = '';

            try {
                const body = new URLSearchParams(new FormData(form)).toString();
                const response = await fetch('/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body
                });
                if (!response.ok) throw new Error('HTTP ' + response.status);

                form.reset();
                status.textContent = "Thanks. We'll get back to you within two business days.";
                status.style.color = '';
            } catch (err) {
                status.innerHTML =
                    'Something went wrong sending your message. Please email ' +
                    '<a href="mailto:' + FALLBACK_EMAIL + '">' + FALLBACK_EMAIL + '</a> directly.';
                status.style.color = '#b33a5b';
            } finally {
                resetBtn();
            }
        });
    }

    // Animated DNA helix canvas for hero background
    const canvas = document.getElementById('helixCanvas');
    if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        const ctx = canvas.getContext('2d');
        let W = 0, H = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

        const strands = 5;       // number of helices
        const segments = 60;     // points per helix
        let t = 0;

        function resize() {
            const rect = canvas.getBoundingClientRect();
            W = rect.width; H = rect.height;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        }
        resize();
        window.addEventListener('resize', resize);

        function draw() {
            t += 0.004;
            ctx.clearRect(0, 0, W, H);

            for (let s = 0; s < strands; s++) {
                const xCenter = (W / (strands + 1)) * (s + 1);
                const phase = s * 0.7 + t * (1 + s * 0.1);
                const amp = Math.min(W, 600) * 0.06;

                // two intertwined strands
                for (let k = 0; k < 2; k++) {
                    ctx.beginPath();
                    for (let i = 0; i <= segments; i++) {
                        const y = (i / segments) * H;
                        const angle = (i / segments) * Math.PI * 4 + phase + (k * Math.PI);
                        const x = xCenter + Math.sin(angle) * amp;
                        if (i === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    const grad = ctx.createLinearGradient(0, 0, 0, H);
                    grad.addColorStop(0, `rgba(200, 165, 243, ${k ? 0.12 : 0.22})`);
                    grad.addColorStop(0.5, `rgba(165, 107, 232, ${k ? 0.18 : 0.3})`);
                    grad.addColorStop(1, `rgba(232, 91, 201, ${k ? 0.1 : 0.18})`);
                    ctx.strokeStyle = grad;
                    ctx.lineWidth = k ? 0.9 : 1.2;
                    ctx.stroke();
                }

                // rungs
                for (let i = 0; i <= segments; i += 2) {
                    const y = (i / segments) * H;
                    const angle = (i / segments) * Math.PI * 4 + phase;
                    const x1 = xCenter + Math.sin(angle) * amp;
                    const x2 = xCenter + Math.sin(angle + Math.PI) * amp;
                    const alpha = 0.08 + Math.abs(Math.sin(angle)) * 0.12;
                    ctx.strokeStyle = `rgba(200, 165, 243, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.beginPath();
                    ctx.moveTo(x1, y);
                    ctx.lineTo(x2, y);
                    ctx.stroke();
                }
            }

            requestAnimationFrame(draw);
        }
        requestAnimationFrame(draw);
    }
})();
