
import { supabase } from './supabaseClient.js';

const listView      = document.getElementById('listView');
const galleryEl     = document.getElementById('historyGallery');
const keywordInput  = document.getElementById('filterKeyword');
const dateSelect    = document.getElementById('filterDate');

const detailView    = document.getElementById('detailView');
const backBtn       = document.getElementById('backBtn');
const detailRunIdEl = document.getElementById('detailRunId');
const detailComments= document.getElementById('detailComments');

let allRuns = [];

// Format ISO → MM/DD/YY HH:mm
function fmtDate(iso) {
    const d = new Date(iso);
    return `${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}/${String(d.getFullYear()).slice(-2)} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
}

async function loadRuns() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return;

    const { data, error } = await supabase
        .from('runs')
        .select('id, keywords, created_at, status')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return;
    }
    allRuns = data;
    renderGallery(allRuns);
}

// Render list of runs
function renderGallery(runs) {
    galleryEl.innerHTML = '';
    if (!runs.length) {
        galleryEl.innerHTML = `<div class="col-span-full text-center text-gray-500">No runs found.</div>`;
        return;
    }
    runs.forEach(r => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded-lg shadow hover:shadow-lg transition';
        card.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <span class="font-semibold text-gray-800">${fmtDate(r.created_at)}</span>
        <span class="text-sm px-2 py-1 rounded ${
            r.status==='displayed'?'bg-green-100 text-green-800':
                r.status==='finished'?'bg-blue-100 text-blue-800':
                    'bg-yellow-100 text-yellow-800'
        }">${r.status}</span>
      </div>
      <div class="text-sm text-gray-600 mb-4">
        Keywords: ${r.keywords.map(k=>`<span class="inline-block bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded mr-1">${k}</span>`).join('')}
      </div>
      <button data-id="${r.id}"
              class="view-comments w-full text-center bg-blue-600 text-white py-1 rounded hover:bg-blue-700 transition">
        View Comments
      </button>
    `;
        galleryEl.appendChild(card);
    });
    document.querySelectorAll('.view-comments').forEach(btn=>{
        btn.addEventListener('click', () => showDetail(btn.dataset.id));
    });
}

// Apply client-side filters
function applyFilters() {
    const kw = keywordInput.value.trim().toLowerCase();
    const dt = dateSelect.value;
    const now = Date.now();
    galleryEl.innerHTML = '';
    renderGallery(allRuns.filter(r => {
        if (kw && !r.keywords.some(k=>k.toLowerCase().includes(kw))) return false;
        if (dt!=='all') {
            const diff = now - new Date(r.created_at).getTime();
            const day = 1000*60*60*24;
            if (dt==='day' && diff>day) return false;
            if (dt==='week' && diff>day*7) return false;
            if (dt==='month' && diff>day*30) return false;
        }
        return true;
    }));
}

// Show detail view for one run
async function showDetail(runId) {
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');
    detailRunIdEl.textContent = runId;
    detailComments.innerHTML = `<div class="text-gray-500">Loading comments…</div>`;

    const { data, error } = await supabase
        .from('comments')
        .select('airtable_record_id, post_url, post_text, comment_text, author_name, profile_url, headline, posted_date, time_ago')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

    if (error) {
        detailComments.innerHTML = `<div class="text-red-500">Failed to load comments.</div>`;
        console.error(error);
        return;
    }

    if (!data.length) {
        detailComments.innerHTML = `<div class="text-gray-500">No comments found for this run.</div>`;
        return;
    }

    // Render each comment using same styling as carousel-card
    detailComments.innerHTML = '';
    data.forEach(c => {
        const backup_profile = c.profile_url?.trim() || 'images/defaultProfile.png';

        const card = document.createElement('div');
        card.className = 'carousel-card bg-white rounded-lg shadow p-6 space-y-4 border border-gray-200';

        card.innerHTML = `
        <div class="flex items-center space-x-4">
            <img src="${backup_profile}" alt="Profile" class="w-12 h-12 rounded-full border" />
            <div>
                <div class="font-semibold text-gray-800">${c.author_name}</div>
                <div class="text-sm text-gray-500">${c.headline}</div>
                <div class="text-xs text-gray-400">${c.time_ago} ago</div>
            </div>
        </div>
        <div class="text-sm text-gray-800 whitespace-pre-wrap">${c.post_text}</div>
        <div class="bg-gray-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">${c.comment_text}</div>
        <div>
            <a href="${c.post_url}" target="_blank" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 go-to-post-btn">Go to post</a>
        </div>
    `;

        detailComments.appendChild(card);
    });
}

// Back button
backBtn.addEventListener('click', () => {
    detailView.classList.add('hidden');
    listView.classList.remove('hidden');
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'EvolveIQ.html'; // redirect to login/home page after logout
});

function populateUserInfo(user) {
    const avatarEl   = document.getElementById('userAvatar');
    const nameEl     = document.getElementById('userName');
    const userInfoEl = document.getElementById('userInfo');
    const md         = user.user_metadata || {};
    const displayName = md.display_name || user.email;
    if (avatarEl && nameEl && userInfoEl) {
        avatarEl.src       = md.avatar_url || 'images/defaultProfile.png';
        nameEl.textContent = displayName;
        userInfoEl.classList.remove('hidden');
    }
}

// Init
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
        populateUserInfo(session.user); // populate navbar user info
        await loadRuns();
    } else {
        // not logged in, redirect back to login page
        window.location.href = 'EvolveIQ.html';
    }

    keywordInput.addEventListener('input', applyFilters);
    dateSelect.addEventListener('change', applyFilters);

    const params = new URLSearchParams(window.location.search);
    const runId = params.get('run');
    if (runId) showDetail(runId);
});