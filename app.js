document.addEventListener('DOMContentLoaded', () => {
    initMobileNav();
    initVideoControls();
    initAudioDock();
    initContactForm();
    initRevealObserver();
    initParallaxOrbs();
    initSmoothScroll();
    initMagneticElements();
    initScrambleText();
    initTiltCards();
    initHeroWebGL();
});

function initMobileNav() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (!menuToggle || !navLinks) return;

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-link').forEach((link) => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

function initVideoControls() {
    document.querySelectorAll('.video-toggle').forEach((toggle) => {
        const container = toggle.closest('.video-container') || document;
        const video = container.querySelector('video');
        if (!video) return;

        toggle.addEventListener('click', () => {
            if (video.paused) {
                video.play();
                toggle.classList.remove('paused');
            } else {
                video.pause();
                toggle.classList.add('paused');
            }
        });
    });
}

function initAudioDock() {
    const tracks = [
        {
            id: 'score',
            label: 'Score',
            src: new URL('./assets/audio/score-bed.mp3', import.meta.url).href,
            description: 'Original score bed for the site-wide launch mood.',
        },
        {
            id: 'intro',
            label: 'Lead Voice',
            src: new URL('./assets/audio/voice-intro.mp3', import.meta.url).href,
            description: 'Primary narration cue for the first impression.',
        },
        {
            id: 'closer',
            label: 'Closer Voice',
            src: new URL('./assets/audio/voice-closer.mp3', import.meta.url).href,
            description: 'Closing voice cue for the final handoff beat.',
        },
    ];

    const dock = document.createElement('aside');
    dock.className = 'audio-dock';
    dock.setAttribute('aria-label', 'Optional audio');
    dock.innerHTML = `
        <div class="audio-dock-mini">
            <div>
                <p class="audio-kicker">Optional audio</p>
                <strong class="audio-title"></strong>
            </div>
            <div class="audio-mini-actions">
                <button class="audio-expand" type="button">Open</button>
                <button class="audio-toggle" type="button">Play</button>
            </div>
        </div>
        <p class="audio-description"></p>
        <div class="audio-wave" aria-hidden="true">
            ${Array.from({ length: 16 }, (_, index) => `<span style="--bar-index:${index}"></span>`).join('')}
        </div>
        <div class="audio-track-list"></div>
        <audio preload="metadata"></audio>
    `;

    document.body.appendChild(dock);

    const audio = dock.querySelector('audio');
    const title = dock.querySelector('.audio-title');
    const description = dock.querySelector('.audio-description');
    const toggle = dock.querySelector('.audio-toggle');
    const expand = dock.querySelector('.audio-expand');
    const wave = dock.querySelector('.audio-wave');
    const list = dock.querySelector('.audio-track-list');

    if (!(audio instanceof HTMLAudioElement) || !title || !description || !toggle || !expand || !wave || !list) {
        return;
    }

    let activeTrack = tracks[0];
    let isPlaying = false;
    let isExpanded = false;

    const renderTracks = () => {
        list.innerHTML = tracks.map((track) => `
            <button
                class="audio-chip${track.id === activeTrack.id ? ' active' : ''}"
                type="button"
                data-audio-track="${track.id}"
            >
                ${track.label}
            </button>
        `).join('');
    };

    const syncUi = () => {
        title.textContent = activeTrack.label;
        description.textContent = activeTrack.description;
        toggle.textContent = isPlaying ? 'Pause' : 'Play';
        expand.textContent = isExpanded ? 'Hide' : 'Open';
        dock.classList.toggle('is-expanded', isExpanded);
        dock.classList.toggle('is-playing', isPlaying);
        dock.setAttribute('data-audio-state', isPlaying ? 'playing' : 'idle');
        wave.classList.toggle('is-playing', isPlaying);
        expand.setAttribute('aria-expanded', String(isExpanded));
        toggle.setAttribute('aria-pressed', String(isPlaying));
        renderTracks();
    };

    const selectTrack = async (trackId, autoplay = false) => {
        const nextTrack = tracks.find((track) => track.id === trackId);
        if (!nextTrack) return;

        activeTrack = nextTrack;
        audio.pause();
        audio.src = activeTrack.src;
        audio.load();
        isPlaying = false;
        isExpanded = true;
        syncUi();

        if (!autoplay) return;

        try {
            await audio.play();
            isPlaying = true;
        } catch {
            isPlaying = false;
        }

        syncUi();
    };

    audio.src = activeTrack.src;
    audio.volume = 0.94;
    syncUi();

    toggle.addEventListener('click', async () => {
        isExpanded = true;

        if (isPlaying) {
            audio.pause();
            isPlaying = false;
            syncUi();
            return;
        }

        try {
            await audio.play();
            isPlaying = true;
        } catch {
            isPlaying = false;
        }

        syncUi();
    });

    expand.addEventListener('click', () => {
        isExpanded = !isExpanded;
        syncUi();
    });

    list.addEventListener('click', async (event) => {
        const button = event.target instanceof Element ? event.target.closest('[data-audio-track]') : null;
        if (!(button instanceof HTMLElement)) return;
        await selectTrack(button.dataset.audioTrack, true);
    });

    document.querySelectorAll('[data-audio-trigger]').forEach((button) => {
        button.addEventListener('click', async () => {
            if (!(button instanceof HTMLElement)) return;
            await selectTrack(button.dataset.audioTrigger, true);
        });
    });

    audio.addEventListener('ended', () => {
        isPlaying = false;
        syncUi();
    });

    audio.addEventListener('play', () => {
        isPlaying = true;
        syncUi();
    });

    audio.addEventListener('pause', () => {
        isPlaying = false;
        syncUi();
    });

    audio.addEventListener('error', () => {
        isPlaying = false;
        description.textContent = 'Audio is unavailable right now.';
        syncUi();
    });
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');

    if (!contactForm || !formSuccess) return;

    contactForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        if (!(submitBtn instanceof HTMLButtonElement)) return;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        window.setTimeout(() => {
            contactForm.style.display = 'none';
            formSuccess.classList.add('show');
        }, 1200);
    });
}

function initRevealObserver() {
    const targets = document.querySelectorAll('.work-card, .gallery-item, .lab-card, .proof-card, .scene-card, .sound-copy, .sound-card, .metric-card, .footer-lead, .footer-brand, .footer-column, .social-orb, .footer-bottom');
    if (!targets.length) return;

    const style = document.createElement('style');
    style.textContent = `
        .reveal-ready {
            opacity: 0;
            transform: translateY(34px);
            transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-ready.in-view {
            opacity: 1;
            transform: translateY(0);
        }
    `;
    document.head.appendChild(style);

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.12 });

    targets.forEach((target, index) => {
        target.classList.add('reveal-ready');
        target.style.transitionDelay = `${Math.min(index * 70, 320)}ms`;
        observer.observe(target);
    });
}

function initParallaxOrbs() {
    const orbs = document.querySelectorAll('.orb');
    if (!orbs.length) return;

    let ticking = false;

    const update = () => {
        const scrolled = window.pageYOffset;
        orbs.forEach((orb, index) => {
            const speed = 0.16 + (index * 0.08);
            orb.style.transform = `translateY(${scrolled * speed}px)`;
        });
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', function onClick(event) {
            event.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function initMagneticElements() {
    const magneticElements = document.querySelectorAll('.btn-primary, .btn-secondary, .glass-panel, .video-toggle, .social-orb, .footer-cta');
    magneticElements.forEach((element) => {
        element.addEventListener('mousemove', (event) => {
            const rect = element.getBoundingClientRect();
            const x = event.clientX - rect.left - rect.width / 2;
            const y = event.clientY - rect.top - rect.height / 2;
            element.style.transform = `translate(${x * 0.03}px, ${y * 0.03}px)`;
        });

        element.addEventListener('mouseleave', () => {
            element.style.transform = '';
        });
    });
}

function initScrambleText() {
    const chars = '!<>-_\\/[]{}=+*?#________';
    document.querySelectorAll('.scramble-text').forEach((element, index) => {
        const finalText = element.dataset.scramble || element.textContent || '';
        element.textContent = finalText;

        const runScramble = () => {
            let iteration = 0;
            const interval = window.setInterval(() => {
                element.textContent = finalText
                    .split('')
                    .map((char, charIndex) => {
                        if (charIndex < iteration) return finalText[charIndex];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('');

                iteration += 0.45;
                if (iteration >= finalText.length) {
                    element.textContent = finalText;
                    window.clearInterval(interval);
                }
            }, 24);
        };

        window.setTimeout(runScramble, 250 + (index * 160));
        element.addEventListener('mouseenter', runScramble);
    });
}

function initTiltCards() {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
        card.addEventListener('mousemove', (event) => {
            const rect = card.getBoundingClientRect();
            const rotateX = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
            const rotateY = ((event.clientX - rect.left) / rect.width - 0.5) * 12;
            card.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

function initHeroWebGL() {
    const canvas = document.getElementById('heroCanvas');
    if (!(canvas instanceof HTMLCanvasElement)) return;

    const supportsWebGL = () => {
        try {
            const context =
                canvas.getContext('webgl2', { antialias: false }) ||
                canvas.getContext('webgl', { antialias: false }) ||
                canvas.getContext('experimental-webgl', { antialias: false });
            if (!context) return false;
            const loseContext = context.getExtension?.('WEBGL_lose_context');
            loseContext?.loseContext();
            return true;
        } catch {
            return false;
        }
    };

    if (!supportsWebGL()) return;

    import('three').then((THREE) => {
        const scene = new THREE.Scene();
        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        } catch {
            return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

        const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
        camera.position.set(0, 0, 6);

        const group = new THREE.Group();
        scene.add(group);

        const knot = new THREE.Mesh(
            new THREE.TorusKnotGeometry(1.05, 0.28, 180, 32),
            new THREE.MeshPhysicalMaterial({
                color: '#ff4f8d',
                emissive: '#2b0c1a',
                roughness: 0.08,
                metalness: 0.9,
                transmission: 0.18,
                clearcoat: 1,
                clearcoatRoughness: 0.08,
            }),
        );
        group.add(knot);

        const wire = new THREE.Mesh(
            new THREE.IcosahedronGeometry(1.95, 1),
            new THREE.MeshBasicMaterial({
                color: '#7f7fff',
                wireframe: true,
                transparent: true,
                opacity: 0.25,
            }),
        );
        group.add(wire);

        const particles = new THREE.Points(
            new THREE.BufferGeometry(),
            new THREE.PointsMaterial({ color: '#ffffff', size: 0.03, transparent: true, opacity: 0.55 }),
        );
        const particleCount = 180;
        const positions = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i += 1) {
            positions[(i * 3)] = (Math.random() - 0.5) * 8;
            positions[(i * 3) + 1] = (Math.random() - 0.5) * 8;
            positions[(i * 3) + 2] = (Math.random() - 0.5) * 6;
        }
        particles.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        scene.add(particles);

        const lightA = new THREE.PointLight('#ff4f8d', 22, 20);
        lightA.position.set(2, 2, 4);
        const lightB = new THREE.PointLight('#4f7dff', 18, 20);
        lightB.position.set(-3, -2, 3);
        const ambient = new THREE.AmbientLight('#ffffff', 0.42);
        scene.add(lightA, lightB, ambient);

        const pointer = { x: 0, y: 0 };

        const resize = () => {
            const bounds = canvas.getBoundingClientRect();
            const width = Math.max(bounds.width, 1);
            const height = Math.max(bounds.height, 1);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        };

        resize();
        window.addEventListener('resize', resize);

        window.addEventListener('pointermove', (event) => {
            pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
            pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
        });

        const startedAt = performance.now();
        const render = () => {
            const elapsed = (performance.now() - startedAt) / 1000;
            knot.rotation.x = elapsed * 0.25;
            knot.rotation.y = elapsed * 0.42;
            wire.rotation.x = -elapsed * 0.18;
            wire.rotation.y = elapsed * 0.15;
            group.rotation.y += (pointer.x * 0.35 - group.rotation.y) * 0.03;
            group.rotation.x += (-pointer.y * 0.2 - group.rotation.x) * 0.03;
            particles.rotation.y = elapsed * 0.03;
            renderer.render(scene, camera);
            window.requestAnimationFrame(render);
        };

        render();
    }).catch(() => {});
}
