// === Social Icons ===
const socials = [
    { icon: 'github', href: 'https://github.com/esmyla', label: 'GitHub' },
    { icon: 'linkedin', href: 'https://www.linkedin.com/in/elansmyla', label: 'LinkedIn' },
    { icon: 'mail', href: 'mailto:elansmyla@gmail.com', label: 'Email' },
    { icon: 'globe', href: 'https://elan-smyla-web-projects.vercel.app/', label: 'Website' },
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
        name: "HiveAI",
        path: "CalHacks/index.html",
        description: "Hackathon project @ CalHacks. LLM-powered autonomous agent creation, including synchronous multi-agent communication to solve complex tasks.",
        image: "CalHacks/images/screenshot.png"
    },
    {
        name: "MathGen",
        path: "HelloWorld/index.html",
        description: "Hackathon project @ HelloWorld 2024. Math equation to video solution learning tool ~ 4th place overall. ",
        image: "HelloWorld/images/screenshot.png"
    },
    {
        name: "SmithAI",
        path: "BoilerMake/index.html",
        description: "Hackathon project at Boilermake XII ~ 1st place Caterpillar: Best Cloud Implementation ~\n" +
            "    1st Place MLH: Best Use of Gen AI ~       \n" +
            "    1st Place Purdue Innovates: Most Likely to Become a Business",
        image: "BoilerMake/images/screenshot.png"
    },
    {
        name: "LinkedInCommenter",
        path: "EvolveIQ/index.html",
        description: "Summer internship @ EvolveIQ. Agentic AI-powered application for autonomous corporate LinkedIn engagement. ",
        image: "EvolveIQ/images/screenshot.png"
    }
];

const projectGrid = document.getElementById("project-grid");

projects.forEach((p, i) => {
    const card = document.createElement("div");

    card.className = `
    relative
    w-full
    h-[350px]
    rounded-2xl
    overflow-hidden
    border border-white/10
    shadow-lg
    flex flex-col justify-end
    group
  `.trim();

    card.innerHTML = `
    <!-- Background image -->
    <div class="absolute inset-0 bg-cover bg-center" style="background-image: url('${p.image}');"></div>

    <!-- Gradient overlay for readability -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60 z-[1]"></div>

    <!-- Bottom overlay content -->
<div class="relative z-[2] px-3 py-3 bg-black/40 backdrop-blur-md">
      <h3 class="text-xl font-semibold text-white">${p.name}</h3>
      <p class="text-sm text-slate-300 mt-2">${p.description}</p>
      <a
        href="${p.path}"
        target="_blank"
        class="inline-block mt-3 px-4 py-2 text-sm text-cyan-200 border border-cyan-500/50 rounded-2xl hover:bg-cyan-500/10"
      >
        View Project
      </a>
    </div>
  `;

    projectGrid.appendChild(card);
});


// Set current year in footer
document.getElementById("year").textContent = new Date().getFullYear();
