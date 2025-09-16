/****************** SENSITIVE CODE REMOVED FOR SECURITY AND IP REASONS ******************/
/****************** SENSITIVE CODE REMOVED FOR SECURITY AND IP REASONS ******************/
/****************** SENSITIVE CODE REMOVED FOR SECURITY AND IP REASONS ******************/


// ────────────────────────────────
// Supabase Client Init
// ────────────────────────────────
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const SUPABASE_URL = "https://jdgljezoylnigbqymmel.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_KEY;
console.log(`API Key: ${SUPABASE_KEY}`);

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ────────────────────────────────
// UI Elements
// ────────────────────────────────
const authPage     = document.getElementById("authPage");
const appPage      = document.getElementById("appPage");

const loginForm    = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showLoginBtn = document.getElementById("showLogin");
const showRegisterBtn = document.getElementById("showRegister");
const logoutBtn    = document.getElementById("logoutBtn");
const googleBtn    = document.getElementById("googleLoginBtn");

const userInfoEl   = document.getElementById("userInfo");
const avatarEl     = document.getElementById("userAvatar");
const nameEl       = document.getElementById("userName");

const runForm      = document.getElementById("runForm");

// Modal helpers
function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}
function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

// ────────────────────────────────
// Page Switching
// ────────────────────────────────
function showApp(user) {
    authPage.classList.add("hidden");
    appPage.classList.remove("hidden");

    if (user) {
        const md = user.user_metadata || {};
        nameEl.textContent = md.display_name || user.email;
        avatarEl.src = md.avatar_url || "images/defaultProfile.png";
        userInfoEl.classList.remove("hidden");
    }
}

function showAuth() {
    authPage.classList.remove("hidden");
    appPage.classList.add("hidden");
    userInfoEl.classList.add("hidden");
}

// ────────────────────────────────
// Toggle Login/Register Tabs
// ────────────────────────────────
showLoginBtn.addEventListener("click", () => {
    registerForm.classList.add("hidden");
    loginForm.classList.remove("hidden");
    showLoginBtn.classList.add("border-b-2", "text-blue-700");
    showRegisterBtn.classList.remove("border-b-2", "text-blue-700");
    showRegisterBtn.classList.add("text-gray-500");
});

showRegisterBtn.addEventListener("click", () => {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    showRegisterBtn.classList.add("border-b-2", "text-blue-700");
    showLoginBtn.classList.remove("border-b-2", "text-blue-700");
    showLoginBtn.classList.add("text-gray-500");
});

// ────────────────────────────────
// TAG INPUT HANDLING
// ────────────────────────────────
function makeTagInput(containerId, inputId, hiddenId, buttonId) {
    const container = document.getElementById(containerId);
    const input     = document.getElementById(inputId);
    const hidden    = document.getElementById(hiddenId);
    const button    = document.getElementById(buttonId);
    const tags = [];

    function render() {
        container.querySelectorAll('.tag').forEach(t => t.remove());
        tags.forEach((t, i) => {
            const span = document.createElement('span');
            span.className = 'tag flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded';
            span.innerHTML = `${t}
        <button type="button" data-i="${i}" class="ml-1 text-blue-600">&times;</button>`;
            container.insertBefore(span, input);
        });
        hidden.value = tags.join('~');
    }

    input.addEventListener('keydown', e => {
        if (['Enter', ','].includes(e.key)) {
            e.preventDefault();
            const v = input.value.trim();
            if (v && !tags.includes(v)) tags.push(v);
            input.value = '';
            render();
        }
    });

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
            tags.splice(+e.target.dataset.i, 1);
            render();
        }
    });
}

makeTagInput('tagContainer',  'tagInput',  'keywordsInput',  'addKeywordBtn');
makeTagInput('tagContainer2', 'tagInput2', 'keywordsInput2', 'addKeywordBtn2');

// ────────────────────────────────
// TAB SWITCHING
// ────────────────────────────────
document.getElementById('manualTab').onclick = () => {
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

// ────────────────────────────────
// Auth Handlers
// ────────────────────────────────
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
        return alert("Login failed: " + error.message);
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) showApp(session.user);
});

registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email    = document.getElementById("newUsername").value.trim();
    const fullName = document.getElementById("fullName").value.trim();
    const password = document.getElementById("newPassword").value;
    const confirm  = document.getElementById("confirmPassword").value;

    if (password !== confirm) {
        return alert("Passwords do not match.");
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: fullName } },
    });

    if (error) {
        return alert("Signup failed: " + error.message);
    }
    alert("Account created! Please log in.");
    showLoginBtn.click();
});

logoutBtn.addEventListener("click", async () => {
    await supabase.auth.signOut();
    showAuth();
});

if (googleBtn) {
    googleBtn.addEventListener("click", async () => {
        await supabase.auth.signInWithOAuth({ provider: "google" });
    });
}

// ────────────────────────────────
// Run Form (Generate/Schedule)
// Always trigger API Key modal
// ────────────────────────────────
runForm.addEventListener("submit", (e) => {
    e.preventDefault();
    openModal("apiModal");
});

// ────────────────────────────────
// On Page Load: Restore Session
// ────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
        showApp(session.user);
    } else {
        showAuth();
    }
});

