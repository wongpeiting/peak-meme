/**
 * viz-strike.js — STRIKE lineage integrated into main scrollytelling
 */

const VizStrike = (() => {

    let data, allNodes = [], built = false;
    let linFocus, linCard, linTimeline, linChartWrap;
    let producedNodes = [];
    let gameNodes = [];
    let trollNodes = [];
    let trollPosts = null;
    let expletiveNodes = [];
    let expletivePosts = null;

    // ─── Timeline reuse state (desktop smooth transitions) ───
    let _curType = null;       // "war"|"game"|"troll"|"expletive"|"profanity"|null
    let _curTrack = null;      // reference to live .lt-track element
    let _curNodeMap = new Map(); // postId → DOM node element

    function _updateActiveNode(activeIds) {
        let activePcts = [];
        _curNodeMap.forEach((domNode, postId) => {
            const shouldBeActive = activeIds.has(postId);
            if (shouldBeActive) {
                domNode.classList.remove("visited");
                domNode.classList.add("current");
                const pct = parseFloat(domNode.style.getPropertyValue("--pct"));
                if (!isNaN(pct)) activePcts.push(pct);
            } else {
                domNode.classList.remove("current");
                domNode.classList.add("visited");
            }
        });
        if (activePcts.length && _curTrack) {
            const avg = activePcts.reduce((a, b) => a + b, 0) / activePcts.length;
            const shift = 50 - avg;
            _curTrack.style.setProperty("--shift", shift + "%");
        }
    }

    function _timelineTypeFor(stateStr) {
        if (!stateStr) return null;
        if (stateStr === "lin-0" || stateStr.startsWith("lin-prod-")) return "war";
        if (stateStr.startsWith("lin-game-") && stateStr !== "lin-game-intro") return "game";
        if (stateStr === "lin-game-opponents") return "game";
        if (stateStr.startsWith("lin-troll-") && stateStr !== "lin-troll-intro") return "troll";
        if (stateStr.startsWith("lin-exp-") && stateStr !== "lin-exp-intro") return "expletive";
        if (stateStr === "profanity" || stateStr === "profanity-sources") return "profanity";
        return null;
    }

    async function init() {
        linFocus = document.getElementById("lin-focus");
        linCard = document.getElementById("lin-card");
        linTimeline = document.getElementById("lin-timeline");

        try {
            const r = await fetch("data/strike_lineage.json");
            data = await r.json();
        } catch(e) { console.warn("No strike_lineage.json"); return; }

        producedNodes = data.produced || [];
        gameNodes = data.game_lineage || [];
        trollNodes = data.troll_lineage || [];
        expletiveNodes = data.expletive_lineage || [];

        // Build node sequence
        allNodes.push({ t:"pair", nodes:data.contrast, strand:"base", color:"#555", phase:"", note:data.contrast[0].note || "" });

        // Add chart wrap
        const cw = document.createElement("div");
        cw.id = "lin-chart-wrap";
        linFocus.appendChild(cw);
        linChartWrap = cw;

        built = true;
        console.log("VizStrike: loaded", allNodes.length, "nodes");
    }

    function show(stateStr) {
        if (!built || !data) return;

        linFocus.style.display = "block";

        // Produced grid — show all meme-packaged war footage posts in a grid
        if (stateStr === "lin-prod-grid") {
            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";
                const memeWarIds = [
                    "7613811589757685005","7613776128523783437","7613864676010511629",
                    "7614181238861073694","7614249170542562573","7614276299154033934",
                    "7613960217994300686","7615333290102230285","7616401495130410254",
                    "7616166285625347342"
                ];
                const memeVids = memeWarIds.map(id => {
                    const p = window._gridPostsById && window._gridPostsById[id];
                    return vidHTML(p ? { id: p.id, caption: p.caption || "", date: p.date || "", views: p.views || 0 } : { id, caption: "", date: "", views: 0 });
                });
                linCard.innerHTML = `
                    <div class="lin-ann" style="margin:0 0 12px 0;text-align:center;max-width:500px;">
                        <div class="lin-ann-note">Ten more meme-packaged combat videos followed over the next eight days.</div>
                    </div>
                    <div class="lin-mini-grid" style="grid-template-columns:repeat(5,1fr);max-width:500px;">
                        ${memeVids.join("")}
                    </div>`;
                linCard.querySelectorAll("video").forEach(v => {
                    v.muted = !window.audioEnabled;
                    v.play().catch(() => {});
                });
                linCard.style.opacity = "1";
                buildWarFootageTimeline(-1, null, memeWarIds);
            }, 80);
            return;
        }

        // Opponents — highlight fictional overlay posts targeting Democrats on the timeline
        if (stateStr === "lin-game-opponents") {
            const oppIds = new Set([
                "7542947006595992845","7556666668810800398","7557030891990633741",
                "7558104899855174926","7558292201394998583","7559690957357059383",
                "7564499904278662455","7564433271271017742","7567130387273551118",
                "7567086383890763021","7567484116174720311","7567807531255385399",
                "7570775034025823502","7572032437979483406","7585203475475123470",
                "7592371562431483191"
            ]);
            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";
                const oppArr = [...oppIds];
                const oppVids = oppArr.map(id => {
                    const p = window._gridPostsById && window._gridPostsById[id];
                    return vidHTML(p ? { id: p.id, caption: p.caption || "", date: p.date || "", views: p.views || 0 } : { id, caption: "", date: "", views: 0 });
                });
                linCard.innerHTML = `
                    <div class="lin-ann" style="margin:0 0 12px 0;text-align:center;max-width:500px;">
                        <div class="lin-ann-note">Sixteen of these posts targeted Democrats, compositing fictional elements onto footage of Chuck Schumer, Hakeem Jeffries, and Nancy Pelosi.</div>
                    </div>
                    <div class="lin-mini-grid">
                        ${oppVids.join("")}
                    </div>`;
                linCard.querySelectorAll("video").forEach(v => {
                    v.muted = !window.audioEnabled;
                    v.play().catch(() => {});
                });
                linCard.style.opacity = "1";
                buildGameTimelineHighlight(oppIds);
            }, 80);
            return;
        }

        // Profanity overview — dot grid comparing TikTok vs Instagram treatment
        if (stateStr === "profanity") {
            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                if (!profanityPosts || !profanityPosts.length) {
                    loadProfanityPosts().then(() => show("profanity"));
                    return;
                }
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";

                // Sort: uncensored first, then bleeped, then obscured
                const order = { uncensored: 0, bleeped: 1, obscured: 2 };
                const sorted = [...profanityPosts].sort((a, b) => (order[a.treatment] || 3) - (order[b.treatment] || 3));

                const treatColor = { uncensored: "#ff3b3b", bleeped: "#4a9eff", obscured: "#555" };
                const igColor = { no: "#94a3b8", yes_scrubbed: "#38bdf8", yes: "#22c55e" };
                const igLabel = { no: "Absent", yes_scrubbed: "Scrubbed", yes: "Posted as-is" };

                // Sort for IG row: absent first, scrubbed, posted
                const igSorted = [...profanityPosts].sort((a, b) => {
                    const o = { no: 0, yes: 1, yes_scrubbed: 2 };
                    return (o[a.on_instagram] ?? 3) - (o[b.on_instagram] ?? 3);
                });

                const dotSize = 24;
                const gap = 4;

                function dotRow(posts, colorFn) {
                    return posts.map(p =>
                        `<div style="width:${dotSize}px;height:${dotSize}px;background:${colorFn(p)};border-radius:0;"></div>`
                    ).join("");
                }

                const greenRows = [
                    { label: "Bleeped", count: 4 },
                    { label: "Hidden behind acronym", count: 2 },
                    { label: "bulls---", count: 1 },
                    { label: "s---", count: 1 }
                ];

                const isMob = window.innerWidth <= 700;
                const cellSize = isMob ? 28 : 36;
                const cellGap = isMob ? 3 : 5;
                const cols = 7;

                // Build waffle with annotations
                // Red: rows 0-3 full (28) + row 4 first 3 = 24 absent (but we have 24 absent, 8 green, 3 orange = 35)
                // Layout: 7 cols x 5 rows = 35 cells
                const cells = igSorted.map(p => igColor[p.on_instagram] || "#555");

                // Find boundaries for annotations
                const absentEnd = 24; // first 24 are red
                const greenEnd = 24 + 8; // next 8 are green
                // remaining 3 are orange

                const gridW = cols * cellSize + (cols - 1) * cellGap;
                const annStyle = "font-family:'Space Grotesk',sans-serif;font-size:0.85rem;font-weight:600;line-height:1.5;";
                const sideAnnotations = `
                        <div style="position:absolute;top:0;left:-10px;transform:translateX(-100%);${annStyle}color:#94a3b8;text-align:left;">
                            Absent from<br>Instagram
                        </div>
                        <div style="position:absolute;bottom:${cellSize + cellGap + 10}px;right:-10px;transform:translateX(100%);${annStyle}color:#22c55e;text-align:left;">
                            Posted as-is
                        </div>
                        <div style="position:absolute;bottom:0;right:-10px;transform:translateX(100%);${annStyle}color:#38bdf8;text-align:left;">
                            Scrubbed of<br>profanities
                        </div>`;
                const legendBelow = `
                    <div style="display:flex;flex-direction:column;align-items:flex-start;gap:6px;margin-top:12px;">
                        <div style="${annStyle}color:#94a3b8;font-size:0.75rem;display:flex;align-items:center;gap:5px;">
                            <div style="width:12px;height:12px;background:#94a3b8;border-radius:2px;"></div> Absent from Instagram
                        </div>
                        <div style="${annStyle}color:#22c55e;font-size:0.75rem;display:flex;align-items:center;gap:5px;">
                            <div style="width:12px;height:12px;background:#22c55e;border-radius:2px;"></div> Posted as-is
                        </div>
                        <div style="${annStyle}color:#38bdf8;font-size:0.75rem;display:flex;align-items:center;gap:5px;">
                            <div style="width:12px;height:12px;background:#38bdf8;border-radius:2px;"></div> Scrubbed
                        </div>
                    </div>`;
                linCard.innerHTML = `
                    <div class="lin-ann" style="margin:0 0 20px 0;text-align:center;max-width:500px;">
                        <div class="lin-ann-note">Of the 35 posts that contained profanities, 24 were absent from the White House's Instagram. The eight posted as-is were all bleeped, hidden behind acronyms, or used milder language like "bulls---" and "s---."</div>
                    </div>
                    <div class="waffle-wrap" style="position:relative;width:${gridW}px;margin:0 auto;">
                        <div style="display:grid;grid-template-columns:repeat(${cols},${cellSize}px);gap:${cellGap}px;">
                            ${cells.map(c => `<div style="width:${cellSize}px;height:${cellSize}px;background:${c};"></div>`).join("")}
                        </div>
                        ${isMob ? '' : sideAnnotations}
                    </div>
                    ${isMob ? legendBelow : ''}`;
                linCard.style.opacity = "1";
                buildProfanityTimeline();
            }, 80);
            return;
        }

        // Packaging level vs avg views bar chart
        if (stateStr === "packaging-views") {
            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            linTimeline.style.display = "none";
            setTimeout(() => {
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";

                const levels = [
                    { level: 1, label: "Official", avg: 1.3 },
                    { level: 2, label: "Direct address", avg: 2.1 },
                    { level: 3, label: "Produced", avg: 1.9 },
                    { level: 4, label: "TikTok-native", avg: 3.2 },
                    { level: 5, label: "Pop culture", avg: 3.1 },
                    { level: 6, label: "Meme", avg: 4.9 },
                    { level: 7, label: "Game UI", avg: 5.9 }
                ];
                const maxAvg = 5.9;

                linCard.innerHTML = `
                    <div class="lin-ann" style="margin:0 0 20px 0;text-align:center;max-width:500px;">
                        <div class="lin-ann-note">The algorithm rewarded every level of escalation. The higher the packaging level, the more views each post averaged.</div>
                    </div>
                    <div style="max-width:550px;margin:0 auto;display:flex;flex-direction:column;gap:8px;">
                        ${levels.map(l => {
                            const pct = (l.avg / maxAvg * 100).toFixed(0);
                            const isHighPkg = l.level >= 5;
                            const barColor = isHighPkg ? "#ff3b3b" : "#4a9eff";
                            return `
                            <div style="display:flex;align-items:center;gap:10px;">
                                <div style="width:120px;text-align:right;font-size:0.75rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;flex-shrink:0;">L${l.level} ${l.label}</div>
                                <div style="flex:1;height:22px;background:#1a1a1a;overflow:hidden;">
                                    <div style="width:${pct}%;height:100%;background:${barColor};"></div>
                                </div>
                                <div style="width:40px;font-size:0.7rem;color:#888;font-family:Inter,sans-serif;">${l.avg}M</div>
                            </div>`;
                        }).join("")}
                    </div>
                    <div style="font-size:0.6rem;color:#555;font-family:Inter,sans-serif;margin-top:12px;">Average views per post by packaging level</div>`;
                linCard.style.opacity = "1";
            }, 80);
            return;
        }

        // Profanity sources donut chart
        if (stateStr === "profanity-sources") {
            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";
                // Exclude Trump direct speech, sort by count descending
                const sources = (data.profanity_sources || [])
                    .filter(s => s.label !== "Trump direct speech")
                    .sort((a, b) => b.count - a.count);
                const maxCount = sources.length ? sources[0].count : 1;
                const chartId = "prof-bar-" + Date.now();
                linCard.innerHTML = `
                    <div class="lin-ann" style="margin:0 0 16px 0;text-align:center;max-width:500px;">
                        <div class="lin-ann-note">Where profanities did not come through the president or an acronym, they came from these sources.</div>
                    </div>
                    <div id="${chartId}" style="max-width:600px;margin:0 auto;display:flex;flex-direction:column;gap:14px;transform:translateX(-30px);">
                        ${sources.map(s => `
                            <div style="display:flex;align-items:center;gap:14px;">
                                <div style="width:120px;text-align:right;font-size:0.85rem;color:#aaa;font-family:'Space Grotesk',sans-serif;font-weight:600;flex-shrink:0;">${s.label}</div>
                                <div class="emoji-bar" style="font-size:1.4rem;letter-spacing:3px;text-align:left;">${"🤬".repeat(s.count)}</div>
                            </div>
                        `).join("")}
                    </div>`;
                linCard.style.opacity = "1";
                // Show profanity timeline (no highlight)
                buildProfanityTimeline();
            }, 80);
            return;
        }

        // Expletive lineage — show video + expletive timeline
        if (stateStr.startsWith("lin-exp-") && stateStr !== "lin-exp-intro") {
            const eidx = parseInt(stateStr.replace("lin-exp-", ""));
            const eNode = expletiveNodes[eidx];
            if (!eNode) return;

            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                if (eNode.related_id || eNode.related_ids) {
                    const relIds = eNode.related_ids || [eNode.related_id];
                    const relVids = relIds.map(rid => {
                        const rp = window._gridPostsById && window._gridPostsById[rid];
                        return vidHTML(rp ? { id: rp.id, caption: rp.caption || "", date: rp.date || "", views: rp.views || 0 } : { id: rid, caption: "", date: "", views: 0 });
                    });
                    linCard.style.flexDirection = "column";
                    linCard.style.textAlign = "center";
                    const pairClass = relIds.length >= 2 ? "lin-pair lin-pair--sm" : "lin-pair";
                    linCard.innerHTML = `
                        <div class="${pairClass}">
                            ${vidHTML(eNode)}
                            ${relVids.join("")}
                        </div>
                        <div class="lin-ann">
                            <div class="lin-ann-note">${eNode.note || ""}</div>
                        </div>`;
                } else {
                    linCard.style.flexDirection = "row";
                    linCard.style.textAlign = "left";
                    linCard.innerHTML = `
                        ${vidHTML(eNode)}
                        <div class="lin-ann">
                            <div class="lin-ann-note">${eNode.note || ""}</div>
                        </div>`;
                }
                linCard.querySelectorAll("video").forEach(v => {
                    v.muted = !window.audioEnabled;
                    v.play().catch(() => {});
                });
                linCard.style.opacity = "1";
                buildExpletiveTimeline(eidx);
            }, 80);
            return;
        }

        // Troll lineage — show video + troll timeline
        if (stateStr.startsWith("lin-troll-") && stateStr !== "lin-troll-intro") {
            const tidx = parseInt(stateStr.replace("lin-troll-", ""));
            const tNode = trollNodes[tidx];
            if (!tNode) return;

            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                if (tNode.related_id) {
                    linCard.style.flexDirection = "column";
                    linCard.style.textAlign = "center";
                    // Look up related post from grid data
                    let relNode = { id: tNode.related_id, caption: "", date: "", views: 0 };
                    if (window._gridPostsById && window._gridPostsById[tNode.related_id]) {
                        const rp = window._gridPostsById[tNode.related_id];
                        relNode = { id: rp.id, caption: rp.caption || "", date: rp.date || "", views: rp.views || 0 };
                    }
                    linCard.innerHTML = `
                        <div class="lin-pair">
                            ${vidHTML(tNode)}
                            ${vidHTML(relNode)}
                        </div>
                        <div class="lin-ann">
                            <div class="lin-ann-note">${tNode.note || ""}</div>
                        </div>`;
                } else {
                    linCard.style.flexDirection = "row";
                    linCard.style.textAlign = "left";
                    linCard.innerHTML = `
                        ${vidHTML(tNode)}
                        <div class="lin-ann">
                            <div class="lin-ann-note">${tNode.note || ""}</div>
                        </div>`;
                }
                linCard.querySelectorAll("video").forEach(v => {
                    v.muted = !window.audioEnabled;
                    v.play().catch(() => {});
                });
                linCard.style.opacity = "1";
                buildTrollTimeline(tidx);
            }, 80);
            return;
        }

        // Game lineage — show video + game lineage timeline
        if (stateStr.startsWith("lin-game-")) {
            const gidx = parseInt(stateStr.replace("lin-game-", ""));
            const gNode = gameNodes[gidx];
            if (!gNode) return;

            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                linCard.style.flexDirection = "row";
                linCard.style.textAlign = "left";
                linCard.innerHTML = `
                    ${vidHTML(gNode)}
                    <div class="lin-ann">
                        <div class="lin-ann-note">${gNode.note || ""}</div>
                    </div>`;
                linCard.querySelectorAll("video").forEach(v => {
                    v.muted = !window.audioEnabled;
                    v.play().catch(() => {});
                });
                linCard.style.opacity = "1";
                buildGameTimeline(gidx);
            }, 80);
            return;
        }

        // Produced posts — show video + highlight on war footage timeline
        if (stateStr.startsWith("lin-prod-")) {
            const pidx = parseInt(stateStr.replace("lin-prod-", ""));
            const pNode = producedNodes[pidx];
            if (!pNode) return;

            linChartWrap.classList.remove("visible");
            linCard.style.opacity = "0";
            setTimeout(() => {
                linCard.style.flexDirection = "row";
                linCard.style.textAlign = "left";
                linCard.innerHTML = `
                    ${vidHTML(pNode)}
                    <div class="lin-ann">
                        <div class="lin-ann-phase" style="color:#4a9eff">${pNode.phase || ""}</div>
                        <div class="lin-ann-note">${pNode.note || ""}</div>
                    </div>`;
                linCard.querySelectorAll("video").forEach(v => {
                    v.muted = !window.audioEnabled;
                    v.play().catch(() => {});
                });
                linCard.style.opacity = "1";
                buildWarFootageTimeline(-1, pNode.id);
            }, 80);
            return;
        }

        if (stateStr === "lin-chart") {
            linCard.style.opacity = "0";
            linTimeline.classList.remove("visible");
            linTimeline.style.display = "none";
            linChartWrap.classList.add("visible");
            return;
        }

        linChartWrap.classList.remove("visible");

        // Parse index
        let idx;
        if (stateStr === "lin-trans" || stateStr === "lin-trans2") {
            idx = stateStr === "lin-trans" ? allNodes.findIndex(n => n.strand === "trans") : allNodes.findIndex(n => n.strand === "trans2");
        } else if (stateStr === "lin-target") {
            idx = allNodes.length - 1;
        } else {
            idx = parseInt(stateStr.replace("lin-", ""));
        }

        if (idx < 0 || idx >= allNodes.length) return;

        const item = allNodes[idx];

        // Build card content
        linCard.style.opacity = "0";
        setTimeout(() => {
            if (item.t === "pair") {
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";
                linCard.innerHTML = `
                    <div class="lin-pair">
                        ${item.nodes.map(n => vidHTML(n)).join("")}
                    </div>
                    <div class="lin-ann">
                        <div class="lin-ann-phase" style="color:${item.color}">${item.phase}</div>
                        <div class="lin-ann-note">${item.note}</div>
                    </div>`;
            } else if (item.t === "trans") {
                linCard.style.flexDirection = "column";
                linCard.style.textAlign = "center";
                linCard.innerHTML = `<div class="lin-trans-text">${item.text}</div>`;
            } else {
                linCard.style.flexDirection = "row";
                linCard.style.textAlign = "left";
                linCard.innerHTML = `
                    ${vidHTML(item.n)}
                    <div class="lin-ann">
                        <div class="lin-ann-phase" style="color:${item.color}">${item.n.phase || item.sl || ""}</div>
                        <div class="lin-ann-note">${item.n.note || ""}</div>
                    </div>`;
            }

            linCard.querySelectorAll("video").forEach(v => {
                v.muted = !window.audioEnabled;
                v.play().catch(() => {});
            });

            linCard.style.opacity = "1";
            updateTimeline(idx);
        }, 80);
    }

    function hide() {
        if (linFocus) linFocus.style.display = "none";
        if (linTimeline) { linTimeline.classList.remove("visible"); linTimeline.style.display = "none"; }
        if (linChartWrap) linChartWrap.classList.remove("visible");
        if (linCard) { linCard.style.opacity = "0"; linCard.querySelectorAll("video").forEach(v => v.pause()); }
        _curType = null;
        _curTrack = null;
        _curNodeMap.clear();
    }

    function vidHTML(n) {
        const caption = n.caption || n.label || "";
        return `<div class="lin-vid">
            <video src="videos/${n.id}.mp4" playsinline loop muted></video>
            <div class="lin-vid-footer">
                <div class="lvf-handle">@whitehouse</div>
                <div class="lvf-caption">${caption}</div>
                <div class="lvf-meta">${n.date} · <strong>${(n.views/1e6).toFixed(1)}M views</strong></div>
            </div>
        </div>`;
    }

    function updateTimeline(idx) {
        linTimeline.innerHTML = "";
        _curType = null;
        _curTrack = null;
        _curNodeMap.clear();

        const item = allNodes[idx];
        if (item.t === "trans") {
            linTimeline.classList.remove("visible");
            linTimeline.style.display = "none";
            return;
        }

        // Baseline: show ALL real_war_footage posts on the timeline
        if (item.strand === "base") {
            buildWarFootageTimeline(idx);
            return;
        }

        const strand = item.strand;
        const sNodes = [];
        for (let i = 0; i < allNodes.length; i++) {
            const it = allNodes[i];
            if (it.strand === strand || (strand === "target" && (it.strand === "narrative" || it.strand === "sports"))) {
                if (it.t === "node") sNodes.push({ idx: i, n: it.n });
                if (it.t === "pair") it.nodes.forEach(n => sNodes.push({ idx: i, n }));
            }
        }

        if (!sNodes.length) return;

        const dates = sNodes.map(s => new Date(s.n.date));
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));
        const range = maxD - minD || 1;

        // Axis
        const axis = document.createElement("div");
        axis.className = "lt-axis";
        linTimeline.appendChild(axis);

        // Month ticks
        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(minD.getFullYear(), minD.getMonth(), 1);
        const end = new Date(maxD.getFullYear(), maxD.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    linTimeline.appendChild(tick);

                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    linTimeline.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        // Nodes
        sNodes.forEach(sn => {
            const d = new Date(sn.n.date);
            const pct = ((d - minD) / range) * 100;
            const node = document.createElement("div");
            node.className = "lt-node";
            if (sn.idx === idx) node.classList.add("current");
            else if (sn.idx < idx) node.classList.add("visited");
            node.style.setProperty("--pct", pct + "%");
            node.innerHTML = `<img src="images/grid/${sn.n.id}.jpg">`;
            linTimeline.appendChild(node);
        });

        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    // War footage timeline for baseline frame
    let warFootagePosts = null;

    async function loadWarFootage() {
        if (warFootagePosts) return;
        try {
            const r = await fetch("data/grid_posts.json");
            const all = await r.json();
            warFootagePosts = all
                .map((p, i) => ({ ...p, post_num: i + 1 }))
                .filter(p => (p.tags || []).includes("real_war_footage"));
        } catch(e) { warFootagePosts = []; }
    }

    function tierOf(p) {
        const pkg = p.packaging_level || 1;
        if (pkg <= 2) return { color: "#555", label: "Plain footage" };
        if (pkg <= 4) return { color: "#4a9eff", label: "Produced" };
        return { color: "#ff3b3b", label: "Meme-packaged" };
    }

    function buildWarFootageTimeline(activeIdx, highlightId, highlightIds) {
        if (!warFootagePosts || !warFootagePosts.length) {
            loadWarFootage().then(() => buildWarFootageTimeline(activeIdx, highlightId, highlightIds));
            return;
        }

        // Reuse existing DOM if same timeline type
        if (_curType === "war" && _curTrack) {
            const baseIds = new Set(data.contrast.map(n => n.id));
            const hlSet = highlightIds ? new Set(highlightIds) : null;
            const activeIds = new Set();
            if (hlSet) hlSet.forEach(id => activeIds.add(id));
            else if (highlightId) activeIds.add(highlightId);
            else baseIds.forEach(id => activeIds.add(id));
            _updateActiveNode(activeIds);
            return;
        }

        linTimeline.innerHTML = "";
        _curNodeMap.clear();

        const dates = warFootagePosts.map(p => new Date(p.date));
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));
        const range = maxD - minD || 1;

        // Track wrapper — pans horizontally to center active post
        const track = document.createElement("div");
        track.className = "lt-track";
        linTimeline.appendChild(track);

        // Axis
        const axis = document.createElement("div");
        axis.className = "lt-axis";
        track.appendChild(axis);

        // Month ticks
        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(minD.getFullYear(), minD.getMonth(), 1);
        const end = new Date(maxD.getFullYear(), maxD.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    track.appendChild(tick);

                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    track.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        // Baseline post IDs
        const baseIds = new Set(data.contrast.map(n => n.id));

        // Find the active post's percentage for panning
        let activePct = null;
        let activePctArr = null;
        const hlSet = highlightIds ? new Set(highlightIds) : null;

        // Plot all war footage posts, color-coded by packaging tier
        warFootagePosts.forEach(p => {
            const d = new Date(p.date);
            const pct = ((d - minD) / range) * 100;
            const tier = tierOf(p);
            const node = document.createElement("div");
            node.className = "lt-node lt-tiered";
            if (hlSet && hlSet.has(p.id)) {
                node.classList.add("current");
                if (!activePctArr) activePctArr = [];
                activePctArr.push(pct);
            } else if (highlightId && p.id === highlightId) {
                node.classList.add("current");
                activePct = pct;
            } else if (!highlightId && !hlSet && baseIds.has(p.id)) {
                node.classList.add("current");
                if (activePct === null) activePct = pct;
            } else {
                node.classList.add("visited");
            }
            node.style.setProperty("--pct", pct + "%");
            node.style.outlineColor = tier.color;
            node.innerHTML = `<img src="images/grid/${p.id}.jpg">`;
            track.appendChild(node);
            _curNodeMap.set(p.id, node);
        });

        // Use center of highlighted cluster if multiple
        if (activePctArr && activePctArr.length) {
            activePct = activePctArr.reduce((a, b) => a + b, 0) / activePctArr.length;
        }

        // Pan the track so the active post is centered
        if (activePct !== null) {
            const shift = 50 - activePct;
            track.style.setProperty("--shift", shift + "%");
        }

        // Legend with title — outside the track so it doesn't pan
        const legend = document.createElement("div");
        legend.className = "lt-legend";
        legend.innerHTML = `<span class="lt-legend-title">Use of combat footage</span>` +
            [
                { color: "#555", label: "Plain footage" },
                { color: "#4a9eff", label: "Produced" },
                { color: "#ff3b3b", label: "Meme-packaged" },
            ].map(t => `<span class="lt-legend-item"><span class="lt-legend-dot" style="background:${t.color}"></span>${t.label}</span>`).join("");
        linTimeline.appendChild(legend);

        _curType = "war";
        _curTrack = track;
        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    function buildChart() {
        const c = linChartWrap;
        c.style.cssText += "flex-direction:column;align-items:center;gap:6px;";

        // Baseline
        const baseRow = document.createElement("div");
        baseRow.style.cssText = "display:flex;gap:8px;";
        data.contrast.forEach(n => baseRow.appendChild(mini(n, "#555")));
        c.appendChild(baseRow);
        c.appendChild(cLine());

        const fl = document.createElement("div");
        fl.style.cssText = "font-size:0.35rem;color:#444;letter-spacing:0.1em;text-transform:uppercase;";
        fl.textContent = "two paths";
        c.appendChild(fl);

        const fork = document.createElement("div");
        fork.style.cssText = "display:flex;gap:48px;align-items:flex-start;margin-top:8px;";

        const left = document.createElement("div");
        left.className = "lc-col";
        const lt = document.createElement("div");
        lt.className = "lc-tag";
        lt.style.color = data.tracks.narrative.color;
        lt.textContent = "Troll";
        left.appendChild(lt);
        data.tracks.narrative.nodes.forEach((n, i) => {
            if (i > 0) left.appendChild(cLine());
            left.appendChild(mini(n, data.tracks.narrative.color));
        });

        const right = document.createElement("div");
        right.className = "lc-col";
        const rt = document.createElement("div");
        rt.className = "lc-tag";
        rt.style.color = data.tracks.sports.color;
        rt.textContent = "Sports";
        right.appendChild(rt);
        data.tracks.sports.nodes.forEach((n, i) => {
            if (i > 0) right.appendChild(cLine());
            right.appendChild(mini(n, data.tracks.sports.color));
        });

        // Language strand
        let mid = null;
        if (data.tracks.language) {
            mid = document.createElement("div");
            mid.className = "lc-col";
            const mt = document.createElement("div");
            mt.className = "lc-tag";
            mt.style.color = data.tracks.language.color;
            mt.textContent = "Language";
            mid.appendChild(mt);
            data.tracks.language.nodes.forEach((n, i) => {
                if (i > 0) mid.appendChild(cLine());
                mid.appendChild(mini(n, data.tracks.language.color));
            });
        }

        fork.appendChild(left);
        if (mid) fork.appendChild(mid);
        fork.appendChild(right);
        c.appendChild(fork);

        c.appendChild(cLine());
        const tgt = mini(data.target, "#faee00");
        tgt.classList.add("target");
        c.appendChild(tgt);
        const tl = document.createElement("div");
        tl.className = "lc-tag";
        tl.style.color = "#faee00";
        tl.style.fontSize = "0.5rem";
        tl.textContent = "STRIKE";
        c.appendChild(tl);
    }

    function mini(n, color) {
        const d = document.createElement("div");
        d.className = "lc-mini hl";
        d.style.outlineColor = color;
        d.innerHTML = `<img src="images/grid/${n.id}.jpg">`;
        return d;
    }
    function cLine() {
        const d = document.createElement("div");
        d.className = "lc-line";
        return d;
    }

    function buildGameTimelineHighlight(highlightIds) {
        if (!fictionalPosts || !fictionalPosts.length) {
            loadFictionalPosts().then(() => buildGameTimelineHighlight(highlightIds));
            return;
        }

        if (_curType === "game" && _curTrack) {
            _updateActiveNode(highlightIds);
            return;
        }

        linTimeline.innerHTML = "";
        _curNodeMap.clear();

        const dates = fictionalPosts.map(p => new Date(p.date));
        const rawMin = new Date(Math.min(...dates));
        const rawMax = new Date(Math.max(...dates));
        // Add 5% padding on each side
        const pad = (rawMax - rawMin) * 0.05;
        const minD = new Date(rawMin - pad);
        const maxD = new Date(+rawMax + pad);
        const range = maxD - minD || 1;

        const track = document.createElement("div");
        track.className = "lt-track";
        linTimeline.appendChild(track);

        const axis = document.createElement("div");
        axis.className = "lt-axis";
        track.appendChild(axis);

        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(rawMin.getFullYear(), rawMin.getMonth(), 1);
        const end = new Date(rawMax.getFullYear(), rawMax.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    track.appendChild(tick);
                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    track.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        fictionalPosts.forEach(p => {
            const d = new Date(p.date);
            const pct = ((d - minD) / range) * 100;
            const node = document.createElement("div");
            node.className = "lt-node";
            if (highlightIds.has(p.id)) {
                node.classList.add("current");
            } else {
                node.classList.add("visited");
            }
            node.style.setProperty("--pct", pct + "%");
            node.innerHTML = `<img src="images/grid/${p.id}.jpg">`;
            track.appendChild(node);
            _curNodeMap.set(p.id, node);
        });

        const legend = document.createElement("div");
        legend.className = "lt-legend";
        legend.innerHTML = `<span class="lt-legend-title">Fictional overlays on non-war posts</span>`;
        linTimeline.appendChild(legend);

        _curType = "game";
        _curTrack = track;
        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    let profanityPosts = null;

    async function loadProfanityPosts() {
        if (profanityPosts) return;
        try {
            const r = await fetch("data/profanity.json");
            const d = await r.json();
            profanityPosts = d.posts || [];
        } catch(e) { profanityPosts = []; }
    }

    function buildProfanityTimeline() {
        if (!profanityPosts || !profanityPosts.length) {
            loadProfanityPosts().then(() => buildProfanityTimeline());
            return;
        }

        if (_curType === "profanity" && _curTrack) return;

        linTimeline.innerHTML = "";
        _curNodeMap.clear();

        const dates = profanityPosts.map(p => new Date(p.date));
        const rawMin = new Date(Math.min(...dates));
        const rawMax = new Date(Math.max(...dates));
        const pad = (rawMax - rawMin) * 0.05;
        const minD = new Date(rawMin - pad);
        const maxD = new Date(+rawMax + pad);
        const range = maxD - minD || 1;

        const track = document.createElement("div");
        track.className = "lt-track";
        linTimeline.appendChild(track);

        const axis = document.createElement("div");
        axis.className = "lt-axis";
        track.appendChild(axis);

        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(rawMin.getFullYear(), rawMin.getMonth(), 1);
        const end = new Date(rawMax.getFullYear(), rawMax.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    track.appendChild(tick);
                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    track.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        const treatColor = {
            uncensored: "#ff3b3b",
            bleeped: "#4a9eff",
            obscured: "#8b7fc7",
            mixed: "#ff3b3b"
        };

        profanityPosts.forEach(p => {
            const d = new Date(p.date);
            const pct = ((d - minD) / range) * 100;
            const color = treatColor[p.treatment] || "#555";
            const node = document.createElement("div");
            node.className = "lt-node lt-tiered";
            node.classList.add("visited");
            node.style.setProperty("--pct", pct + "%");
            node.style.outlineColor = color;
            node.innerHTML = `<img src="images/grid/${p.id}.jpg">`;
            track.appendChild(node);
            _curNodeMap.set(p.id, node);
        });

        const legend = document.createElement("div");
        legend.className = "lt-legend";
        legend.innerHTML = `<span class="lt-legend-title">Profanity treatment</span>` +
            [
                { color: "#ff3b3b", label: "Uncensored" },
                { color: "#4a9eff", label: "Bleeped" },
                { color: "#8b7fc7", label: "Obscured" },
            ].map(t => `<span class="lt-legend-item"><span class="lt-legend-dot" style="background:${t.color}"></span>${t.label}</span>`).join("");
        linTimeline.appendChild(legend);

        _curType = "profanity";
        _curTrack = track;
        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    async function loadExpletivePosts() {
        if (expletivePosts) return;
        try {
            const [gridRes, profRes] = await Promise.all([
                fetch("data/grid_posts.json").then(r => r.json()),
                fetch("data/profanity.json").then(r => r.json()).catch(() => null)
            ]);
            const profById = {};
            if (profRes && profRes.posts) {
                profRes.posts.forEach(p => { profById[p.id] = p; });
            }
            expletivePosts = gridRes
                .map((p, i) => ({ ...p, post_num: i + 1, treatment: profById[p.id] ? profById[p.id].treatment : "unknown" }))
                .filter(p => (p.tags || []).includes("expletive"));
        } catch(e) { expletivePosts = []; }
    }

    function buildExpletiveTimeline(activeIdx) {
        if (!expletivePosts || !expletivePosts.length) {
            loadExpletivePosts().then(() => buildExpletiveTimeline(activeIdx));
            return;
        }

        if (_curType === "expletive" && _curTrack) {
            const eNode = expletiveNodes[activeIdx];
            const activeIds = new Set();
            if (eNode) {
                activeIds.add(eNode.id);
                if (eNode.related_id) activeIds.add(eNode.related_id);
                if (eNode.related_ids) eNode.related_ids.forEach(rid => activeIds.add(rid));
            }
            _updateActiveNode(activeIds);
            return;
        }

        linTimeline.innerHTML = "";
        _curNodeMap.clear();

        const dates = expletivePosts.map(p => new Date(p.date));
        const rawMin = new Date(Math.min(...dates));
        const rawMax = new Date(Math.max(...dates));
        const pad = (rawMax - rawMin) * 0.05;
        const minD = new Date(rawMin - pad);
        const maxD = new Date(+rawMax + pad);
        const range = maxD - minD || 1;

        const track = document.createElement("div");
        track.className = "lt-track";
        linTimeline.appendChild(track);

        const axis = document.createElement("div");
        axis.className = "lt-axis";
        track.appendChild(axis);

        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(rawMin.getFullYear(), rawMin.getMonth(), 1);
        const end = new Date(rawMax.getFullYear(), rawMax.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    track.appendChild(tick);
                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    track.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        const eNode = expletiveNodes[activeIdx];
        const activeIds = new Set();
        if (eNode) {
            activeIds.add(eNode.id);
            if (eNode.related_id) activeIds.add(eNode.related_id);
            if (eNode.related_ids) eNode.related_ids.forEach(rid => activeIds.add(rid));
        }
        let activePcts = [];

        const treatColor = {
            uncensored: "#ff3b3b",
            bleeped: "#4a9eff",
            obscured: "#8b7fc7",
            mixed: "#ff3b3b"
        };

        expletivePosts.forEach(p => {
            const d = new Date(p.date);
            const pct = ((d - minD) / range) * 100;
            const color = treatColor[p.treatment] || "#555";
            const node = document.createElement("div");
            node.className = "lt-node lt-tiered";
            if (activeIds.has(p.id)) {
                node.classList.add("current");
                activePcts.push(pct);
            } else {
                node.classList.add("visited");
            }
            node.style.setProperty("--pct", pct + "%");
            node.style.outlineColor = color;
            node.innerHTML = `<img src="images/grid/${p.id}.jpg">`;
            track.appendChild(node);
            _curNodeMap.set(p.id, node);
        });

        if (activePcts.length) {
            const avg = activePcts.reduce((a, b) => a + b, 0) / activePcts.length;
            const shift = 50 - avg;
            track.style.setProperty("--shift", shift + "%");
        }

        const legend = document.createElement("div");
        legend.className = "lt-legend";
        legend.innerHTML = `<span class="lt-legend-title">Profanity treatment</span>` +
            [
                { color: "#ff3b3b", label: "Uncensored" },
                { color: "#4a9eff", label: "Bleeped" },
                { color: "#8b7fc7", label: "Obscured" },
            ].map(t => `<span class="lt-legend-item"><span class="lt-legend-dot" style="background:${t.color}"></span>${t.label}</span>`).join("");
        linTimeline.appendChild(legend);

        _curType = "expletive";
        _curTrack = track;
        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    async function loadTrollPosts() {
        if (trollPosts) return;
        try {
            const r = await fetch("data/grid_posts.json");
            const all = await r.json();
            trollPosts = all
                .map((p, i) => ({ ...p, post_num: i + 1 }))
                .filter(p =>
                    (p.tags || []).includes("troll")
                    && p.subject !== "war"
                );
        } catch(e) { trollPosts = []; }
    }

    function buildTrollTimeline(activeIdx) {
        if (!trollPosts || !trollPosts.length) {
            loadTrollPosts().then(() => buildTrollTimeline(activeIdx));
            return;
        }

        if (_curType === "troll" && _curTrack) {
            const tNode = trollNodes[activeIdx];
            const activeIds = new Set();
            if (tNode) {
                activeIds.add(tNode.id);
                if (tNode.related_id) activeIds.add(tNode.related_id);
            }
            _updateActiveNode(activeIds);
            return;
        }

        linTimeline.innerHTML = "";
        _curNodeMap.clear();

        const dates = trollPosts.map(p => new Date(p.date));
        const rawMin = new Date(Math.min(...dates));
        const rawMax = new Date(Math.max(...dates));
        const pad = (rawMax - rawMin) * 0.05;
        const minD = new Date(rawMin - pad);
        const maxD = new Date(+rawMax + pad);
        const range = maxD - minD || 1;

        const track = document.createElement("div");
        track.className = "lt-track";
        linTimeline.appendChild(track);

        const axis = document.createElement("div");
        axis.className = "lt-axis";
        track.appendChild(axis);

        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(rawMin.getFullYear(), rawMin.getMonth(), 1);
        const end = new Date(rawMax.getFullYear(), rawMax.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    track.appendChild(tick);
                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    track.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        const tNode = trollNodes[activeIdx];
        const activeIds = new Set();
        if (tNode) {
            activeIds.add(tNode.id);
            if (tNode.related_id) activeIds.add(tNode.related_id);
        }
        let activePct = null;

        trollPosts.forEach(p => {
            const d = new Date(p.date);
            const pct = ((d - minD) / range) * 100;
            const node = document.createElement("div");
            node.className = "lt-node";
            if (activeIds.has(p.id)) {
                node.classList.add("current");
                if (activePct === null) activePct = pct;
            } else {
                node.classList.add("visited");
            }
            node.style.setProperty("--pct", pct + "%");
            node.innerHTML = `<img src="images/grid/${p.id}.jpg">`;
            track.appendChild(node);
            _curNodeMap.set(p.id, node);
        });

        if (activePct !== null) {
            const shift = 50 - activePct;
            track.style.setProperty("--shift", shift + "%");
        }

        const legend = document.createElement("div");
        legend.className = "lt-legend";
        legend.innerHTML = `<span class="lt-legend-title">Troll posts on non-war subjects</span>`;
        linTimeline.appendChild(legend);

        _curType = "troll";
        _curTrack = track;
        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    let fictionalPosts = null;

    async function loadFictionalPosts() {
        if (fictionalPosts) return;
        try {
            const r = await fetch("data/grid_posts.json");
            const all = await r.json();
            fictionalPosts = all
                .map((p, i) => ({ ...p, post_num: i + 1 }))
                .filter(p =>
                    (p.tags || []).includes("fictional_overlay")
                    && p.subject !== "war"
                );
        } catch(e) { fictionalPosts = []; }
    }

    function buildGameTimeline(activeIdx) {
        if (!fictionalPosts || !fictionalPosts.length) {
            loadFictionalPosts().then(() => buildGameTimeline(activeIdx));
            return;
        }

        if (_curType === "game" && _curTrack) {
            const activeId = gameNodes[activeIdx] ? gameNodes[activeIdx].id : null;
            _updateActiveNode(activeId ? new Set([activeId]) : new Set());
            return;
        }

        linTimeline.innerHTML = "";
        _curNodeMap.clear();

        const dates = fictionalPosts.map(p => new Date(p.date));
        const minD = new Date(Math.min(...dates));
        const maxD = new Date(Math.max(...dates));
        const range = maxD - minD || 1;

        const track = document.createElement("div");
        track.className = "lt-track";
        linTimeline.appendChild(track);

        // Axis
        const axis = document.createElement("div");
        axis.className = "lt-axis";
        track.appendChild(axis);

        // Month ticks
        const mNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const seen = new Set();
        let td = new Date(minD.getFullYear(), minD.getMonth(), 1);
        const end = new Date(maxD.getFullYear(), maxD.getMonth() + 1, 1);
        while (td <= end) {
            const pct = ((td - minD) / range) * 100;
            if (pct >= -5 && pct <= 105) {
                const k = td.getFullYear() + "-" + td.getMonth();
                if (!seen.has(k)) {
                    seen.add(k);
                    const tick = document.createElement("div");
                    tick.className = "lt-tick";
                    tick.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    track.appendChild(tick);

                    const label = document.createElement("div");
                    label.className = "lt-month";
                    label.style.setProperty("--pct", Math.max(0, Math.min(100, pct)) + "%");
                    label.textContent = mNames[td.getMonth()] + " '" + td.getFullYear().toString().slice(2);
                    track.appendChild(label);
                }
            }
            td.setMonth(td.getMonth() + 1);
        }

        // Active game node ID
        const activeId = gameNodes[activeIdx] ? gameNodes[activeIdx].id : null;
        let activePct = null;

        // Plot all 46 fictional overlay posts
        fictionalPosts.forEach(p => {
            const d = new Date(p.date);
            const pct = ((d - minD) / range) * 100;
            const node = document.createElement("div");
            node.className = "lt-node";
            if (p.id === activeId) {
                node.classList.add("current");
                activePct = pct;
            } else {
                node.classList.add("visited");
            }
            node.style.setProperty("--pct", pct + "%");
            node.innerHTML = `<img src="images/grid/${p.id}.jpg">`;
            track.appendChild(node);
            _curNodeMap.set(p.id, node);
        });

        // Pan
        if (activePct !== null) {
            const shift = 50 - activePct;
            track.style.setProperty("--shift", shift + "%");
        }

        // Legend
        const legend = document.createElement("div");
        legend.className = "lt-legend";
        legend.innerHTML = `<span class="lt-legend-title">Fictional overlays on non-war posts</span>`;
        linTimeline.appendChild(legend);

        _curType = "game";
        _curTrack = track;
        linTimeline.style.display = "block";
        linTimeline.classList.add("visible");
    }

    return { init, show, hide, timelineTypeFor: _timelineTypeFor };
})();
