/****************** SENSITIVE CODE REMOVED FOR SECURITY AND IP REASONS ******************/
/****************** SENSITIVE CODE REMOVED FOR SECURITY AND IP REASONS ******************/
/****************** SENSITIVE CODE REMOVED FOR SECURITY AND IP REASONS ******************/


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

// async function loadRuns() {
//     const { data: { session } } = await supabase.auth.getSession();
//     if (!session?.user) return;
//
//     const { data, error } = await supabase
//         .from('runs')
//         .select('id, keywords, created_at, status')
//         .eq('user_id', session.user.id)
//         .order('created_at', { ascending: false });
//
//     if (error) {
//         console.error(error);
//         return;
//     }
//     allRuns = data;
//     renderGallery(allRuns);
// }

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

    if (!data || !data.length) {
        // --- Example runs for testing ---
        allRuns = [
            {
                id: 'demo1',
                keywords: ['AI', 'Startups'],
                created_at: new Date(Date.now() - 3600*1000).toISOString(), // 1h ago
                status: 'finished'
            },
            {
                id: 'demo2',
                keywords: ['Climate'],
                created_at: new Date(Date.now() - 86400*1000).toISOString(), // 1d ago
                status: 'displayed'
            },
            {
                id: 'demo3',
                keywords: ['FinTech','Crypto'],
                created_at: new Date(Date.now() - 86400*3*1000).toISOString(), // 3d ago
                status: 'pending'
            }
        ];
    } else {
        allRuns = data;
    }

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
// async function showDetail(runId) {
//     listView.classList.add('hidden');
//     detailView.classList.remove('hidden');
//     detailRunIdEl.textContent = runId;
//     detailComments.innerHTML = `<div class="text-gray-500">Loading comments…</div>`;
//
//     const { data, error } = await supabase
//         .from('comments')
//         .select('airtable_record_id, post_url, post_text, comment_text, author_name, profile_url, headline, posted_date, time_ago')
//         .eq('run_id', runId)
//         .order('created_at', { ascending: true });
//
//     if (error) {
//         detailComments.innerHTML = `<div class="text-red-500">Failed to load comments.</div>`;
//         console.error(error);
//         return;
//     }
//
//     if (!data.length) {
//         detailComments.innerHTML = `<div class="text-gray-500">No comments found for this run.</div>`;
//         return;
//     }
//
//     // Render each comment using same styling as carousel-card
//     detailComments.innerHTML = '';
//     data.forEach(c => {
//         const backup_profile = c.profile_url?.trim() || 'images/defaultProfile.png';
//
//         const card = document.createElement('div');
//         card.className = 'carousel-card bg-white rounded-lg shadow p-6 space-y-4 border border-gray-200';
//
//         card.innerHTML = `
//         <div class="flex items-center space-x-4">
//             <img src="${backup_profile}" alt="Profile" class="w-12 h-12 rounded-full border" />
//             <div>
//                 <div class="font-semibold text-gray-800">${c.author_name}</div>
//                 <div class="text-sm text-gray-500">${c.headline}</div>
//                 <div class="text-xs text-gray-400">${c.time_ago} ago</div>
//             </div>
//         </div>
//         <div class="text-sm text-gray-800 whitespace-pre-wrap">${c.post_text}</div>
//         <div class="bg-gray-100 p-3 rounded text-sm text-gray-800 whitespace-pre-wrap">${c.comment_text}</div>
//         <div>
//             <a href="${c.post_url}" target="_blank" class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 go-to-post-btn">Go to post</a>
//         </div>
//     `;
//
//         detailComments.appendChild(card);
//     });
// }

async function showDetail(runId) {
    listView.classList.add('hidden');
    detailView.classList.remove('hidden');
    detailRunIdEl.textContent = runId;
    detailComments.innerHTML = `<div class="text-gray-500">Loading comments…</div>`;

    let data = [];
    let error = null;

    // Demo runs with realistic LinkedIn-style posts & comments
    if (runId === "demo1") {
        // Keywords: AI, Startups
        data = [
            {
                profile_url: "images/defaultProfile.png",
                author_name: "Jane Doe",
                headline: "AI Researcher at OpenAI",
                time_ago: "2h",
                post_text: "\"AI is moving faster than most industries can adapt. Startups that embrace foundation models early will have a huge competitive edge.\"\n" +
                    "In the last year alone, we’ve seen a shift from experimental prototypes to production-ready systems in healthcare, education, finance, and even creative industries. What used to take years of R&D is now being accelerated by foundation models that provide a flexible base for fine-tuning and deployment.\n" +
                    "For startups, this creates an incredible window of opportunity. Those who understand how to leverage these models—not just at the application layer, but also by building robust data pipelines, ethical safeguards, and scalable infrastructure—will be positioned to outpace larger incumbents who are slower to adapt.\n" +
                    "But with this speed comes challenges: compute costs, model drift, regulatory hurdles, and the talent gap are all very real obstacles. The startups that succeed won’t be the ones that simply plug in an API, but the ones that strategically align their business model with AI’s trajectory.\n" +
                    "Excited (and admittedly a little humbled) to watch how quickly this ecosystem is evolving. 🚀",
                comment_text: "I completely agree Jane!. Early adoption is key, and I’m especially curious how smaller startups will navigate the balance between experimentation and sustainability, given how steep compute costs can get. My guess is we’ll start to see more creative partnerships and resource-sharing models emerge as a way to level the playing field",
                post_url: "https://www.linkedin.com/in/elansmyla/"
            },
            {
                profile_url: "images/defaultProfile.png",
                author_name: "Alex Johnson",
                headline: "Founder @ SeedTech",
                time_ago: "6h",
                post_text: "We just closed our pre-seed round to build AI tools for early-stage founders. Excited to share more soon!\n\nThis milestone is just the beginning. Our mission is to give founders the leverage they need in those critical early months—whether that’s smarter market validation, faster pitch prep, or streamlined product feedback loops.\n\nThe fundraising process taught us a lot about where the gaps really are for new teams, and I couldn’t be more grateful for the investors, mentors, and peers who believed in the vision at such an early stage.\n\nHuge thanks to everyone who’s been part of this journey so far. Now, time to get back to building. 🚀",
                comment_text: "Congratulations! 🚀 Building in this space takes real courage. Excited to see how you shape tools that empower founders from day one—I’ll definitely be following your journey.",
                post_url: "https://www.linkedin.com/in/elansmyla/"
            }
        ];
    } else if (runId === "demo2") {
        // Keywords: Climate
        data = [
            {
                profile_url: "images/defaultProfile.png",
                author_name: "John Smith",
                headline: "Climate Policy Analyst",
                time_ago: "1d",
                post_text: "New research shows Midwest corn yields are already being impacted by rising temperatures. Adaptation strategies need to scale fast.\n\nThe data highlights that heat stress during key growth stages is leading to measurable declines in productivity, even with advances in seed technology. What’s concerning is that these impacts are not projections for 20–30 years down the road—they’re happening now, and farmers are already feeling the pressure.\n\nAdaptation needs to happen on multiple levels: from expanding crop insurance coverage, to funding research on resilient seed varieties, to investing in water infrastructure and soil health practices that reduce vulnerability. But policy adoption and implementation remain far behind the pace of climate impacts.\n\nIf we want to maintain agricultural stability in the Midwest, and by extension the global food system, governments, private sector stakeholders, and research institutions must act in coordination—not years from now, but immediately.",
                comment_text: "Important insights, John. It’s one thing to read about projections in a report, but hearing that farmers are already seeing these impacts makes the issue feel far more urgent. Policy needs to keep pace with what growers are actually experiencing in their fields today. Bridging that gap between research and on-the-ground realities will be critical if we want to give farming communities the support they need to adapt quickly.",
                post_url: "https://www.linkedin.com/in/elansmyla/"
            },
            {
                profile_url: "images/defaultProfile.png",
                author_name: "Emily Chen",
                headline: "Sustainability Lead @ AgriTech",
                time_ago: "22h",
                post_text: "Proud to launch our new soil moisture analytics platform to help farms conserve water during drought periods.\n\nThis platform combines IoT-enabled sensors with AI-driven forecasting to give farmers real-time insights into soil conditions. The goal is simple: use water more efficiently, protect yields, and build resilience in the face of increasingly frequent drought cycles.\n\nWater scarcity is no longer a distant challenge. It’s a present reality for countless agricultural communities. By equipping farmers with tools to measure, predict, and respond, we can help extend resources and reduce risk. We’ve been piloting with several mid-size farms across California and the Midwest, and the early results are promising—up to 20% reductions in water use without hurting crop performance.\n\nThis launch is a step forward, but the work continues. We’re excited to keep improving the tech, learning from farmers, and building partnerships that scale these solutions globally.",
                comment_text: "Amazing work, Emily 👏. Tools like this aren’t just ‘nice to have’ anymore—they’re quickly becoming essential for the future of agriculture. With droughts becoming more frequent and unpredictable, the ability to conserve water while maintaining yields could make or break entire farming operations. Really excited to see how your platform scales and the kind of impact it will have across regions that are already struggling with water scarcity.",
                post_url: "https://www.linkedin.com/in/elansmyla/"
            }
        ];
    } else if (runId === "demo3") {
        // Keywords: FinTech, Crypto
        data = [
            {
                profile_url: "images/defaultProfile.png",
                author_name: "Maria Lopez",
                headline: "FinTech Analyst",
                time_ago: "3d",
                post_text: "Cross-border payments are still too expensive. Stablecoins are starting to change that in emerging markets.\n\nFor years, people sending money home have faced high fees, long settlement times, and limited access to traditional banking systems. In some regions, remittance costs can still exceed 7–10% of the transaction amount — an enormous burden for families who rely on that income. Stablecoins are showing early signs of solving this problem by enabling near-instant transfers with far lower costs and fewer intermediaries.\n\nIn places where mobile adoption is high but financial infrastructure is limited, stablecoin rails are creating a new pathway for financial inclusion. Local merchants are beginning to accept payments directly, and cross-border transfers are no longer requiring users to navigate layers of correspondent banking. Of course, regulatory clarity is still missing in many regions, and consumer protections need to evolve alongside adoption. But the potential here is real, and the momentum is accelerating faster than most expected.",
                comment_text: "100%. The remittance use case is already proving itself, especially in regions where traditional banking infrastructure is weak or too costly to access. Stablecoins provide a bridge for millions of families who can’t afford to lose 10% of their paycheck to fees just to send money home. The technology is here, what’s missing is regulatory clarity and consumer trust. If policymakers can create frameworks that support innovation while ensuring safety, stablecoins could fundamentally reshape how global payments are done.",
                post_url: "https://www.linkedin.com/in/elansmyla/"
            },
            {
                profile_url: "images/defaultProfile.png",
                author_name: "David Kim",
                headline: "Blockchain Engineer",
                time_ago: "2d",
                post_text: "Just published a deep dive on scaling Layer 2 rollups for mainstream FinTech adoption.\n\nLayer 2 solutions have come a long way in the past two years, but the gap between technical progress and real-world adoption is still wide. In my article, I walk through the latest research on data availability sampling, fraud/validity proofs, and the economics of sequencer models — and why these design choices matter for mainstream financial platforms. It’s not just about throughput or lowering fees; it’s about building infrastructure that institutions can trust while maintaining the core principles of decentralization.\n\nFinTech companies won’t move significant transaction volume on-chain until scalability, user experience, and regulatory compliance align. Rollups are currently the most promising approach to get us there, but the implementation details will determine whether they can handle real-world demand. The piece also includes some practical considerations for engineers building on top of these networks today, from gas cost modeling to user onboarding flows.\n\nWould love feedback from others working in this space — the next 12–18 months will be critical in determining whether rollups cross from experimental to truly mainstream.",
                comment_text: "Great write-up, David! The technical deep dive really highlights how much nuance there is in scaling solutions beyond just ‘faster and cheaper.’ Practical scalability, the kind that FinTech platforms and their users can actually rely on, is what will ultimately bring real adoption on-chain. Excited to see more builders focus on the details you outlined, like sequencer economics and onboarding experience, because that’s where the difference between a proof-of-concept and a system ready for millions of users will be decided.",
                post_url: "https://www.linkedin.com/in/elansmyla/"
            }
        ];
    } else {
        // Otherwise load from Supabase
        const result = await supabase
            .from('comments')
            .select('airtable_record_id, post_url, post_text, comment_text, author_name, profile_url, headline, posted_date, time_ago')
            .eq('run_id', runId)
            .order('created_at', { ascending: true });

        data = result.data || [];
        error = result.error;
    }

    if (error) {
        detailComments.innerHTML = `<div class="text-red-500">Failed to load comments.</div>`;
        console.error(error);
        return;
    }

    if (!data.length) {
        detailComments.innerHTML = `<div class="text-gray-500">No comments found for this run.</div>`;
        return;
    }

    // Render cards
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
    window.location.href = 'index.html'; // redirect to login/home page after logout
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
    // First try restoring session
    const { data: { session } } = await supabase.auth.getSession();

    if (session?.user) {
        populateUserInfo(session.user);
        await loadRuns();
    }

    // Listen for auth state changes (covers Google OAuth redirects too)
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
            populateUserInfo(session.user);
            await loadRuns();
        } else {
            // only redirect if we’re sure the user has no session after auth check
            window.location.href = 'history.html';
        }
    });

    keywordInput.addEventListener('input', applyFilters);
    dateSelect.addEventListener('change', applyFilters);

    const params = new URLSearchParams(window.location.search);
    const runId = params.get('run');
    if (runId) showDetail(runId);
});
