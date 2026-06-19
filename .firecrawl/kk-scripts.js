
(function() {
    // Init Lenis smooth scroll
    var lenis = new Lenis({
        duration: 1.2,
        easing: function(t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
        smoothWheel: true
    });

    var sections = document.querySelectorAll('.kk-section');

    // Store each section's original offset
    var sectionOffsets = [];
    sections.forEach(function(section, i) {
        section.style.zIndex = i + 1;
        sectionOffsets.push(section.offsetTop);
    });

    function updateParallax(scrollY) {
        var winH = window.innerHeight;

        sections.forEach(function(section, i) {
            var sectionStart = sectionOffsets[i];
            var progress = (scrollY - sectionStart + winH) / (winH * 2);
            progress = Math.max(0, Math.min(1, progress));

            // Watch rotation
            var watchImg = section.querySelector('.kk-section__watch-img');
            if (watchImg) {
                var rotate = -25 + (progress * 25);
                watchImg.style.transform = 'rotate(' + rotate + 'deg)';
            }

            // Text parallax - follows scroll with slight lag
            var textEl = section.querySelector('.kk-section__text');
            if (textEl) {
                var centered = progress - 0.5;
                var textY = centered * -400;
                textEl.style.transform = 'translateY(' + textY + 'px)';
            }
        });
    }

    // Hook parallax into Lenis scroll
    lenis.on('scroll', function(e) {
        updateParallax(e.scroll);
    });

    // Lenis RAF loop
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Fade-in observer
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(function(el) {
        observer.observe(el);
    });

    updateParallax(0);

    // Discover More — toggle panel open/closed
    document.querySelectorAll('.kk-discover').forEach(function (btn) {
        var panelId = btn.getAttribute('aria-controls');
        var panel = panelId ? document.getElementById(panelId) : null;
        if (!panel) return;

        btn.addEventListener('click', function () {
            if (panel.hasAttribute('hidden')) {
                panel.removeAttribute('hidden');
                // Force a reflow so the closed state commits before is-open triggers the transition.
                void panel.offsetHeight;
            }
            var isOpen = panel.classList.toggle('is-open');
            btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            var labelEl = btn.querySelector('.kk-discover__label');
            if (labelEl) labelEl.textContent = isOpen ? 'CLOSE' : 'DISCOVER MORE';
        });
    });
})();
