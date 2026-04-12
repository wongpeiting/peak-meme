gsap.registerPlugin(ScrollTrigger);

// ─── Config ───
const IS_MOBILE = window.innerWidth < 768;
const ZOOM_SCALE = IS_MOBILE ? 50 : 80;
const SCROLL_DISTANCE = IS_MOBILE ? 400 : 500;

// ═══════════════════════════════════════════════════
// OPENING — zoom into the dog's eye in panel 1
// ═══════════════════════════════════════════════════

const openTl = gsap.timeline({
    scrollTrigger: {
        trigger: "#opening",
        start: "top top",
        end: "+=" + SCROLL_DISTANCE,
        pin: true,
        scrub: IS_MOBILE ? 0.3 : 1,
        anticipatePin: 1,
        fastScrollEnd: IS_MOBILE ? 300 : false,
    }
});

openTl
    // 1. Fade out the intro text
    .to(".intro-text", {
        opacity: 0,
        y: -30,
        duration: 0.05,
    })
    // 2. Zoom into the eye — fast
    .to("#meme-open", {
        scale: ZOOM_SCALE,
        duration: 0.40,
        ease: "power2.in",
    }, 0.03)
    // 3. Fade to black early
    .to("#overlay-in", {
        opacity: 1,
        duration: 0.12,
    }, 0.30)
    // 4. First line fades in over the black + lizard video appears
    .to("#eye-text", {
        opacity: 1,
        duration: 0.20,
    }, 0.55)
    .add(() => {
        const vid = document.getElementById("inline-vid");
        const overlay = document.getElementById("video-overlay");
        if (openTl.scrollTrigger.direction === 1) {
            const mobile = window.innerWidth <= 768;
            overlay.style.position = "fixed";
            overlay.style.left = "5%";
            overlay.style.right = "auto";
            overlay.style.borderRadius = "12px";
            overlay.style.zIndex = "11";
            overlay.style.background = "rgba(10, 10, 30, 0.95)";
            if (mobile) {
                overlay.style.top = "auto";
                overlay.style.bottom = "5%";
                overlay.style.transform = "none";
                overlay.style.width = "35vw";
            } else {
                overlay.style.top = "50%";
                overlay.style.bottom = "auto";
                overlay.style.transform = "translateY(-50%)";
                overlay.style.width = "min(300px, 35vw)";
            }
            overlay.classList.add("active");
            vid.src = "videos/7613406980719283486.mp4";
            vid.muted = !window.audioEnabled;
            vid.load();
            vid.play().catch(() => {});
            document.getElementById("audio-btn").classList.add("visible");
        } else {
            overlay.classList.remove("active");
            overlay.removeAttribute("style");
            vid.pause();
            document.getElementById("audio-btn").classList.remove("visible");
        }
    }, 0.72);


// Kill video when scrolling back into the opening
ScrollTrigger.create({
    trigger: "#opening",
    start: "top top",
    end: "bottom top",
    onEnterBack: () => {
        const overlay = document.getElementById("video-overlay");
        const vid = document.getElementById("inline-vid");
        overlay.classList.remove("active");
        overlay.removeAttribute("style");
        vid.pause();
        document.querySelectorAll("#video-overlay-2, #video-overlay-3, #video-overlay-4").forEach(el => {
            el.classList.remove("active", "q-bl", "q-tr", "q-tl", "q-br");
        });
        document.querySelectorAll("#inline-vid-2, #inline-vid-3, #inline-vid-4").forEach(v => v.pause());
        document.getElementById("audio-btn").classList.remove("visible");
    },
});

// ═══════════════════════════════════════════════════
// TRANSITION — fade grid to black before closing
// ═══════════════════════════════════════════════════

ScrollTrigger.create({
    trigger: "#closing",
    start: "top 120%",
    end: "top top",
    scrub: true,
    onUpdate: (self) => {
        const vizContainer = document.getElementById("viz-container");
        if (vizContainer) {
            vizContainer.style.opacity = 1 - self.progress;
        }
    },
    onLeaveBack: () => {
        const vizContainer = document.getElementById("viz-container");
        if (vizContainer) vizContainer.style.opacity = 1;
    }
});

// ═══════════════════════════════════════════════════
// CLOSING — zoom out from the dog's eye in panel 2
// ═══════════════════════════════════════════════════

// Initial state: zoomed deep into the eye, behind black overlay
gsap.set("#meme-close", { scale: ZOOM_SCALE });
gsap.set("#overlay-out", { opacity: 1 });
gsap.set(".outro-text", { opacity: 0 });

const closeTl = gsap.timeline({
    scrollTrigger: {
        trigger: "#closing",
        start: "top top",
        end: "+=" + (IS_MOBILE ? SCROLL_DISTANCE * 0.7 : SCROLL_DISTANCE * 0.35),
        pin: true,
        scrub: IS_MOBILE ? 0.3 : 1,
        anticipatePin: 1,
        fastScrollEnd: IS_MOBILE ? 300 : false,
    }
});

closeTl
    // 1. Fade from black
    .to("#overlay-out", {
        opacity: 0,
        duration: 0.20,
    })
    // 2. Zoom out to reveal the full meme
    .to("#meme-close", {
        scale: 1,
        duration: 0.85,
        ease: "power1.out",
    }, 0.10)
    // 3. Show the methodology link
    .to(".outro-text", {
        opacity: 1,
        duration: 0.10,
    }, 0.88);
