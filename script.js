"use strict";

/* ===== SETTINGS ===== */
var CONTACT_EMAIL = "manishdahal9864@gmail.com";
/*
    FORM SERVICE (optional).
    Leave ENDPOINT empty to open the visitor's email app when the form is sent.
    To receive messages without an email app, create a free form at formspree.io
    and put its URL here, for example "https://formspree.io/f/abcdwxyz".
*/
var FORM_ENDPOINT = "";

/* ===== HELPERS ===== */
function $(id) { return document.getElementById(id); }

function safeStorage(action, key, value) {
    try {
        if (action === "set") { localStorage.setItem(key, value); return null; }
        return localStorage.getItem(key);
    } catch (e) { return null; }
}

/* ===== THEME TOGGLE ===== */
(function () {
    var toggle = $("themeToggle");
    if (!toggle) { return; }
    var root = document.documentElement;

    function paint() {
        var dark = root.getAttribute("data-theme") === "dark";
        toggle.textContent = dark ? "☀️" : "🌙";
        toggle.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    paint();

    toggle.addEventListener("click", function () {
        var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
        root.setAttribute("data-theme", next);
        safeStorage("set", "theme", next);
        paint();
    });
})();

/* ===== MOBILE MENU ===== */
(function () {
    var button = $("menuToggle");
    var nav = $("site-nav");
    if (!button || !nav) { return; }

    function setOpen(open) {
        nav.classList.toggle("open", open);
        button.setAttribute("aria-expanded", String(open));
        button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }

    button.addEventListener("click", function () {
        setOpen(!nav.classList.contains("open"));
    });

    nav.addEventListener("click", function (e) {
        if (e.target.closest("a")) { setOpen(false); }
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && nav.classList.contains("open")) {
            setOpen(false);
            button.focus();
        }
    });

    document.addEventListener("click", function (e) {
        if (nav.classList.contains("open") && !nav.contains(e.target) && !button.contains(e.target)) {
            setOpen(false);
        }
    });

    window.addEventListener("resize", function () {
        if (window.innerWidth > 800) { setOpen(false); }
    });
})();

/* ===== COPYRIGHT YEAR ===== */
(function () {
    var year = $("year");
    if (year) { year.textContent = String(new Date().getFullYear()); }
})();

/* ===== COPY EMAIL ===== */
(function () {
    var button = $("copyEmail");
    var status = $("copyStatus");
    if (!button || !status) { return; }

    function show(text, ok) {
        status.hidden = false;
        status.className = "form-status " + (ok ? "success" : "error");
        status.textContent = text;
    }

    button.addEventListener("click", function () {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(CONTACT_EMAIL).then(
                function () { show("Email address copied.", true); },
                function () { show("The copy did not work. Select the address and copy it by hand.", false); }
            );
        } else {
            show("The copy did not work. Select the address and copy it by hand.", false);
        }
    });
})();

/* ===== CONTACT FORM ===== */
(function () {
    var form = $("contactForm");
    if (!form) { return; }

    var status = $("formStatus");
    var submit = $("cf-submit");
    var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function setError(input, message) {
        var field = input.closest(".field");
        var out = $(input.id + "-err");
        if (message) {
            field.classList.add("invalid");
            input.setAttribute("aria-invalid", "true");
            out.textContent = message;
            out.hidden = false;
        } else {
            field.classList.remove("invalid");
            input.removeAttribute("aria-invalid");
            out.textContent = "";
            out.hidden = true;
        }
        return !message;
    }

    function show(text, ok) {
        status.hidden = false;
        status.className = "form-status " + (ok ? "success" : "error");
        status.textContent = text;
    }

    function validate() {
        var name = $("cf-name");
        var email = $("cf-email");
        var message = $("cf-message");
        var results = [
            setError(name, name.value.trim() ? "" : "Enter your name."),
            setError(email, emailPattern.test(email.value.trim()) ? "" : "Enter a valid email address."),
            setError(message, message.value.trim().length >= 10 ? "" : "Write a message of at least 10 characters.")
        ];
        var firstBad = [name, email, message].filter(function (_, i) { return !results[i]; })[0];
        if (firstBad) { firstBad.focus(); }
        return !firstBad;
    }

    ["cf-name", "cf-email", "cf-message"].forEach(function (id) {
        $(id).addEventListener("input", function () {
            if ($(id).closest(".field").classList.contains("invalid")) { setError($(id), ""); }
        });
    });

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        status.hidden = true;

        if ($("cf-website").value) { return; } /* spam trap */
        if (!validate()) {
            show("The form has errors. Correct the marked fields and try again.", false);
            return;
        }

        var data = {
            name: $("cf-name").value.trim(),
            email: $("cf-email").value.trim(),
            message: $("cf-message").value.trim()
        };

        if (FORM_ENDPOINT) {
            submit.disabled = true;
            submit.textContent = "Sending...";
            fetch(FORM_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                body: JSON.stringify(data)
            }).then(function (response) {
                if (!response.ok) { throw new Error("Bad response"); }
                form.reset();
                show("Your message is sent. I will reply as soon as I can.", true);
            }).catch(function () {
                show("The message did not send. Try again, or send an email to " + CONTACT_EMAIL + ".", false);
            }).then(function () {
                submit.disabled = false;
                submit.textContent = "Send Message";
            });
        } else {
            var subject = "Message from " + data.name;
            var body = data.message + "\n\nFrom: " + data.name + " (" + data.email + ")";
            window.location.href = "mailto:" + CONTACT_EMAIL +
                "?subject=" + encodeURIComponent(subject) +
                "&body=" + encodeURIComponent(body);
            show("Your email app opens now. Press Send in your email app to finish. If it does not open, email " + CONTACT_EMAIL + ".", true);
        }
    });
})();

/* ===== CIRCUIT BACKGROUND ===== */
(function () {
    var canvas = $("circuit-bg");
    if (!canvas || !canvas.getContext) { return; }

    var ctx = canvas.getContext("2d");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var lines = [];
    var running = false;

    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }

    function build() {
        var count = window.innerWidth < 600 ? 30 : 70;
        lines = [];
        for (var i = 0; i < count; i++) {
            lines.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                dx: Math.random() > 0.5 ? 1 : -1,
                dy: Math.random() > 0.5 ? 1 : -1,
                length: 40 + Math.random() * 80
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#4da3ff";
        ctx.lineWidth = 1;

        lines.forEach(function (l) {
            ctx.beginPath();
            ctx.moveTo(l.x, l.y);
            ctx.lineTo(l.x + l.length * l.dx, l.y);
            ctx.lineTo(l.x + l.length * l.dx, l.y + l.length * l.dy);
            ctx.stroke();

            if (!reduced) {
                l.x += l.dx * 0.3;
                l.y += l.dy * 0.3;
                if (l.x < 0 || l.x > canvas.width) { l.dx *= -1; }
                if (l.y < 0 || l.y > canvas.height) { l.dy *= -1; }
            }
        });

        if (running && !reduced) { requestAnimationFrame(draw); }
    }

    function start() {
        if (running) { return; }
        running = true;
        draw();
    }

    resize();
    build();

    var resizeTimer;
    window.addEventListener("resize", function () {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function () {
            resize();
            build();
            if (reduced) { draw(); }
        }, 150);
    });

    /* Stop the animation when the tab is hidden. This saves battery. */
    document.addEventListener("visibilitychange", function () {
        if (document.hidden) { running = false; } else if (!reduced) { start(); }
    });

    if (reduced) { draw(); } else { start(); }
})();
