/**
 * viz-grid.js — Vanilla JS grid of 600 posts
 * Ported from war-memes/script.js. Uses CSS grid, not D3.
 * Renders into #viz-grid (a div, not SVG).
 */

const VizGrid = (() => {

    let container, posts;
    let gridEl, videoBox, vid, vidCaption;
    let built = false;

    function init(svgEl) {
        // We don't use the SVG — we use #viz-grid div
        container = document.getElementById("viz-grid");
    }

    function setData(gridPosts) {
        posts = gridPosts;
    }

    function build() {
        if (built || !posts) return;

        container.innerHTML = `
            <div id="wh-grid-timeline"></div>
            <div id="wh-grid"></div>
            <div id="wh-video-box">
                <div class="wh-video-phone">
                    <video id="wh-vid" playsinline loop muted controls></video>
                </div>
                <div id="wh-vid-caption"></div>
            </div>
        `;

        gridEl = document.getElementById("wh-grid");
        videoBox = document.getElementById("wh-video-box");
        vid = document.getElementById("wh-vid");
        vidCaption = document.getElementById("wh-vid-caption");

        const isMobile = window.innerWidth <= 768;
        const monthLabels = {
            "2025-08": "Aug '25", "2025-09": "Sep", "2025-10": "Oct",
            "2025-11": "Nov", "2025-12": "Dec",
            "2026-01": "Jan '26", "2026-02": "Feb", "2026-03": "Mar",
            "2026-04": "Apr",
        };

        let currentMonth = null;
        posts.forEach((p, i) => {
            if (isMobile && p.month !== currentMonth) {
                currentMonth = p.month;
                const label = document.createElement("div");
                label.className = "wh-month-label";
                label.textContent = monthLabels[p.month] || p.month;
                gridEl.appendChild(label);
            }

            const cell = document.createElement("div");
            cell.className = "wh-cell";
            cell.dataset.index = i;
            if (p.thumb) {
                const img = document.createElement("img");
                img.src = p.thumb;
                img.loading = i < 200 ? "eager" : "lazy";
                cell.appendChild(img);
            }
            gridEl.appendChild(cell);
        });

        // Build timeline
        buildTimeline(monthLabels);
        built = true;
    }

    function buildTimeline(monthLabels) {
        const timeline = document.getElementById("wh-grid-timeline");
        if (!timeline || !posts.length) return;

        const total = posts.length;
        const months = [];
        let currentMonth = null;
        posts.forEach((p, i) => {
            if (p.month !== currentMonth) {
                months.push({ month: p.month, startIdx: i });
                currentMonth = p.month;
            }
        });

        timeline.innerHTML = "";
        months.forEach((m, i) => {
            const nextStart = i < months.length - 1 ? months[i + 1].startIdx : total;
            const startPct = (m.startIdx / total) * 100;
            const widthPct = ((nextStart - m.startIdx) / total) * 100;

            const div = document.createElement("div");
            div.className = "wh-timeline-month";
            div.style.position = "absolute";
            div.style.left = startPct + "%";
            div.style.width = widthPct + "%";
            div.textContent = monthLabels[m.month] || m.month;
            timeline.appendChild(div);
        });
    }

    function show(cascade) {
        if (!built) build();
        container.style.display = "flex";
        container.style.zIndex = "50";
        document.getElementById("viz-svg").style.display = "none";

        const cells = gridEl.querySelectorAll(".wh-cell");
        // Always clear old state first
        cells.forEach(c => { c.className = "wh-cell"; c.style.opacity = ""; c.style.outline = ""; });
        if (cascade) {
            // Cascade: cells appear one by one left-to-right
            cells.forEach(c => { c.style.opacity = "0"; });
            cells.forEach((c, i) => {
                setTimeout(() => {
                    c.classList.add("on");
                    c.style.opacity = "";
                }, i * 2.5);
            });
        } else {
            cells.forEach(c => c.classList.add("on"));
        }
    }

    function hide() {
        if (!container) return;
        container.style.display = "none";
        container.style.zIndex = "";
        document.getElementById("viz-svg").style.display = "";
        if (gridEl) {
            gridEl.querySelectorAll(".wh-cell").forEach(c => { c.className = "wh-cell"; c.style.opacity = ""; c.style.outline = ""; });
        }
    }

    function highlight(mode) {
        if (!gridEl || !posts) return;
        const cells = gridEl.querySelectorAll(".wh-cell");

        cells.forEach((c, i) => {
            c.className = "wh-cell";
            c.style.opacity = "";
            c.style.outline = "";
            const p = posts[i];
            if (!p) return;

            switch (mode) {
                case "intro":
                    c.classList.add("on");
                    break;

                case "dim-all":
                    c.classList.add("on");
                    c.style.opacity = "0.4";
                    break;

                case "memes":
                case "meme-views":
                    if (p.packaging_level >= 5) c.classList.add("on", "wh-highlight");
                    else c.classList.add("wh-dim");
                    break;

                case "war":
                    if (p.subject === "war") c.classList.add("on", "wh-highlight");
                    else c.classList.add("wh-dim");
                    break;

                case "meme-war":
                case "meme-war-views":
                case "engagement":
                    if (p.subject === "war" && p.packaging_level >= 5) c.classList.add("on", "wh-highlight");
                    else if (p.subject === "war") { c.classList.add("on"); c.style.opacity = "0.3"; }
                    else c.classList.add("wh-dim");
                    break;

                case "game-ui":
                    if (p.packaging === "game_ui") c.classList.add("on", "wh-highlight");
                    else c.classList.add("wh-dim");
                    break;

                case "silence":
                    if (p.date >= "2026-03-17") { c.classList.add("on"); c.style.opacity = "0.15"; }
                    else if (p.date >= "2026-03-01") {
                        c.classList.add("on");
                        if (p.subject === "war" && p.packaging_level >= 5) c.classList.add("wh-highlight");
                        else c.style.opacity = "0.3";
                    } else c.classList.add("wh-dim");
                    break;

                case "all-final":
                    c.classList.add("on");
                    if (p.packaging_level >= 5) c.classList.add("wh-highlight-red");
                    else c.classList.add("wh-dim");
                    break;

                default:
                    c.classList.add("on");
            }
        });
    }

    function zoomToPost(postIndices) {
        if (!gridEl || !posts) return;
        const cells = gridEl.querySelectorAll(".wh-cell");
        const indices = Array.isArray(postIndices) ? new Set(postIndices) : new Set([postIndices]);

        cells.forEach((c, i) => {
            c.className = "wh-cell";
            c.style.opacity = "";
            c.style.outline = "";
            if (indices.has(i)) {
                c.classList.add("on", "wh-highlight");
            } else {
                c.classList.add("on");
                c.style.opacity = "0.4";
            }
        });
    }

    function showVideo(postIndex) {
        if (!posts || !vid) return;
        const post = posts[postIndex];
        if (!post) return;

        vid.src = `videos/${post.id}.mp4`;
        vid.load();
        vidCaption.textContent = "";
        videoBox.classList.add("active");
        vid.play().catch(() => {});
    }

    function hideVideo() {
        if (!videoBox) return;
        videoBox.classList.remove("active");
        if (vid) vid.pause();
    }

    function getCellRect(postIndex) {
        if (!gridEl) return null;
        const cells = gridEl.querySelectorAll(".wh-cell");
        const cell = cells[postIndex];
        if (!cell) return null;
        return cell.getBoundingClientRect();
    }

    function resetZoom() {
        if (!gridEl) return;
        const cells = gridEl.querySelectorAll(".wh-cell");
        cells.forEach(c => {
            c.className = "wh-cell on";
            c.style.opacity = "";
        });
    }

    function resize() {}

    return { init, setData, show, hide, highlight, zoomToPost, showVideo, hideVideo, getCellRect, resetZoom, resize };

})();
