// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href'))
            .scrollIntoView({ behavior: 'smooth' });
    });
});
// ===== DARK MODE TOGGLE =====
const toggle = document.getElementById("themeToggle");
const body = document.body;

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    body.classList.add("dark");
    toggle.textContent = "☀️";
}

toggle.addEventListener("click", () => {
    body.classList.toggle("dark");
    const isDark = body.classList.contains("dark");
    toggle.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
});
// ===== CIRCUIT ANIMATION =====
const canvas = document.getElementById("circuit-bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.addEventListener("resize", resize);

const lines = [];
for (let i = 0; i < 80; i++) {
    lines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        dx: Math.random() > 0.5 ? 1 : -1,
        dy: Math.random() > 0.5 ? 1 : -1,
        length: 40 + Math.random() * 80
    });
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#4da3ff";
    ctx.lineWidth = 1;

    lines.forEach(l => {
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x + l.length * l.dx, l.y);
        ctx.lineTo(l.x + l.length * l.dx, l.y + l.length * l.dy);
        ctx.stroke();

        l.x += l.dx * 0.3;
        l.y += l.dy * 0.3;

        if (l.x < 0 || l.x > canvas.width) l.dx *= -1;
        if (l.y < 0 || l.y > canvas.height) l.dy *= -1;
    });

    requestAnimationFrame(draw);
}
draw();
