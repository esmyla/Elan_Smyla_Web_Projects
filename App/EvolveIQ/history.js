import { supabase } from "./supabaseClient.js";

const listView = document.getElementById("listView");
const galleryEl = document.getElementById("historyGallery");
const keywordInput = document.getElementById("filterKeyword");
const dateSelect = document.getElementById("filterDate");

const detailView = document.getElementById("detailView");
const backBtn = document.getElementById("backBtn");
const detailRunIdEl = document.getElementById("detailRunId");
const detailComments = document.getElementById("detailComments");

let allRuns = [];

// Format ISO → MM/DD/YY HH:mm
function fmtDate(iso) {
    const d = new Date(iso);
    return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(
        d.getDate()
    ).padStart(2, "0")}/${String(d.getFullYear()).slice(-2)} ${String(
        d.getHours()
    ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Load demo runs
async function loadRuns() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    allRuns = [
        {
            id: "demo1",
            keywords: ["AI", "Startups"],
            created_at: new Date(Date.now() - 3600 * 1000).toISOString(),
            status: "finished",
        },
        {
            id: "demo2",
            keywords: ["Climate"],
            created_at: new Date(Date.now() - 86400 * 1000).toISOString(),
            status: "displayed",
        },
        {
            id: "demo3",
            keywords: ["FinTech", "Crypto"],
            created_at: new Date(Date.now() - 86400 * 3 * 1000).toISOString(),
            status: "pending",
        },
    ];
    renderGallery(allRuns);
}

// Render run cards
function renderGallery(runs) {
    galleryEl.innerHTML = "";
    if (!runs.length) {
        galleryEl.innerHTML =
            `<div class="col-span-full text-center text-gray-500">No runs found.</div>`;
        return;
    }
    runs.forEach((r) => {
        const card = document.createElement("div");
        card.className =
            "bg-white p-4 rounded-lg shadow hover:shadow-lg transition";
        card.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <span class="font-semibold text-gray-800">${fmtDate(r.created_at)}</span>
        <span class="text-sm px-2 py-1 rounded ${
            r.status === "displayed"
                ? "bg-green-100 text-green-800"
                : r.status === "finished"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-yellow-100 text-yellow-800"
        }">${r.status}</span>
      </div>
      <div class="text-sm text-gray-600 mb-4">
        Keywords: ${r.keywords
            .map(
                (k) =>
                    `<span class="inline-block bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded mr-1">${k}</span>`
            )
            .join("")}
      </div>
      <button data-id="${r.id}"
        class="view-comments w-full text-center bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition">
        View Comments
      </button>
    `;
        galleryEl.appendChild(card);
    });
    document.querySelectorAll(".view-comments").forEach((btn) => {
        btn.addEventListener("click", () => showDetail(btn.dataset.id));
    });
}

// Apply filters
function applyFilters() {
    const kw = keywordInput.value.trim().toLowerCase();
    const dt = dateSelect.value;
    const now = Date.now();
    renderGallery(
        allRuns.filter((r) => {
            if (kw && !r.keywords.some((k) => k.toLowerCase().includes(kw)))
                return false;
            if (dt !== "all") {
                const diff = now - new Date(r.created_at).getTime();
                const day = 1000 * 60 * 60 * 24;
                if (dt === "day" && diff > day) return false;
                if (dt === "week" && diff > day * 7) return false;
                if (dt === "month" && diff > day * 30) return false;
            }
            return true;
        })
    );
}

// Show comments for a run (demo only)
function showDetail(runId) {
    listView.classList.add("hidden");
    detailView.classList.remove("hidden");
    detailRunIdEl.textContent = runId;

    // demo comments
    detailComments.innerHTML = `
    <div class="carousel-card bg-white rounded-lg shadow p-6 border border-gray-200">
      <div class="font-semibold text-gray-800 mb-2">Example Author</div>
      <div class="text-sm text-gray-600 mb-2">This is a demo LinkedIn-style post for run ${runId}.</div>
      <div class="bg-gray-100 p-3 rounded text-sm text-gray-800">This is a demo comment text.</div>
    </div>
  `;
}

// Back button
backBtn.addEventListener("click", () => {
    detailView.classList.add("hidden");
    listView.classList.remove("hidden");
});

// Logout
document.getElementById("logoutBtn").addEventListener("click", async () => {
    await supabase.auth.signOut();
    window.location.href = "index.html";
});

// Populate user info
function populateUserInfo(user) {
    const avatarEl = document.getElementById("userAvatar");
    const nameEl = document.getElementById("userName");
    const userInfoEl = document.getElementById("userInfo");
    const md = user.user_metadata || {};
    avatarEl.src = md.avatar_url || "images/defaultProfile.png";
    nameEl.textContent = md.display_name || user.email;
    userInfoEl.classList.remove("hidden");
}

// Init
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        populateUserInfo(session.user);
        await loadRuns();
    } else {
        window.location.href = "index.html";
    }

    supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user) {
            window.location.href = "index.html";
        }
    });

    keywordInput.addEventListener("input", applyFilters);
    dateSelect.addEventListener("change", applyFilters);
});
