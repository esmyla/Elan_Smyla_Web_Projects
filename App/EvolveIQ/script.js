

//supabase client import
import { supabase } from './supabaseClient.js';

let index = 0;
let total = 0;
let updateCarousel = () => {}; // placeholder for scope safety

// centralized webhook selection function
const webhookMap = {
    'jfarrall@icloud.com': 'https://n8n.srv870287.hstgr.cloud/webhook/40a66876-b9ef-4089-bc24-66cbc4140d51',
    'jn@andurilpartners.ai': 'https://n8n.srv870287.hstgr.cloud/webhook/b690a72a-325a-4c24-93ca-fd12bb3787e3',
    's@bventuresgroup.com': 'https://n8n.srv870287.hstgr.cloud/webhook/e9986f21-9a4a-4039-9735-16ffa05ddc73',
    'npezolano@newmarkrisk.com': 'https://n8n.srv870287.hstgr.cloud/webhook/2e849011-e371-4b72-91e9-be38ea627b24',
    'juanfe@evolve-iq.com':'https://n8n.srv870287.hstgr.cloud/webhook/44dd3dfa-656a-4b96-a97a-b9920798ea8f',
    'chavesjuanfe@gmail.com':'https://n8n.srv870287.hstgr.cloud/webhook/44dd3dfa-656a-4b96-a97a-b9920798ea8f',
    'michael.mayhew@integrityresearchllc.com':'https://n8n.srv870287.hstgr.cloud/webhook/157c2019-d242-4333-939e-26ec74628411'
};

function selectWebhookForUser(userEmail) {
    WEBHOOK_URL = webhookMap[userEmail] || 'https://n8n.srv870287.hstgr.cloud/webhook/63ae05bf-9b85-466e-8b84-9e9ccbd07480';
    console.log('[Resolved Webhook URL]', WEBHOOK_URL);
}

// tracks post id's of already rendered posts to avoid duplicates
let renderedRecordIds = new Set();

// Takes one full comment row from Supabase and injects it into the carousel
function appendCommentToCarousel(c) {
    const wrapper = document.getElementById('carouselInner');
    // build a dummy record in the shape renderTable expects:
    const record = {
        id: c.airtable_record_id,
        fields: {
            'Post URL':         c.post_url,
            'Post':             c.post_text,
            'LinkedIn Comment': c.comment_text,
            'Author Name':      c.author_name,
            'Profile_URL':      c.profile_url,
            'Headline':         c.headline,
            'Posted Date':      c.posted_date,
            'Time_Ago':         c.time_ago
        }
    };

    let p_url = c.Profile_URL || 'images/defaultProfile.png';

    // create the card DOM exactly like in renderTable
    const card = document.createElement('div');
    card.className = 'carousel-card w-full max-w-[640px] flex-shrink-0 px-2';
    card.innerHTML = `
    <div class="p-4 border rounded-lg shadow bg-white space-y-4">
      <div class="flex items-center space-x-3 mb-2">
        <img src="p_url"
             class="w-12 h-12 rounded-full object-cover border border-gray-300"
             alt="Profile Picture" />
        <div>
          <div class="font-semibold text-gray-800 text-sm leading-snug">
            ${record.fields['Author Name']}
          </div>
          <div class="text-gray-500 text-xs leading-snug">
            ${record.fields['Headline']}
          </div>
          <div class="text-gray-400 text-xs mt-0.5">
            ${record.fields['Time_Ago']}
          </div>
        </div>
      </div>
      <div class="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">
        ${record.fields['Post']}
      </div>
      <div class="bg-gray-100 p-3 rounded relative">
        <div class="flex justify-between items-start">
          <div class="text-sm text-gray-600 font-semibold mb-1">Suggested Comment</div>
          <div class="flex gap-2 absolute top-2 right-2">
            <div class="relative group">
              <button class="copy-btn">📋</button>
              <div class="tooltip-text">Copy</div>
            </div>
            <div class="relative group">
              <button class="edit-btn">✏️</button>
              <div class="tooltip-text">Edit</div>
            </div>
          </div>
        </div>
        <div class="text-sm text-gray-800 whitespace-pre-wrap comment-text">
          ${record.fields['LinkedIn Comment']}
        </div>
      </div>
      <div class="flex justify-between items-center mt-4">
        <button class="carousel-prev text-sm text-blue-600 font-semibold px-2 py-1 hover:underline">
          &larr; Previous
        </button>
        <div class="flex gap-3">
          <button class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 go-to-post-btn"
                  data-id="${record.id}"
                  data-url="${record.fields['Post URL']}">
            Go to Post
          </button>
          <span class="text-sm text-gray-500">Was this useful?</span>
          <button class="feedback-btn" data-id="${record.id}" data-type="Likes" title="Like">👍</button>
          <button class="feedback-btn" data-id="${record.id}" data-type="Dislikes" title="Dislike">👎</button>
        </div>
        <div id="carouselIndicatorBottom"
             class="text-xs font-medium text-gray-600 bg-white/80 px-3 py-1 rounded shadow hidden">
             1 / 1
        </div>
        <button class="carousel-next text-sm text-blue-600 font-semibold px-2 py-1 hover:underline">
          Next &rarr;
        </button>
      </div>
    </div>
  `;
    wrapper.appendChild(card);

    // update total & indicator, scroll into view
    total += 1;
    updateCarousel();
}

function resetCarousel() {
    const wrapper = document.getElementById('carouselInner');
    wrapper.innerHTML = '';
    wrapper.style.transform = 'translateX(0%)';
    renderedRecordIds.clear();
    index = 0;
    total = 0;

    const indicator1 = document.getElementById('carouselIndicator');
    if (indicator1) {
        indicator1.textContent = '';
        indicator1.classList.add('hidden');
    }

    document.querySelectorAll('.carousel-indicator-bottom').forEach((el, i) => {
        if (i === index) {
            el.textContent = `${index + 1} / ${total}`;
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });


    document.getElementById('results')?.classList.add('hidden');
}

// for now, just log the new recordId
function handleNewCommentId(recordId) {
    console.log('New comment ID:', recordId);
}

function showAuth() {
    authPage.classList.remove('hidden');
    appPage.classList.add('hidden');
}


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

let statusPollInterval = null;
let WEBHOOK_URL = ''; // declare at top level, outside event listener

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
        showAuth();
        return;
    }

    showApp();
    populateUserInfo(session.user);

    const userEmail = session.user.email;
    selectWebhookForUser(userEmail);

    console.log('[Resolved Webhook URL]', WEBHOOK_URL);

    const userId = session.user.id;
    const displayedRunIds = new Set();

    // If a run is 'pending' and 'live', show loading animation
    const { data: pendingLiveRuns, error: pendingErr } = await supabase
        .from('runs')
        .select('id')
        .eq('user_id', userId)
        .eq('form_mode', 'live')
        .eq('status', 'pending');

    if (pendingLiveRuns?.length) {
        loadingStage.classList.remove('hidden');
    }

    // ⏱ Every 3s, check for finished runs and append them, including errored runs
    setInterval(async () => {
        const { data: finishedRuns, error: finishedErr } = await supabase
            .from('runs')
            .select('id')
            .eq('user_id', userId)
            .or('status.eq.finished,displayed_error.is.false');
        // console.log("errored run added to finished")
        ;
        // console.log(finishedRuns);
        // console.log(finishedRuns.length);
        if (finishedErr || !finishedRuns?.length) {
            console.log(finishedErr);
            return;
        }

        console.log(finishedRuns);
        for (const run of finishedRuns) {
            if (!displayedRunIds.has(run.id)) {
                displayedRunIds.add(run.id);
                await displayAndMark(run.id); // renders & marks displayed
                console.log("displayAndMark called on " + run.id);
            }
        }
    }, 3000);
});

// fetch comments, render, then mark run 'displayed'
async function displayAndMark(runId) {
    const { data: run, error: runErr } = await supabase
        .from('runs')
        .select('status, keywords, displayed_error')
        .eq('id', runId)
        .single();

    if (runErr) {
        console.error('Error fetching run status:', runErr);
        return;
    }

    const failureStatuses = [
        'Apify Actor Failure',
        'Word Count Failure',
        'Content Type Failure',
        'Company Content Failure',
        'Classification Filter Failure',
        'Format Failure'
    ];

    // First-time error handling
    if (failureStatuses.includes(run.status) && run.displayed_error === false) {
        console.log("error detected");
        loadingStage.classList.add('hidden');

        console.log(run.keywords)
        console.log(run.keywords?.join(', '))
        let alertMessage = "Run for keyword(s) \"" + (run.keywords?.join(', ') || " unknown") + "\" was unsuccessful.\n\n" +
            "Retry with a higher post limit, broader timeframe, or different keyword.\n\n" +
            "If you have other runs going on, they will finish soon. Otherwise, you're free to continue using the LinkedIn Commenter."
        alert(
            alertMessage,
        );

        await supabase
            .from('runs')
            .update({
                displayed_error: true,
            })
            .eq('id', runId);

        return;
    }

    // Already failed and alert shown — skip
    if (failureStatuses.includes(run.status) && run.displayed_error === true) {
        return;
    }

    // Proceed normally for finished & successful runs
    loadingStage.classList.add('hidden');

    const { data: comments, error: cmErr } = await supabase
        .from('comments')
        .select('*')
        .eq('run_id', runId)
        .order('created_at', { ascending: true });

    if (cmErr) {
        console.error('Error loading comments:', cmErr);
        return;
    }
    if (!comments.length) return;

    renderTable(
        comments.map(c => ({
            id: c.airtable_record_id,
            fields: {
                'Post URL':         c.post_url,
                'Post':             c.post_text,
                'LinkedIn Comment': c.comment_text,
                'Author Name':      c.author_name,
                'Profile_URL':      c.profile_url,
                'Headline':         c.headline,
                'Posted Date':      c.posted_date,
                'Time_Ago':         c.time_ago,
            }
        })),
        { append: true }
    );

    const { error: dispErr } = await supabase
        .from('runs')
        .update({ status: 'displayed' })
        .eq('id', runId);

    if (dispErr) console.error('Could not mark run displayed:', dispErr);
}

// Navbar toggle
const menuToggle = document.getElementById('mobile-menu-toggle');
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        if (menu) menu.classList.toggle('hidden');
    });
}

// Typewriter sequences
const typewriterEl = document.getElementById('typewriter-text');
const examples = [
    "Harness AI to craft personalized comments on LinkedIn posts.",
    "Input your keywords, set post limits and time ranges.",
    "Generate relevant and personal comments in seconds with one click.",
    "Schedule comments for whenever you need them to stay ahead.",
    "Get notified by email when your comments are ready.",
    "Save hundreds of dollars and hours with our agent."
];

let seq = 0;
function cycleTypewriter() {
    if (!typewriterEl) return;
    typewriterEl.classList.remove('opacity-0');
    const tw = new Typewriter(typewriterEl, { loop: false, delay: 35 });
    tw.typeString(examples[seq])
        .pauseFor(3500)
        .callFunction(() => {
            typewriterEl.classList.add('opacity-0');
            setTimeout(() => {
                seq = (seq + 1) % examples.length;
                typewriterEl.innerHTML = '';
                cycleTypewriter();
            }, 1500);
        })
        .start();
}

cycleTypewriter();

// loading stage typewriter
let loadingTw = null;

function startLoadingTypewriter() {
    const loadingTypewriterEl = document.getElementById('loading-typewriter');
    if (!loadingTypewriterEl) {
        return;
    }

    if (loadingTw && loadingTw.stop) {
        loadingTw.stop();
    }

    loadingTypewriterEl.innerHTML = '';

    loadingTw = new Typewriter(loadingTypewriterEl, {
        loop: false,
        delay: 35,
        cursor: '|'
    });

    loadingTw
        .pauseFor(500)
        .typeString("Generating comments... ")
        .pauseFor(300)
        .typeString("This will take 1–5 minutes based on your request.<br/><br/>")
        .pauseFor(800)
        .typeString("If you submitted a scheduled request, ")
        .pauseFor(800)
        .typeString("feel free to leave the page or<br/>continue generating comments.<br/><br/>")
        .pauseFor(1000)
        .typeString("Your scheduled request will show up here when it's ready.")
        .start();
}

// Shader canvas initialization
const vertexSrc = `
attribute vec2 position;
void main() {
  gl_Position = vec4(position, 1.0, 1.0);
}`;
const fragmentSrc = `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
const int BUBBLE_COUNT = 5;
void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 c[BUBBLE_COUNT];
  c[0] = vec2(0.3, 0.3);
  c[1] = vec2(0.7, 0.4);
  c[2] = vec2(0.5, 0.8);
  c[3] = vec2(0.2, 0.6);
  c[4] = vec2(0.8, 0.2);
  float sum = 0.0;
  for (int i = 0; i < BUBBLE_COUNT; i++) {
    float d = length(uv - c[i]);
    sum += sin(15.0 * d - u_time * 0.2) / float(BUBBLE_COUNT);
  }
  float t = 0.4 + 0.6 * sum;
  vec3 base = vec3(0.6, 0.6, 0.6);
  vec3 wave = vec3(0.0, 0.2667, 0.4078);
  vec3 color = mix(base, wave, t);
  gl_FragColor = vec4(color, 0.5);
}`;

function initShader() {
    const canvas = document.getElementById('shader-bg');
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
    if (!gl) return;
    const dpr = window.devicePixelRatio || 1;
    function resize() {
        canvas.width = innerWidth * dpr;
        canvas.height = innerHeight * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener('resize', resize);
    const vs = createShader(gl, gl.VERTEX_SHADER, vertexSrc);
    const fs = createShader(gl, gl.FRAGMENT_SHADER, fragmentSrc);
    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),
        gl.STATIC_DRAW
    );
    const posLoc = gl.getAttribLocation(prog, 'position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    const uTimeLoc = gl.getUniformLocation(prog, 'u_time');
    const uResLoc  = gl.getUniformLocation(prog, 'u_resolution');
    function render(time) {
        gl.uniform1f(uTimeLoc, time * 0.001);
        gl.uniform2f(uResLoc, canvas.width, canvas.height);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}

function createShader(gl, type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
}
window.addEventListener('load', initShader);

// ——————————————————————
// TAG INPUT & FORM HANDLING
// ——————————————————————
function makeTagInput(containerId, inputId, hiddenId, buttonId) {
    const container = document.getElementById(containerId);
    const input     = document.getElementById(inputId);
    const hidden    = document.getElementById(hiddenId);
    const button    = document.getElementById(buttonId);
    const tags = [];

    function render() {
        container.querySelectorAll('.tag').forEach(t => t.remove());
        tags.forEach((t,i) => {
            const span = document.createElement('span');
            span.className = 'tag flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded';
            span.innerHTML = `${t}
        <button type="button" data-i="${i}" class="ml-1 text-blue-600">&times;</button>`;
            container.insertBefore(span, input);
        });
        hidden.value = tags.join('~');
    }

    // still allow Enter or comma
    input.addEventListener('keydown', e => {
        if (['Enter',','].includes(e.key)) {
            e.preventDefault();
            const v = input.value.trim();
            if (v && !tags.includes(v)) tags.push(v);
            input.value = '';
            render();
        }
    });

    // new: button click to add
    if (button) {
        button.addEventListener('click', () => {
            const v = input.value.trim();
            if (v && !tags.includes(v)) tags.push(v);
            input.value = '';
            render();
        });
    }

    container.addEventListener('click', e => {
        if (e.target.matches('button[data-i]')) {
            tags.splice(+e.target.dataset.i,1);
            render();
        }
    });
}

// now pass the new button IDs, too
makeTagInput('tagContainer',  'tagInput',  'keywordsInput',  'addKeywordBtn');
makeTagInput('tagContainer2', 'tagInput2', 'keywordsInput2', 'addKeywordBtn2');

// Tab switching
document.getElementById('manualTab').onclick   = () => {
    document.getElementById('manualSection').classList.remove('hidden');
    document.getElementById('scheduledSection').classList.add('hidden');
    document.getElementById('manualTab').classList.replace('text-gray-500','border-blue-600','text-black');
    document.getElementById('scheduledTab').classList.replace('border-blue-600','text-gray-500');
};
document.getElementById('scheduledTab').onclick = () => {
    document.getElementById('scheduledSection').classList.remove('hidden');
    document.getElementById('manualSection').classList.add('hidden');
    document.getElementById('scheduledTab').classList.replace('text-gray-500','border-blue-600','text-black');
    document.getElementById('manualTab').classList.replace('border-blue-600','text-gray-500');
};

const runForm        = document.getElementById('runForm');
const loadingStage   = document.getElementById('loadingStage');
const resultsSection = document.getElementById('results');

runForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset the carousel at the top
    resetCarousel();
    console.log('Reset Carousel at top of runForm');
    startLoadingTypewriter();
    loadingStage.classList.remove('hidden');

    loadingStage.scrollIntoView({ behavior: 'smooth' });

    // Gather form data
    const isManual = !document.getElementById('manualSection').classList.contains('hidden');
    const rawKeys = isManual
        ? document.getElementById('keywordsInput').value
        : document.getElementById('keywordsInput2').value;
    const keys = rawKeys.split('~').filter(Boolean).map(k => k.trim());
    const limit = parseInt(
        isManual
            ? document.getElementById('postLimit').value || '50'
            : document.getElementById('postLimit2').value || '50',
        10
    );
    const dateFilterMap = { '24h': 'past-24h', '7d': 'past-week', '30d': 'past-month' };
    const rawTime = isManual
        ? document.querySelector('input[name="timeRange"]:checked').value
        : document.querySelector('input[name="timeRangeScheduled"]:checked').value;
    const date_filter = dateFilterMap[rawTime] || '';
    const notify = isManual
        ? document.getElementById('notifyManual').checked
        : document.getElementById('notifyScheduled').checked;

    let scheduledAtFormatted;
    if (!isManual) {
        const raw = document.querySelector('input[name="scheduledAt"]').value;
        scheduledAtFormatted = raw ? raw.replace('T', ' ') + ':00' : null;
    }

    const now = new Date().toISOString();
    const payload = keys.map(kw => ({
        Keyword: kw,
        'Limit (max. 50)': limit,
        date_filter,
        submittedAt: now,
        formMode: isManual ? 'live' : 'scheduled',
        scheduledAt: scheduledAtFormatted,
        notify
    }));

    // Get session and user info FIRST
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session.user.id;
    const userEmail = session.user.email;

    // Now safe to query user profile
    const userName = session?.user?.user_metadata?.display_name || 'User';
    console.log('[Session]', session);
    console.log('Username1:', userName);


    // Insert new run
    const { data: run, error: runError } = await supabase
        .from('runs')
        .insert([{
            user_id: userId,
            keywords: keys,
            limit,
            date_filter,
            form_mode: isManual ? 'live' : 'scheduled',
            scheduled_at: scheduledAtFormatted,
            notify,
            status: 'pending',
            webhook_payload: payload
        }])
        .select()
        .single();

    if (runError) {
        console.error('Error inserting run:', runError);
        loadingStage.classList.add('hidden');
        return;
    }

    const runId = run.id;

    try {
        // Fire the webhook
        const payloadWithRun = payload.map(item => ({
            ...item,
            runId,
            userId,
            userEmail,
            userName
        }));

        const res = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payloadWithRun),
        });

        let records = await res.json();
        if (!Array.isArray(records)) records = [records];

        // Supabase inserts handled by n8n, not here. Update run status
        const { error: updateError } = await supabase
            .from('runs')
            .update({ status: 'finished' })
            .eq('id', runId);

        if (updateError) {
            console.error('Error updating run status:', updateError);
        }

        await displayAndMark(runId);

    } catch (err) {
        // console.error('Webhook error:', err);
        console.log('json not received due to failed run.')
        await displayAndMark(runId);
        console.log('marked.')
    } finally {
        loadingStage.classList.add('hidden');
    }
});


const STORAGE_KEY = 'comment-feedback';

function loadFeedbackState() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
}

function saveFeedbackState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// renders the carousel based on a run received and append state true/false
function renderTable(records, { append = false } = {}) {
    console.log('[renderTable]', append ? 'Appending' : 'Replacing', records.length, 'records');
    const wrapper = document.getElementById('carouselInner');
    const results = document.getElementById('results');

    if (!append) {
        wrapper.innerHTML = '';
        index = 0;
        total = 0;
        resetCarousel(); // Clear set on reset
        console.log('cleared within renderTable first if statement');
    }

    const startingIndex = total;
    let appendedCount = 0;

    records.forEach((item, i) => {
        const recordId = item.id;
        if (renderedRecordIds.has(recordId)) {
            console.log('[renderTable] Skipping duplicate record:', recordId);
            return; // Skip early
        }
        renderedRecordIds.add(recordId); // Track it

        const fields = item.fields || item;
        const postText = fields['Post'] || '';
        const author = fields['Author Name'] || 'Unknown Author';
        const postDate = fields['Posted Date'] || '';
        const relativeTime = fields['Time_Ago'] || '';
        const comment = fields['LinkedIn Comment'] || '';
        const postUrl = fields['Post URL'] || '#';
        const headline = fields['Headline'] || '';

        let profileImgT = '';
        if ((fields['Profile_URL'] !== '\t') && (fields['Profile_URL'] !== ' ')){
            profileImgT = fields['Profile_URL'];
        } else {
            profileImgT = 'images/defaultProfile.png'
        }
        const profileImg = profileImgT;


        const profileHTML = `
      <div class="flex items-center space-x-3 mb-2">
        <img src="${profileImg}"
             class="w-12 h-12 rounded-full object-cover border border-gray-300"
             alt="Profile Picture" />
        <div>
          <div class="font-semibold text-gray-800 text-sm leading-snug">${author}</div>
          <div class="text-gray-500 text-xs leading-snug">${headline}</div>
          <div class="text-gray-400 text-xs mt-0.5">${relativeTime}</div>
        </div>
      </div>
    `;

        const card = document.createElement('div');
        card.className = 'carousel-card w-full max-w-[640px] flex-shrink-0 px-2';
        card.innerHTML = `
      <div class="p-4 border rounded-lg shadow bg-white space-y-4">
        ${profileHTML}
        <div class="whitespace-pre-wrap text-gray-800 text-sm leading-relaxed">${postText}</div>
        <div class="bg-gray-100 p-3 rounded relative">
          <div class="flex justify-between items-start">
            <div class="text-sm text-gray-600 font-semibold mb-1">Suggested Comment</div>
            <div class="flex gap-2 absolute top-2 right-2">
              <div class="relative group">
                <button class="copy-btn">📋</button>
                <div class="tooltip-text">Copy</div>
              </div>
              <div class="relative group">
                <button class="edit-btn">✏️</button>
                <div class="tooltip-text">Edit</div>
              </div>
            </div>
          </div>
          <div class="text-sm text-gray-800 whitespace-pre-wrap comment-text">${comment}</div>
        </div>
        <div class="flex justify-between items-center mt-4">
          <button class="carousel-prev text-sm text-blue-600 font-semibold px-2 py-1 hover:underline">&larr; Previous</button>
          <div class="flex gap-3">
            <button class="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 go-to-post-btn" data-id="${item.id}" data-url="${postUrl}">Go to Post</button>
            <span class="text-sm text-gray-500">Was this useful?</span>
            <button class="feedback-btn" data-id="${item.id}" data-type="Likes" title="Like">👍</button>
            <button class="feedback-btn" data-id="${item.id}" data-type="Dislikes" title="Dislike">👎</button>
          </div>
          <div class="carousel-indicator-bottom text-xs font-medium text-gray-600 bg-white/80 px-3 py-1 rounded shadow">
               1 / 1
          </div>
          <button class="carousel-next text-sm text-blue-600 font-semibold px-2 py-1 hover:underline">Next &rarr;</button>
        </div>
      </div>
    `;
        wrapper.appendChild(card);
        appendedCount++;
    });

    total += appendedCount;

    // Preserve this so it works across appends too
    updateCarousel = function () {
        const inner = document.getElementById('carouselInner');
        inner.style.transform = `translateX(-${index * 100}%)`;

        const indicator1 = document.getElementById('carouselIndicator');
        if (indicator1) {
            indicator1.textContent = `${index + 1} / ${total}`;
            indicator1.classList.remove('hidden');
        }

        document.querySelectorAll('.carousel-indicator-bottom').forEach((el, i) => {
            if (i === index) {
                el.textContent = `${index + 1} / ${total}`;
                el.classList.remove('hidden');
            } else {
                el.classList.add('hidden');
            }
        });


        const activeCard = inner.querySelectorAll('.carousel-card')[index];
        if (activeCard) {
            const rect = activeCard.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2 + window.scrollY;
        }

        document.getElementById('carouselWrapper')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    document.querySelectorAll('.carousel-prev').forEach(btn => {
        btn.onclick = () => {
            index = (index - 1 + total) % total;
            updateCarousel();
        };
    });
    document.querySelectorAll('.carousel-next').forEach(btn => {
        btn.onclick = () => {
            index = (index + 1) % total;
            updateCarousel();
        };
    });

    let feedbackState = loadFeedbackState();
    const toast = document.getElementById('toast');

    document.querySelectorAll('.feedback-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const type = btn.dataset.type;
            const opposite = type === 'Likes' ? 'Dislikes' : 'Likes';

            const sameBtn = document.querySelector(`.feedback-btn[data-id="${id}"][data-type="${type}"]`);
            const oppositeBtn = document.querySelector(`.feedback-btn[data-id="${id}"][data-type="${opposite}"]`);

            const prev = feedbackState[id];

            if (prev === type) {
                feedbackState[id] = null;
                saveFeedbackState(feedbackState);
                sameBtn.innerHTML = type === 'Likes' ? '👍' : '👎';
                sameBtn.classList.remove('selected-like', 'selected-dislike', 'animate-scale');
                showToast('Feedback undone');
                const success = await sendFeedback(id, null, null);
                if (!success) {
                    feedbackState[id] = type;
                    saveFeedbackState(feedbackState);
                    sameBtn.innerHTML = type === 'Likes' ? '✅' : '❌';
                    sameBtn.classList.add(type === 'Likes' ? 'selected-like' : 'selected-dislike', 'animate-scale');
                    showToast('Could not save feedback. Try again.');
                }
            } else {
                feedbackState[id] = type;
                saveFeedbackState(feedbackState);
                sameBtn.innerHTML = type === 'Likes' ? '✅' : '❌';
                sameBtn.classList.add(type === 'Likes' ? 'selected-like' : 'selected-dislike', 'animate-scale');
                oppositeBtn.innerHTML = opposite === 'Likes' ? '👍' : '👎';
                oppositeBtn.classList.remove('selected-like', 'selected-dislike', 'animate-scale');
                showToast('Feedback submitted');
                const success = await sendFeedback(id, type, opposite);
                if (!success) {
                    feedbackState[id] = null;
                    saveFeedbackState(feedbackState);
                    sameBtn.innerHTML = type === 'Likes' ? '👍' : '👎';
                    sameBtn.classList.remove('selected-like', 'selected-dislike', 'animate-scale');
                    showToast('Could not save feedback. Try again.');
                }
            }
        });
    });

    const goToPostClickedSet = new Set();
    document.querySelectorAll('.go-to-post-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const id = btn.dataset.id;
            const url = btn.dataset.url;
            window.open(url, '_blank');
            if (!goToPostClickedSet.has(id)) {
                goToPostClickedSet.add(id);
                await sendFeedback(id, 'Go_To_Post', null, true);
            }
        });
    });

    if (!append) index = 0;

    updateCarousel();
    results.classList.remove('hidden');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove('opacity-0');
    toast.classList.add('opacity-100');
    setTimeout(() => {
        toast.classList.remove('opacity-100');
        toast.classList.add('opacity-0');
    }, 2000);
}

document.addEventListener('click', e => {
    if (e.target.closest('.copy-btn')) {
        const commentBox = e.target.closest('.bg-gray-100')?.querySelector('.comment-text');
        if (commentBox) {
            navigator.clipboard.writeText(commentBox.textContent.trim()).then(() => {
                const tooltip = e.target.parentElement.querySelector('.tooltip-text');
                if (tooltip) {
                    tooltip.textContent = 'Copied!';
                    setTimeout(() => {
                        tooltip.textContent = 'Copy';
                    }, 1500);
                }
            });
        }
    }

    if (e.target.closest('.edit-btn')) {
        const commentBox = e.target.closest('.bg-gray-100')?.querySelector('.comment-text');
        if (commentBox && !commentBox.hasAttribute('contenteditable')) {
            commentBox.setAttribute('contenteditable', 'true');
            commentBox.focus();
        }
    }
});

function discardCard(btn) {
    const card = btn.closest('.carousel-card');
    if (!card) return;

    card.innerHTML = `
        <div class="py-40 min-h-[300px] p-8 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg text-center space-y-4">
          <div class="text-xl text-gray-600">🗑 Post Discarded</div>
          <div class="flex justify-between items-center mt-4">
            <button class="text-sm text-blue-600 font-semibold px-2 py-1 hover:underline discard-prev">&larr; Previous</button>
            <button class="text-sm text-blue-600 font-semibold px-2 py-1 hover:underline discard-next">Next &rarr;</button>
          </div>
        </div>
    `;

    setTimeout(() => {
        card.querySelector('.discard-prev')?.addEventListener('click', () => {
            index = (index - 1 + total) % total;
            updateCarousel();
        });
        card.querySelector('.discard-next')?.addEventListener('click', () => {
            index = (index + 1) % total;
            updateCarousel();
        });

    }, 0);
    updateCarousel();
}

// Airtable config
const AIRTABLE_BASE_ID = 'appToFyGTl7nM1ugk';
const AIRTABLE_TABLE_NAME = 'LinkedIn Analysis'; // <-- UPDATE this if it's different
const AIRTABLE_TOKEN = 'Bearer patKTF9J9f1Ztl2o8.7bf74deec426a391952db98d9a9c7496562dfedcae0dac51d669c8681d98ab76';

async function sendFeedback(recordId, fieldToSet, fieldToClear, isGoToPost = false) {
    const airtableUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${recordId}`;
    const bodyFields = {};

    if (isGoToPost) {
        bodyFields['Go_To_Post'] = 1;
    } else if (fieldToSet) {
        bodyFields[fieldToSet] = 1;
        if (fieldToClear) bodyFields[fieldToClear] = null;
    } else {
        bodyFields['Likes'] = null;
        bodyFields['Dislikes'] = null;
    }

    let airtableSuccess = true;
    let supabaseSuccess = true;

    // // Update Airtable removed because of different credentials for each user + better supabase logging
    // try {
    //     const res = await fetch(airtableUrl, {
    //         method: 'PATCH',
    //         headers: {
    //             'Authorization': AIRTABLE_TOKEN,
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ fields: bodyFields }),
    //     });
    //     airtableSuccess = res.ok;
    // } catch (err) {
    //     airtableSuccess = false;
    // }

    // Update Supabase
    try {
        const updates = {};
        if (isGoToPost) {
            updates.go_to_post = 1;
        } else if (fieldToSet) {
            updates[fieldToSet.toLowerCase()] = 1;
            if (fieldToClear) updates[fieldToClear.toLowerCase()] = null;
        } else {
            updates.likes = null;
            updates.dislikes = null;
        }

        const { error } = await supabase
            .from('comments')
            .update(updates)
            .eq('airtable_record_id', recordId);

        if (error) supabaseSuccess = false;
    } catch (err) {
        supabaseSuccess = false;
    }

    // return airtableSuccess && supabaseSuccess;
    return supabaseSuccess;
}

// ——————————————————————
// AUTH HANDLERS
// ——————————————————————
const showLoginBtn    = document.getElementById('showLogin');
const showRegisterBtn = document.getElementById('showRegister');
const loginForm       = document.getElementById('loginForm');
const registerForm    = document.getElementById('registerForm');
const authPage        = document.getElementById('authPage');
const appPage         = document.getElementById('appPage');

showLoginBtn.addEventListener('click', () => {
    registerForm.classList.add('hidden');
    loginForm.classList.remove('hidden');
    showLoginBtn.classList.replace('text-gray-500','text-blue-700');
    showLoginBtn.classList.add('border-b-2');
    showRegisterBtn.classList.replace('text-blue-700','text-gray-500');
    showRegisterBtn.classList.remove('border-b-2');
});

showRegisterBtn.addEventListener('click', () => {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    showRegisterBtn.classList.replace('text-gray-500','text-blue-700');
    showRegisterBtn.classList.add('border-b-2');
    showLoginBtn.classList.replace('text-blue-700','text-gray-500');
    showLoginBtn.classList.remove('border-b-2');
});

registerForm.addEventListener('submit', async e => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value.trim();
    const email    = document.getElementById('newUsername').value.trim();
    const password = document.getElementById('newPassword').value;
    const confirm  = document.getElementById('confirmPassword').value;

    if (password !== confirm) {
        return alert('Passwords do not match.');
    }

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { display_name: fullName }
        }
    });

    if (error) {
        alert('Signup failed: ' + error.message);
    } else {
        alert('Account created! Please log in.');
        showLoginBtn.click();
    }
});

loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const email    = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert('Login Failed: ' + error.message);
    } else {
        showApp();
        const {data: {session}} = await supabase.auth.getSession();
        if (session?.user) {
            populateUserInfo(session.user);
            // Re-select webhook for the newly logged-in user
            selectWebhookForUser(session.user.email);
        }
    }
});

document.getElementById('logoutBtn').addEventListener('click', async () => {
    await supabase.auth.signOut();
    appPage.classList.add('hidden');
    authPage.classList.remove('hidden');
    const userInfoEl = document.getElementById('userInfo');
    if (userInfoEl) userInfoEl.classList.add('hidden');
});

function showApp() {
    authPage.classList.add('hidden');
    appPage.classList.remove('hidden');

    const userInfoEl = document.getElementById('userInfo');
    if (userInfoEl) {
        userInfoEl.classList.remove('hidden');
    }
}

function timeAgo(postedDateStr) {
    const posted = new Date(postedDateStr);
    const now = new Date();
    const diffMs = now - posted;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 24) return `${diffHrs}h`;
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    return `${Math.floor(diffDays / 30)}m`;
}

const googleBtn = document.getElementById('googleLoginBtn');

if (googleBtn) {
    googleBtn.addEventListener('click', async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
        });
    });
}