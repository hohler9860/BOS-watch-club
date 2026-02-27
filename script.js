/* ============================================
   BOSTON WATCH CLUB — Scripts
   Parallax + Liquid Glass + Funnel
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ---- Fade-in on scroll ----
    // Add fade-in to elements that don't have it in HTML
    document.querySelectorAll(
        '.glass-card, .register-glass, .hero-logo, .hero-subtitle, .hero-cta, .hero-scroll-indicator'
    ).forEach(el => el.classList.add('fade-in'));

    // Observe ALL fade-in elements (including membership cards that have it in HTML)
    const fadeTargets = document.querySelectorAll('.fade-in');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    fadeTargets.forEach(el => observer.observe(el));

    // ---- Parallax on scroll ----
    const heroLogo = document.querySelector('.hero-logo');
    const heroSubtitle = document.querySelector('.hero-subtitle');
    const heroCta = document.querySelector('.hero-cta');
    const heroOrb1 = document.querySelector('.hero-bg-orb-1');
    const heroOrb2 = document.querySelector('.hero-bg-orb-2');
    const scrollIndicator = document.querySelector('.hero-scroll-indicator');
    const glassCard = document.querySelector('.glass-card');
    const registerGlass = document.querySelector('.register-glass');

    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                const vh = window.innerHeight;

                // Hero parallax — elements move at different speeds
                if (scrollY < vh) {
                    const ratio = scrollY / vh;

                    if (heroLogo) {
                        heroLogo.style.transform = `translateY(${scrollY * 0.15}px) scale(${1 - ratio * 0.08})`;
                        heroLogo.style.opacity = 1 - ratio * 1.2;
                    }
                    if (heroSubtitle) {
                        heroSubtitle.style.transform = `translateY(${scrollY * 0.1}px)`;
                        heroSubtitle.style.opacity = 1 - ratio * 1.4;
                    }
                    if (heroCta) {
                        heroCta.style.transform = `translateY(${scrollY * 0.05}px)`;
                        heroCta.style.opacity = 1 - ratio * 1.6;
                    }
                    if (scrollIndicator) {
                        scrollIndicator.style.opacity = 1 - ratio * 3;
                    }

                    // Orbs float at different rates
                    if (heroOrb1) {
                        heroOrb1.style.transform = `translate(${scrollY * 0.03}px, ${scrollY * -0.08}px)`;
                    }
                    if (heroOrb2) {
                        heroOrb2.style.transform = `translate(${scrollY * -0.04}px, ${scrollY * 0.06}px)`;
                    }
                }

                // Glass card subtle parallax
                if (glassCard) {
                    const cardRect = glassCard.getBoundingClientRect();
                    const cardCenter = cardRect.top + cardRect.height / 2;
                    const offset = (cardCenter - vh / 2) * 0.03;
                    glassCard.style.transform = `translateY(${offset}px)`;
                }

                // Register glass subtle parallax
                if (registerGlass) {
                    const regRect = registerGlass.getBoundingClientRect();
                    const regCenter = regRect.top + regRect.height / 2;
                    const offset = (regCenter - vh / 2) * 0.02;
                    registerGlass.style.transform = `translateY(${offset}px)`;
                }

                ticking = false;
            });
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });

    // ---- Nav glass on scroll ----
    const navGlass = document.querySelector('.nav-glass');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 40) {
            navGlass.style.background = 'rgba(255, 255, 255, 0.82)';
            navGlass.style.boxShadow = '0 1px 24px rgba(0, 0, 0, 0.06)';
        } else {
            navGlass.style.background = 'rgba(255, 255, 255, 0.6)';
            navGlass.style.boxShadow = '0 1px 12px rgba(0, 0, 0, 0.02)';
        }
    }, { passive: true });

    // ---- Liquid glass mouse interaction ----
    const glassElements = document.querySelectorAll('.glass-card, .register-glass');

    glassElements.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

            // Subtle tilt
            card.style.transform = `perspective(1000px) rotateX(${y * -1.5}deg) rotateY(${x * 1.5}deg)`;

            // Move light reflection
            const shine = card.querySelector('.glass-shine');
            if (shine) {
                shine.style.background = `radial-gradient(circle at ${e.clientX - rect.left}px ${e.clientY - rect.top}px, rgba(255,255,255,0.15) 0%, transparent 60%)`;
            }
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            const shine = card.querySelector('.glass-shine');
            if (shine) {
                shine.style.background = 'transparent';
            }
        });
    });

    // ---- Apply modal (membership page) ----
    const applyModal = document.getElementById('apply-modal');
    const applyModalClose = document.getElementById('apply-modal-close');
    const applyModalBackdrop = document.querySelector('.apply-modal-backdrop');
    const modalTierInput = document.getElementById('modal-tier');

    if (applyModal) {
        document.querySelectorAll('.apply-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                // Find the tier name from the card
                const card = btn.closest('.membership-card');
                const tierName = card ? card.querySelector('.tier-name').textContent.trim() : '';
                if (modalTierInput) modalTierInput.value = tierName;
                applyModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeModal = () => {
            applyModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        applyModalClose.addEventListener('click', closeModal);
        applyModalBackdrop.addEventListener('click', closeModal);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && applyModal.classList.contains('active')) closeModal();
        });
    }

    // ---- Form submission ----
    const form = document.getElementById('register-form');
    const successMessage = document.getElementById('success-message');
    const registerNote = document.querySelector('.register-note');

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const formData = new FormData(form);
            const data = {
                first_name: formData.get('first_name'),
                last_name: formData.get('last_name'),
                email: formData.get('email'),
                instagram: formData.get('instagram'),
                tier: formData.get('tier') || '',
            };

            // Store in localStorage as backup
            const submissions = JSON.parse(localStorage.getItem('bwc_submissions') || '[]');
            submissions.push({ ...data, timestamp: new Date().toISOString() });
            localStorage.setItem('bwc_submissions', JSON.stringify(submissions));

            // Animate out form, show success
            form.classList.add('hidden');
            if (registerNote) registerNote.style.display = 'none';
            successMessage.classList.add('visible');
        });
    }

    // ---- FAQ accordion ----
    document.querySelectorAll('.faq-question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.closest('.faq-item');
            const isActive = item.classList.contains('active');

            // Close all others
            document.querySelectorAll('.faq-item.active').forEach(open => {
                open.classList.remove('active');
            });

            // Toggle clicked
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // ---- Mobile hamburger menu ----
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('mobile-open');
            document.body.style.overflow = navLinks.classList.contains('mobile-open') ? 'hidden' : '';
        });

        // Close menu when a link is clicked
        navLinks.querySelectorAll('a, button').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('mobile-open');
                document.body.style.overflow = '';
            });
        });
    }

    // ---- Smooth scroll for anchor links ----
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Trigger initial scroll state
    onScroll();
});
