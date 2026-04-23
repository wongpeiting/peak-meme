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

    // Preload all grid thumbnails so they appear instantly when the grid builds
    const _thumbsReady = Promise.all(gridPosts.map(p => {
        if (!p.thumb) return Promise.resolve();
        return new Promise(resolve => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = p.thumb;
        });
    }));

    // Build lookup for related videos
    window._gridPostsById = {};
    gridPosts.forEach(p => { window._gridPostsById[p.id] = p; });

    // ─── Init viz modules ───
    VizGrid.init(null);
    // VizLineage removed — no longer used

    VizGrid.setData(gridPosts);
    VizGrid.setPreload(_thumbsReady);
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

    function _getTimelineType(state) {
        if (!state) return null;
        if (state === "lin-0" || state.startsWith("lin-prod-")) return "war";
        if ((state.startsWith("lin-game-") && state !== "lin-game-intro") || state === "lin-game-opponents") return "game";
        if (state.startsWith("lin-troll-") && state !== "lin-troll-intro") return "troll";
        if (state.startsWith("lin-exp-") && state !== "lin-exp-intro") return "expletive";
        if (state === "profanity" || state === "profanity-sources") return "profanity";
        return null;
    }

    function _applyState() {
        _rafId = null;
        const newState = _pendingState;
        if (newState === currentState) return;
        const prevState = currentState;
        currentState = newState;
        console.log(`State: ${prevState} → ${newState}`);

        // Fast-path: same timeline type → skip resetAll so DOM survives for smooth CSS transitions
        const newTlType = _getTimelineType(newState);
        const prevTlType = _getTimelineType(prevState);
        if (newTlType && prevTlType && newTlType === prevTlType) {
            VizStrike.show(newState);
            audioBtn.classList.add("visible");
            updateNavVisibility();
            updateLinProgress();
            if (isMobile) fitLinCard();
            return;
        }

        // Fast-path: mobile text steps → skip resetAll so videos keep playing
        const textStates = ["text-2", "text-3", "text-4", "text-5"];
        if (isMobile && textStates.includes(newState) && textStates.includes(prevState)) {
            const newIdx = textStates.indexOf(newState);
            if (newIdx >= 1) showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");
            if (newIdx >= 2) showMobileVid(vidOverlay3, vidEl3, "7614249170542562573", "q-tl");
            if (newIdx >= 3) showMobileVid(vidOverlay4, vidEl4, "7613864676010511629", "q-br");
            if (newIdx < 1) { vidOverlay2.classList.remove("active"); vidEl2.pause(); }
            if (newIdx < 2) { vidOverlay3.classList.remove("active"); vidEl3.pause(); }
            if (newIdx < 3) { vidOverlay4.classList.remove("active"); vidEl4.pause(); }
            audioBtn.classList.add("visible");
            updateNavVisibility();
            return;
        }

        // Fast-path (mobile only): grid-to-grid → skip resetAll so grid stays visible, just update highlight
        const _gridStates = new Set([
            "zoom-out-grid", "war-memes-all", "broader-shift",
            "headline", "roadmap", "three-acts", "grid-final", "pre-lineage",
            "lin-troll-intro", "lin-exp-intro", "lin-game-intro",
            "grid-return", "blind-spot-intro", "blind-spot-flagged", "blind-spot-unflagged", "kicker"
        ]);
        const isGridToGrid = isMobile && _gridStates.has(newState) && _gridStates.has(prevState);

        if (!isGridToGrid) {
            // Suppress CSS transitions during reset→rebuild (prevents flicker)
            _vizContainer.classList.add("notransition");
            // Reset everything to neutral first
            resetAll();
        }

        // Then activate only what this state needs
        switch (newState) {

            // ── Text steps with videos ──
            case "text-2":
                // Mobile: accumulate — Lizard appears bottom-left
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7613406980719283486", "q-bl");
                    audioBtn.classList.add("visible");
                    break;
                }
                // Desktop: Lizard left, Stay Frosty right
                showLizardFullscreen();
                if (!vidEl2.src.includes("7613501531765116191")) {
                    vidEl2.src = "videos/7613501531765116191.mp4";
                    vidEl2.load();
                }
                vidEl2.muted = !window.audioEnabled;
                vidOverlay2.classList.add("active");
                vidEl2.play().catch(() => {});
                break;

            case "text-3":
                // Mobile: accumulate — Stay Frosty appears top-right
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7613406980719283486", "q-bl");
                    showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");
                    audioBtn.classList.add("visible");
                    break;
                }
                // Desktop: HOME RUN left, Stay Frosty right
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
                if (!vidEl2.src.includes("7613501531765116191")) {
                    vidEl2.src = "videos/7613501531765116191.mp4";
                    vidEl2.load();
                }
                vidEl2.muted = !window.audioEnabled;
                vidOverlay2.classList.add("active");
                vidEl2.play().catch(() => {});
                break;

            case "text-4":
                // Mobile: accumulate — HOME RUN appears top-left
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7613406980719283486", "q-bl");
                    showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");
                    showMobileVid(vidOverlay3, vidEl3, "7614249170542562573", "q-tl");
                    audioBtn.classList.add("visible");
                    break;
                }
                // Desktop: HOME RUN left, Spongebob right
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
                // Mobile: accumulate — Spongebob appears bottom-right (all 4 now on screen)
                if (isMobile) {
                    showMobileVid(vidOverlay, vidEl, "7613406980719283486", "q-bl");
                    showMobileVid(vidOverlay2, vidEl2, "7613501531765116191", "q-tr");
                    showMobileVid(vidOverlay3, vidEl3, "7614249170542562573", "q-tl");
                    showMobileVid(vidOverlay4, vidEl4, "7613864676010511629", "q-br");
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
                if (isGridToGrid || prevState === "war-memes-all" || prevState === "grid-intro") {
                    // Grid already visible or scrolling back — instant
                    VizGrid.show(false);
                    VizGrid.zoomToPost(seenVideos, null, true);
                } else {
                    VizGrid.show(false);
                    VizGrid.zoomToPost(seenVideos, null, true);
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
                ], "wh-shaded");
                break;

            case "broader-shift":
                VizGrid.show();
                VizGrid.highlight("memes");
                break;

            case "headline":
                VizGrid.show();
                VizGrid.highlight("dim-all");
                break;

            case "roadmap":
            case "three-acts":
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
                VizGrid.zoomToPost([2, 4, 6, 12, 29, 52, 57, 76, 120, 125, 127, 149, 153, 158, 159, 163, 165, 166, 168, 172, 173, 175, 181, 185, 194, 199, 200, 213, 218, 219, 223, 224, 228, 232, 234, 236, 237, 239, 240, 242, 250, 256, 269, 280, 294, 295, 296, 300, 304, 307, 308, 313, 319, 321, 322, 324, 334, 338, 341, 349, 353, 361, 362, 375, 377, 379, 384, 386, 391, 401, 405, 409, 416, 419, 420, 424, 438, 441, 443, 451, 469, 473, 492, 499]);
                break;

            case "lin-exp-intro":
                VizGrid.show();
                VizGrid.zoomToPost([6, 49, 95, 122, 133, 173, 204, 209, 210, 220, 224, 250, 321, 335, 357, 361, 362, 364, 370, 372, 374, 382, 383, 386, 405, 416, 420, 422, 438, 445, 473, 482, 525, 533, 561], null, true);
                break;

            case "lin-game-intro":
                VizGrid.show();
                VizGrid.zoomToPost([6, 13, 29, 76, 127, 163, 166, 173, 175, 185, 200, 218, 219, 228, 232, 234, 236, 240, 256, 269, 294, 313, 315, 321, 322, 334, 341, 343, 362, 363, 375, 377, 379, 386, 391, 419, 424, 439, 500]);
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
                VizGrid.highlight("intro");
                break;

            case "grid-final": {
                VizGrid.show();
                VizGrid.highlight("all-final");
                const pkgChart = document.getElementById("pkg-chart");
                if (pkgChart && !pkgChart.dataset.built) {
                    const levels = [
                        { l: 7, label: "Gamified", avg: 6.4 },
                        { l: 6, label: "Meme", avg: 5.0 },
                        { l: 5, label: "Pop culture", avg: 3.2 },
                        { l: 4, label: "TikTok-native", avg: 3.4 },
                        { l: 3, label: "Produced", avg: 2.1 },
                        { l: 2, label: "Direct address", avg: 2.2 },
                        { l: 1, label: "Official", avg: 1.4 }
                    ];
                    pkgChart.innerHTML = `<div class="pkg-chart-inner" style="display:flex;gap:10px;">
                        <div style="display:flex;flex-direction:column;align-items:center;padding:0;width:20px;">
                            <div style="width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;border-bottom:11px solid #aaa;"></div>
                            <div style="width:2px;flex:1;background:#aaa;"></div>
                            <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:0.65rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;margin-top:4px;">Packaging intensity</div>
                        </div>
                        <div style="flex:1;display:flex;flex-direction:column;gap:10px;">` +
                    levels.map(lv => {
                        const pct = (lv.avg / 6.4 * 100).toFixed(0);
                        const barColor = lv.l >= 5 ? "#ff3b3b" : "#555";
                        return `<div style="display:flex;align-items:center;gap:10px;">
                            <div style="width:110px;text-align:right;font-size:0.9rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;flex-shrink:0;white-space:nowrap;">${lv.label}</div>
                            <div style="display:flex;align-items:center;height:30px;">
                                <div style="width:${pct * 2.5}px;height:100%;background:${barColor};"></div>
                                <div style="font-size:0.8rem;color:#fff;font-family:Inter,sans-serif;font-weight:700;margin-left:8px;">${lv.avg}M</div>
                            </div>
                        </div>`;
                    }).join("") + `</div></div>`;
                    // Mobile-friendly version
                    const mobileChart = document.createElement("div");
                    mobileChart.id = "pkg-chart-mobile";
                    mobileChart.innerHTML = `<div style="display:flex;gap:6px;">
                        <div style="display:flex;flex-direction:column;align-items:center;width:16px;flex-shrink:0;">
                            <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:9px solid #aaa;"></div>
                            <div style="width:1.5px;flex:1;background:#aaa;"></div>
                            <div style="writing-mode:vertical-rl;transform:rotate(180deg);font-size:0.55rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;margin-top:3px;">Packaging intensity</div>
                        </div>
                        <div style="flex:1;display:flex;flex-direction:column;gap:8px;">` +
                    levels.map(lv => {
                        const pct = (lv.avg / 6.4 * 100).toFixed(0);
                        const barColor = lv.l >= 5 ? "#ff3b3b" : "#555";
                        return `<div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:80px;text-align:right;font-size:0.7rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;flex-shrink:0;white-space:nowrap;">${lv.label}</div>
                            <div style="width:${pct}%;height:22px;background:${barColor};display:flex;align-items:center;justify-content:flex-end;padding-right:5px;min-width:35px;">
                                <span style="font-size:0.65rem;color:#fff;font-family:Inter,sans-serif;font-weight:700;">${lv.avg}M</span>
                            </div>
                        </div>`;
                    }).join("") + `</div></div>`;
                    pkgChart.appendChild(mobileChart);
                    const pkgFootnote = document.createElement("div");
                    pkgFootnote.style.cssText = "font-size:0.65rem;color:#777;font-family:'Space Grotesk',sans-serif;margin-top:28px;text-align:right;";
                    pkgFootnote.textContent = "Based on data of White House's first 600 TikToks as of April 22. Chart: Wong Pei Ting";
                    pkgChart.appendChild(pkgFootnote);
                    pkgChart.dataset.built = "1";
                }
                break;
            }

            case "blind-spot-intro":
                VizGrid.show();
                VizGrid.highlight("intro");
                break;

            case "blind-spot-flagged":
                VizGrid.show();
                VizGrid.highlight("blind-spot-flagged");
                break;

            case "blind-spot-unflagged":
                VizGrid.show();
                VizGrid.highlight("blind-spot-unflagged");
                break;

            case "kicker":
                VizGrid.show();
                VizGrid.highlight("blind-spot-unflagged");
                break;
        }

        // Update nav arrows + progress indicator
        updateNavVisibility();
        updateLinProgress();

        // Auto-shrink lineage text to fit mobile viewport (no scrollbars)
        if (isMobile) fitLinCard();

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

    // ─── Desktop reading progress bar ───
    if (!isMobile) {
        const _progBar = document.getElementById("reading-progress");
        const _progFill = document.getElementById("reading-progress-fill");
        const _article = document.getElementById("article");
        if (_progBar && _progFill && _article) {
            window.addEventListener("scroll", () => {
                const rect = _article.getBoundingClientRect();
                const articleH = _article.offsetHeight - window.innerHeight;
                const scrolled = -rect.top;
                if (scrolled < 0 || rect.bottom < 0) {
                    _progBar.classList.remove("visible");
                } else {
                    _progBar.classList.add("visible");
                    const pct = Math.min(100, Math.max(0, (scrolled / articleH) * 100));
                    _progFill.style.width = pct + "%";
                }
            }, { passive: true });
        }
    }

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

    // ─── Mobile: lineage progress indicator ───
    const linSections = [
        { label: "Produced", states: ["lin-0","lin-prod-0","lin-prod-1","lin-prod-2","lin-prod-grid"] },
        { label: "Gaming", states: ["lin-game-intro","lin-game-0","lin-game-1","lin-game-opponents","lin-game-2","lin-game-3"] },
        { label: "Troll", states: ["lin-troll-intro","lin-troll-0","lin-troll-1","lin-troll-2","lin-troll-3","lin-troll-4","lin-troll-5"] },
        { label: "Explicit", states: ["lin-exp-intro","lin-exp-0","lin-exp-1","lin-exp-2","lin-exp-3","lin-exp-4","profanity-sources","profanity","lin-exp-5","lin-exp-6"] },
    ];

    // Total steps across all sections
    const _allLinStates = linSections.flatMap(s => s.states);
    const _numSections = linSections.length;
    // Equal-sized sections: each gets 1/N of the bar
    const _sectionSize = 100 / _numSections;
    const _notchPcts = linSections.map((_, i) => i * _sectionSize);

    if (isMobile) {
        const prog = document.createElement("div");
        prog.id = "lin-progress";
        const notchesHTML = _notchPcts.slice(1).map(pct =>
            `<div class="lp-notch" style="top:${pct}%"></div>`
        ).join("");
        const labelsHTML = linSections.map((sec, i) => {
            const startPct = _notchPcts[i];
            const endPct = i < _notchPcts.length - 1 ? _notchPcts[i + 1] : 100;
            const midPct = (startPct + endPct) / 2 - 5 - (i === 0 ? 1 : 0);
            return `<div class="lp-section-label" data-section="${i}" style="top:${midPct}%">${sec.label}</div>`;
        }).join("");
        prog.innerHTML = `
            <div class="lp-track">
                <div class="lp-fill"></div>
                ${notchesHTML}
            </div>
            <div class="lp-dot"></div>
            ${labelsHTML}`;
        _vizContainer.appendChild(prog);
    }

    function updateLinProgress() {
        const prog = document.getElementById("lin-progress");
        if (!prog) return;

        // Find which section and step within it
        let activeSection = -1, stepInSection = -1;
        for (let i = 0; i < linSections.length; i++) {
            const idx = linSections[i].states.indexOf(currentState);
            if (idx >= 0) { activeSection = i; stepInSection = idx; break; }
        }
        const found = activeSection >= 0;
        prog.classList.toggle("visible", found);
        if (!found) return;

        // Position within equal-sized sections
        const stepsInSec = linSections[activeSection].states.length;
        const withinPct = stepsInSec > 1 ? stepInSection / (stepsInSec - 1) : 0;
        const pct = _notchPcts[activeSection] + withinPct * _sectionSize;

        prog.querySelector(".lp-fill").style.height = pct + "%";
        prog.querySelector(".lp-dot").style.top = pct + "%";

        // Highlight active section label
        const labels = prog.querySelectorAll(".lp-section-label");
        labels.forEach((el, i) => el.classList.toggle("active", i === activeSection));
    }



    // ─── Auto-shrink lineage text to fit viewport ───
    function fitLinCard() {
        // Delay past the 80ms content-setting timeouts so we measure the actual new text
        setTimeout(() => {
            const card = document.getElementById("lin-card");
            if (!card) return;
            const note = card.querySelector(".lin-ann-note");
            if (!note) return;
            // Reset to default size first
            note.style.fontSize = "";
            // Wait for layout to settle, then check overflow
            requestAnimationFrame(() => {
                let size = parseFloat(getComputedStyle(note).fontSize);
                const minSize = 15; // never go below 15px
                let tries = 0;
                while (card.scrollHeight > card.clientHeight && size > minSize && tries < 10) {
                    size -= 1;
                    note.style.fontSize = size + "px";
                    tries++;
                }
            });
        }, 120);
    }

    // ─── Resize ───
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            VizGrid.resize();
            ScrollTrigger.refresh();
            // Re-render lineage card for current state (responsive charts)
            if (currentState) VizStrike.show(currentState);
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
