// === Social Icons ===
const socials = [
    { icon: 'github', href: 'https://github.com/esmyla', label: 'GitHub' },
    { icon: 'linkedin', href: 'https://www.linkedin.com/in/elansmyla', label: 'LinkedIn' },
    { icon: 'mail', href: 'mailto:elansmyla@gmail.com', label: 'Email' },
    { icon: 'globe', href: 'https://yourdomain.com', label: 'Website' },
];

const renderIcons = (containerId) => {
    const container = document.getElementById(containerId);
    socials.forEach(({ icon, href, label }) => {
        const a = document.createElement('a');
        a.href = href;
        a.ariaLabel = label;
        a.target = "_blank";
        a.rel = "noreferrer";
        a.className = "p-2 rounded-xl hover:bg-white/5 transition";
        a.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5"></i>`;
        container.appendChild(a);
    });
};

renderIcons("social-icons");
renderIcons("footer-socials");
lucide.createIcons();

// === Projects Grid ===
const projects = [
    {
        title: "Project One",
        blurb: "Full‑stack web app with realtime features and clean UI.",
        tags: ["React", "Tailwind", "Supabase"],
        href: "#"
    },
    {
        title: "Project Two",
        blurb: "AI‑assisted workflow builder with agent orchestration.",
        tags: ["Next.js", "AI", "Edge"],
        href: "#"
    },
    {
        title: "Project Three",
        blurb: "Interactive data viz with smooth animations.",
        tags: ["TypeScript", "D3", "UX"],
        href: "#"
    },
    {
        title: "Project Four",
        blurb: "E‑commerce landing with A/B tested components.",
        tags: ["Vite", "Analytics", "Stripe"],
        href: "#"
    }
];

const projectGrid = document.getElementById("project-grid");

projects.forEach(({ title, blurb, tags, href }) => {
    const card = document.createElement("a");
    card.href = href;
    card.className =
        "block p-5 border border-white/10 bg-white/[.03] rounded-3xl hover:border-cyan-400/30 transition";

    card.innerHTML = `
    <div class="flex justify-between items-start gap-4">
      <h3 class="text-lg md:text-xl font-semibold text-white">${title}</h3>
      <i data-lucide="arrow-up-right" class="w-5 h-5 text-slate-400 group-hover:text-cyan-300"></i>
    </div>
    <p class="mt-2 text-sm text-slate-300">${blurb}</p>
    <div class="mt-3 flex flex-wrap gap-2">
      ${tags.map(
        (tag) =>
            `<span class="text-[11px] px-2.5 py-1 bg-white/5 border border-white/10 text-slate-300 rounded-full">${tag}</span>`
    ).join("")}
    </div>
  `;

    projectGrid.appendChild(card);
});
lucide.createIcons();

// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();
