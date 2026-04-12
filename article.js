/**
 * article.js — Main article controller
 *
 * Every state change resets ALL visual elements to a clean baseline,
 * then activates only what that state needs. This prevents stale
 * visuals when scrolling backwards.
 */

(async function () {
    "use strict";

    const audioBtn    = document.getElementById("audio-btn");
    const vidOverlay2 = document.getElementById("video-overlay-2");
    const vidEl2      = document.getElementById("inline-vid-2");
    const vidOverlay3 = document.getElementById("video-overlay-3");
    const vidEl3      = document.getElementById("inline-vid-3");
    const vidOverlay4 = document.getElementById("video-overlay-4");
    const vidEl4      = document.getElementById("inline-vid-4");
    const svgEl       = document.getElementById("viz-svg");
    const compPanel   = document.getElementById("comparison-panel");
    const vidOverlay  = document.getElementById("video-overlay");
    const vidEl       = document.getElementById("inline-vid");
    const vidCaption  = document.getElementById("vid-caption");
    const statCounter = document.getElementById("stat-counter");

    // ─── Load data ───
    const gridPosts = await fetch("data/grid_posts.json").then(r => r.json()).catch(() => []);

    console.log(`Loaded: ${gridPosts.length} posts`);

    // Build lookup for related videos
    window._gridPostsById = {};
    gridPosts.forEach(p => { window._gridPostsById[p.id] = p; });

    // ─── Init viz modules ───
    VizGrid.init(null);
    // VizLineage removed — no longer used

    VizGrid.setData(gridPosts);
    await VizStrike.init();
    svgEl.style.display = "none"; // Hidden until lineage section

    // ─── Key post ───
    const LIZARD_INDEX = 515;
    const LIZARD_ID = gridPosts[LIZARD_INDEX]?.id;

    // ─── State ───
    let currentState = null;

    // ─── Full reset — returns everything to neutral ───
    function resetAll() {
        // Kill any GSAP animations on the overlay
        gsap.killTweensOf(vidOverlay);

        // Hide video overlays
        vidOverlay.removeAttribute("style");
        vidOverlay.classList.remove("active");
        vidEl.pause();

        vidOverlay2.classList.remove("active", "q-bl", "q-tr", "q-tl", "q-br");
        vidEl2.pause();
        vidOverlay3.classList.remove("active", "q-bl", "q-tr", "q-tl", "q-br");
        vidEl3.pause();
        vidOverlay4.classList.remove("active", "q-bl", "q-tr", "q-tl", "q-br");
        vidEl4.pause();

        // Hide grid
        VizGrid.hide();

        // Hide grid's own video box
        const wb = document.getElementById("wh-video-box");
        if (wb) wb.classList.remove("active");
        const wv = document.getElementById("wh-vid");
        if (wv) wv.pause();

        // Hide strike lineage
        VizStrike.hide();

        // Hide counter
        statCounter.style.opacity = "0";

        // Hide audio button
        audioBtn.classList.remove("visible");
    }

    // ─── Mobile quadrant positioning ───
    const isMobile = window.innerWidth <= 768;
    function setQ(el, q) {
        if (!isMobile) return;
        el.classList.remove("q-bl", "q-tr", "q-tl", "q-br");
        if (q) el.classList.add(q);
    }

    function showMobileVid(overlay, vidEl, src, quadrant) {
        if (!isMobile) return;
        if (!vidEl.src.includes(src)) {
            vidEl.src = "videos/" + src + ".mp4";
            vidEl.load();
        }
        vidEl.muted = !window.audioEnabled;
        overlay.classList.add("active");
        setQ(overlay, quadrant);
        vidEl.play().catch(() => {});
    }

    // ─── Show lizard video TikTok-sized at center ───
    function showLizardFullscreen() {
        showLizardCenter();
    }

    // ─── Show lizard video at center ───
    function showLizardCenter() {
        vidOverlay.style.position = "fixed";
        vidOverlay.style.top = "50%";
        vidOverlay.style.left = "5%";
        vidOverlay.style.right = "auto";
        vidOverlay.style.transform = "translateY(-50%)";
        vidOverlay.style.width = "min(300px, 35vw)";
        vidOverlay.style.borderRadius = "12px";
        vidOverlay.classList.add("active");

        if (!vidEl.src.includes(LIZARD_ID)) {
            vidEl.src = `videos/${LIZARD_ID}.mp4`;
            vidEl.load();
        }
        vidEl.muted = !window.audioEnabled;
        vidCaption.textContent = "";
        vidEl.play().catch(() => {});

        audioBtn.classList.add("visible");
    }

    // ─── Show a featured video in the grid's video box ───
    function showGridVideo(videoId) {
        const wv = document.getElementById("wh-vid");
        const wb = document.getElementById("wh-video-box");
        if (!wv || !wb) return;
        wv.src = `videos/${videoId}.mp4`;
        wv.muted = !window.audioEnabled;
        wb.classList.add("active");
        wv.play().catch(() => {});
        audioBtn.classList.add("visible");
    }

    // ─── Main state handler (rAF-batched to prevent mobile flicker) ───
    let _pendingState = null;
    let _rafId = null;
    const _vizContainer = document.getElementById("viz-container");

    function updateViz(newState) {
        if (newState === currentState) return;
        _pendingState = newState;
        if (_rafId) return;
        _rafId = requestAnimationFrame(_applyState);
    }

    function _applyState() {
        _rafId = null;
        const newState = _pendingState;
        if (newState === currentState) return;
        const prevState = currentState;
        currentState = newState;
        console.log(`State: ${prevState} → ${newState}`);

        // Suppress CSS transitions during reset→rebuild (prevents flicker)
        _vizContainer.classList.add("notransition");

        // Reset everything to neutral first
        resetAll();

        // Then activate only what this state needs
        switch (newState) {

            // ── Text steps with videos ──
            case "text-2":
                // Desktop: Lizard left, Stay Frosty right
                // Mobile: Lizard bottom-left, Stay Frosty top-right (accumulate)
                showLizardFullscreen();
                setQ(vidOverlay, "q-bl");
                if (!vidEl2.src.includes("7613501531765116191")) {
                    vidEl2.src = "videos/7613501531765116191.mp4";
                    vidEl2.load();
                }
                vidEl2.muted = !window.audioEnabled;
                vidOverlay2.classList.add("active");
                setQ(vidOverlay2, "q-tr");
                vidEl2.play().catch(() => {});
                break;

            case "text-3":
                // Desktop: HOME RUN left, Stay Frosty right
                // Mobile: keep Lizard + Stay Frosty, add HOME RUN top-left
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7613406980719283486", "q-bl");   // Lizard stays
                    showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");  // Stay Frosty stays
                    showMobileVid(vidOverlay3, vidEl3, "7614249170542562573", "q-tl");  // HOME RUN new
                    audioBtn.classList.add("visible");
                    break;
                }
                vidOverlay.style.position = "fixed";
                vidOverlay.style.top = "50%";
                vidOverlay.style.left = "5%";
                vidOverlay.style.right = "auto";
                vidOverlay.style.transform = "translateY(-50%)";
                vidOverlay.style.width = "min(300px, 35vw)";
                vidOverlay.style.borderRadius = "12px";
                vidOverlay.classList.add("active");
                if (!vidEl.src.includes("7614249170542562573")) {
                    vidEl.src = "videos/7614249170542562573.mp4";
                    vidEl.load();
                }
                vidEl.muted = !window.audioEnabled;
                vidCaption.textContent = "";
                vidEl.play().catch(() => {});
                audioBtn.classList.add("visible");
                // Stay Frosty on the right
                if (!vidEl2.src.includes("7613501531765116191")) {
                    vidEl2.src = "videos/7613501531765116191.mp4";
                    vidEl2.load();
                }
                vidEl2.muted = !window.audioEnabled;
                vidOverlay2.classList.add("active");
                vidEl2.play().catch(() => {});
                break;

            case "text-4":
                // Desktop: HOME RUN left, Spongebob right
                // Mobile: all 4 quadrants filled
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7613406980719283486", "q-bl");    // Lizard
                    showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");   // Stay Frosty
                    showMobileVid(vidOverlay3, vidEl3, "7614249170542562573", "q-tl");   // HOME RUN
                    showMobileVid(vidOverlay4, vidEl4, "7613864676010511629", "q-br");   // Spongebob
                    audioBtn.classList.add("visible");
                    break;
                }
                vidOverlay.style.position = "fixed";
                vidOverlay.style.top = "50%";
                vidOverlay.style.left = "5%";
                vidOverlay.style.right = "auto";
                vidOverlay.style.transform = "translateY(-50%)";
                vidOverlay.style.width = "min(300px, 35vw)";
                vidOverlay.style.borderRadius = "12px";
                vidOverlay.classList.add("active");
                if (!vidEl.src.includes("7614249170542562573")) {
                    vidEl.src = "videos/7614249170542562573.mp4";
                    vidEl.load();
                }
                vidEl.muted = !window.audioEnabled;
                vidCaption.textContent = "";
                vidEl.play().catch(() => {});
                audioBtn.classList.add("visible");
                if (!vidEl2.src.includes("7613864676010511629")) {
                    vidEl2.src = "videos/7613864676010511629.mp4";
                    vidEl2.load();
                }
                vidEl2.muted = !window.audioEnabled;
                vidOverlay2.classList.add("active");
                vidEl2.play().catch(() => {});
                break;

            case "text-5":
                // Desktop: STRIKE left, Spongebob right
                // Mobile: keep all 4 (STRIKE replaces Lizard in bottom-left)
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7616166285625347342", "q-bl");    // STRIKE replaces Lizard
                    showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");   // Stay Frosty
                    showMobileVid(vidOverlay3, vidEl3, "7614249170542562573", "q-tl");   // HOME RUN
                    showMobileVid(vidOverlay4, vidEl4, "7613864676010511629", "q-br");   // Spongebob
                    audioBtn.classList.add("visible");
                    break;
                }
                vidOverlay.style.position = "fixed";
                vidOverlay.style.top = "50%";
                vidOverlay.style.left = "5%";
                vidOverlay.style.right = "auto";
                vidOverlay.style.transform = "translateY(-50%)";
                vidOverlay.style.width = "min(300px, 35vw)";
                vidOverlay.style.borderRadius = "12px";
                vidOverlay.classList.add("active");
                if (!vidEl.src.includes("7616166285625347342")) {
                    vidEl.src = "videos/7616166285625347342.mp4";
                    vidEl.load();
                }
                vidEl.muted = !window.audioEnabled;
                vidCaption.textContent = "";
                vidEl.play().catch(() => {});
                audioBtn.classList.add("visible");
                if (!vidEl2.src.includes("7613864676010511629")) {
                    vidEl2.src = "videos/7613864676010511629.mp4";
                    vidEl2.load();
                }
                vidEl2.muted = !window.audioEnabled;
                vidOverlay2.classList.add("active");
                vidEl2.play().catch(() => {});
                break;

            // ── Grid appears — cascade on first entry, instant on scroll-back ──
            case "zoom-out-grid": {
                const seenVideos = [
                    515,  // Lizard (516/600)
                    517,  // Stay Frosty (518/600)
                    522,  // Spongebob (523/600)
                    526,  // HOME RUN (527/600)
                    544,  // STRIKE (545/600)
                ];
                if (prevState === "war-memes-all" || prevState === "grid-intro") {
                    // Scrolling back — show grid instantly with five highlights
                    VizGrid.show(false);
                    VizGrid.zoomToPost(seenVideos);
                } else {
                    // Scrolling forward — cascade in
                    VizGrid.show(true);
                    setTimeout(() => {
                        VizGrid.zoomToPost(seenVideos);
                    }, 1800);
                }
                break;
            }

            // ── War memes highlighted (12 with real_war_footage + L5-7) ──
            case "war-memes-all":
                VizGrid.show();
                VizGrid.zoomToPost([
                    515,  // Lizard (516/600)
                    517,  // Stay Frosty (518/600)
                    520,  // "I was the hunted" (521/600)
                    521,  // 💥💥 (522/600)
                    522,  // Spongebob (523/600)
                    525,  // LOCKED IN (526/600)
                    526,  // HOME RUN (527/600)
                    527,  // TOUCHDOWN (528/600)
                    528,  // Justice the American way (529/600)
                    537,  // Coming in hot (538/600)
                    543,  // UNDEFEATED (544/600)
                    544,  // STRIKE (545/600)
                ]);
                break;

            case "broader-shift":
                VizGrid.show();
                VizGrid.highlight("memes");
                break;

            case "headline":
                VizGrid.show();
                VizGrid.highlight("dim-all");
                break;


            case "pre-lineage":
                VizGrid.show();
                VizGrid.zoomToPost([54, 95]);
                break;

            // ── Strike lineage ──
            case "lin-troll-intro":
                VizGrid.show();
                VizGrid.zoomToPost([2, 4, 6, 12, 29, 52, 57, 61, 76, 120, 125, 127, 149, 153, 158, 159, 163, 165, 166, 168, 172, 173, 175, 181, 185, 194, 199, 200, 213, 218, 219, 223, 224, 228, 232, 234, 236, 237, 239, 240, 242, 250, 256, 269, 280, 294, 295, 296, 300, 304, 307, 308, 313, 319, 321, 322, 324, 334, 338, 341, 349, 353, 361, 362, 375, 377, 379, 384, 386, 391, 401, 405, 409, 416, 419, 420, 424, 438, 441, 443, 451, 469, 473, 492, 499, 560, 572, 579, 583, 585, 587, 588, 593]);
                break;

            case "lin-exp-intro":
                VizGrid.show();
                VizGrid.zoomToPost([6, 49, 95, 122, 133, 173, 204, 209, 210, 220, 224, 250, 321, 335, 357, 361, 362, 364, 370, 372, 374, 382, 383, 386, 405, 416, 420, 422, 438, 445, 473, 482, 525, 533, 561]);
                break;

            case "lin-game-intro":
                VizGrid.show();
                VizGrid.zoomToPost([6, 13, 29, 76, 127, 163, 166, 173, 175, 185, 200, 218, 219, 228, 232, 234, 236, 240, 256, 269, 294, 313, 315, 321, 322, 334, 341, 343, 362, 363, 375, 377, 379, 386, 391, 419, 424, 439, 500, 561, 585]);
                break;

            case "lin-0": case "lin-prod-0": case "lin-prod-1": case "lin-prod-2": case "lin-prod-grid":
            case "lin-troll-0": case "lin-troll-1": case "lin-troll-2": case "lin-troll-3": case "lin-troll-4": case "lin-troll-5":
            case "lin-exp-0": case "lin-exp-1": case "lin-exp-2": case "lin-exp-3": case "lin-exp-4": case "lin-exp-5": case "lin-exp-6":
            case "lin-game-opponents":
            case "lin-game-0": case "lin-game-1": case "lin-game-2": case "lin-game-3":
                VizStrike.show(newState);
                audioBtn.classList.add("visible");
                break;

            case "profanity":
            case "profanity-sources":
                VizStrike.show(newState);
                break;

            case "grid-return":
                VizGrid.show();
                VizGrid.highlight("all-final");
                break;

            case "grid-final": {
                VizGrid.show();
                VizGrid.highlight("all-final");
                const pkgChart = document.getElementById("pkg-chart");
                if (pkgChart && !pkgChart.dataset.built) {
                    const levels = [
                        { l: 7, label: "Gamified", avg: 5.9 },
                        { l: 6, label: "Meme", avg: 4.9 },
                        { l: 5, label: "Pop culture", avg: 3.1 },
                        { l: 4, label: "TikTok-native", avg: 3.2 },
                        { l: 3, label: "Produced", avg: 1.9 },
                        { l: 2, label: "Direct address", avg: 2.1 },
                        { l: 1, label: "Official", avg: 1.3 }
                    ];
                    pkgChart.innerHTML = `<div class="pkg-chart-inner" style="display:flex;gap:8px;">
                        <div style="display:flex;flex-direction:column;align-items:center;padding:0;width:18px;">
                            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:10px solid #aaa;"></div>
                            <div style="width:2px;flex:1;background:#aaa;"></div>
                            <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:0.55rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Level of escalation</div>
                        </div>
                        <div style="flex:1;display:flex;flex-direction:column;gap:8px;">` +
                    levels.map(lv => {
                        const pct = (lv.avg / 5.9 * 100).toFixed(0);
                        const barColor = lv.l >= 5 ? "#ff3b3b" : "#555";
                        return `<div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:90px;text-align:right;font-size:0.75rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;flex-shrink:0;white-space:nowrap;">${lv.label}</div>
                            <div style="display:flex;align-items:center;height:26px;">
                                <div style="width:${pct * 2.5}px;height:100%;background:${barColor};"></div>
                                <div style="font-size:0.7rem;color:#fff;font-family:Inter,sans-serif;font-weight:700;margin-left:6px;">${lv.avg}M</div>
                            </div>
                        </div>`;
                    }).join("") + `</div></div>`;
                    // Mobile-friendly version
                    const mobileChart = document.createElement("div");
                    mobileChart.id = "pkg-chart-mobile";
                    mobileChart.innerHTML = `<div style="display:flex;gap:4px;">
                        <div style="display:flex;flex-direction:column;align-items:center;width:14px;flex-shrink:0;">
                            <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid #aaa;"></div>
                            <div style="width:1.5px;flex:1;background:#aaa;"></div>
                            <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:0.4rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-top:3px;">Level of escalation</div>
                        </div>
                        <div style="flex:1;display:flex;flex-direction:column;gap:6px;">` +
                    levels.map(lv => {
                        const pct = (lv.avg / 5.9 * 100).toFixed(0);
                        const barColor = lv.l >= 5 ? "#ff3b3b" : "#555";
                        return `<div style="display:flex;align-items:center;gap:6px;">
                            <div style="width:70px;text-align:right;font-size:0.55rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;flex-shrink:0;white-space:nowrap;">${lv.label}</div>
                            <div style="width:${pct}%;height:18px;background:${barColor};display:flex;align-items:center;justify-content:flex-end;padding-right:4px;min-width:30px;">
                                <span style="font-size:0.5rem;color:#fff;font-family:Inter,sans-serif;font-weight:600;">${lv.avg}M</span>
                            </div>
                        </div>`;
                    }).join("") + `</div></div>`;
                    pkgChart.appendChild(mobileChart);
                    pkgChart.dataset.built = "1";
                }
                break;
            }

            case "kicker":
                VizGrid.show();
                VizGrid.highlight("all-final");
                break;
        }

        // Update nav arrows
        updateNavVisibility();

        // Re-enable CSS transitions on next paint
        requestAnimationFrame(() => _vizContainer.classList.remove("notransition"));
    }

    // ─── ScrollTriggers ───
    gsap.registerPlugin(ScrollTrigger);

    const allSteps = document.querySelectorAll(".a-step");
    allSteps.forEach((step, i) => {
        ScrollTrigger.create({
            trigger: step,
            start: "top 40%",
            end: "bottom 40%",
            onEnter: () => updateViz(step.dataset.state),
            onEnterBack: () => updateViz(step.dataset.state),
        });
    });

    // ─── Step nav arrows ───
    const stepNav = document.getElementById("step-nav");
    const navStates = new Set([
        "lin-0","lin-prod-0","lin-prod-1","lin-prod-2","lin-prod-grid",
        "lin-game-intro","lin-game-opponents","lin-game-0","lin-game-1","lin-game-2","lin-game-3",
        "lin-troll-intro","lin-troll-0","lin-troll-1","lin-troll-2","lin-troll-3","lin-troll-4","lin-troll-5",
        "lin-exp-intro","lin-exp-0","lin-exp-1","lin-exp-2","lin-exp-3","lin-exp-4","lin-exp-5","lin-exp-6",
        "profanity-sources","profanity"
    ]);

    function updateNavVisibility() {
        if (navStates.has(currentState)) {
            stepNav.classList.add("visible");
        } else {
            stepNav.classList.remove("visible");
        }
    }

    window.stepNav = function(dir) {
        const stepArr = Array.from(allSteps);
        const curIdx = stepArr.findIndex(s => s.dataset.state === currentState);
        const nextIdx = curIdx + dir;
        if (nextIdx >= 0 && nextIdx < stepArr.length) {
            stepArr[nextIdx].scrollIntoView({ behavior: "smooth", block: "center" });
        }
    };

    document.addEventListener("keydown", (e) => {
        if (!navStates.has(currentState)) return;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") {
            e.preventDefault();
            window.stepNav(1);
        } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
            e.preventDefault();
            window.stepNav(-1);
        }
    });


    // ─── Resize ───
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            VizGrid.resize();
            ScrollTrigger.refresh();
        }, 200);
    });

    // ─── Fade-in for dramatic text cards ───
    const fadeObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) e.target.classList.add("visible");
            else e.target.classList.remove("visible");
        });
    }, { threshold: 0.3 });

    document.querySelectorAll(".step-card--dramatic").forEach(el => fadeObs.observe(el));

    console.log("Article controller initialized.");
})();
