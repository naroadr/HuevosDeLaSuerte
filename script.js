const tiposHuevos = ['roto', 'comun', 'pcomun', 'raro', 'epico', 'legendario'];

tiposHuevos.forEach(tipo => {
    const count = localStorage.getItem(`cnt-${tipo}`) || 0;
    const el = document.getElementById(`cnt-${tipo}`);
    if (el) el.textContent = count;
});

document.addEventListener("DOMContentLoaded", () => {
    // 1. Modo claro / oscuro
    const themeToggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const currentTheme = localStorage.getItem("theme") || "dark";

    if (currentTheme === "light") {
        document.documentElement.setAttribute("data-theme", "light");
        if (themeIcon) themeIcon.src = "imagenes/sol.png";
    } else {
        document.documentElement.removeAttribute("data-theme");
        if (themeIcon) themeIcon.src = "imagenes/luna.png";
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            let theme = document.documentElement.getAttribute("data-theme");
            if (theme === "light") {
                document.documentElement.removeAttribute("data-theme");
                localStorage.setItem("theme", "dark");
                if (themeIcon) themeIcon.src = "imagenes/luna.png";
            } else {
                document.documentElement.setAttribute("data-theme", "light");
                localStorage.setItem("theme", "light");
                if (themeIcon) themeIcon.src = "imagenes/sol.png";
            }
        });
    }

    // 2. Fondo animado de huevos 
    const bgContainer = document.getElementById("bg-eggs");
    const eggImages = [
        'imagenes/huevo-roto.png',
        'imagenes/huevo-comun.png',
        'imagenes/huevo-poco-comun.png',
        'imagenes/huevo-raro.png',
        'imagenes/huevodragonu.png',
        'imagenes/huevo-legendario.png'
    ];
    
    function createFloatingEgg() {
        if (!bgContainer) return;
        const img = document.createElement("img");
        img.src = eggImages[Math.floor(Math.random() * eggImages.length)];
        img.classList.add("bg-floating-egg");
        
        const size = Math.floor(Math.random() * 30) + 30;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.left = `${Math.random() * 100}vw`;
        
        const duration = Math.random() * 6 + 6;
        img.style.animationDuration = `${duration}s`;
        
        bgContainer.appendChild(img);
        setTimeout(() => img.remove(), duration * 1000);
    }
    setInterval(createFloatingEgg, 800);

    // 3. Botones manuales para sumar huevos (+1)
    const addButtons = document.querySelectorAll(".add-egg-btn");
    addButtons.forEach(button => {
        button.addEventListener("click", () => {
            const eggType = button.getAttribute("data-egg");
            const storageKey = `cnt-${eggType}`;
            
            let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
            currentCount++;
            localStorage.setItem(storageKey, currentCount);

            const counterElement = document.getElementById(`cnt-${eggType}`);
            if (counterElement) {
                counterElement.textContent = currentCount;
            }
        });
    });

    // 4. Modal de funcionamiento / guía
    const openGuideBtn = document.getElementById("open-guide-btn");
    const closeGuideBtn = document.getElementById("close-guide-btn");
    const guideModal = document.getElementById("guide-modal");

    if (openGuideBtn && guideModal) {
        openGuideBtn.addEventListener("click", () => {
            guideModal.style.display = "flex";
        });
    }

    if (closeGuideBtn && guideModal) {
        closeGuideBtn.addEventListener("click", () => {
            guideModal.style.display = "none";
        });
    }

    window.addEventListener("click", (event) => {
        if (event.target === guideModal) {
            guideModal.style.display = "none";
        }
    });

    // Inicializar conexión WebSocket
    connectStreamerBot();
});

// Función de conexión al WebSocket de Streamer.bot
function connectStreamerBot() {
    const ws = new WebSocket('ws://localhost:8080/');

    ws.onopen = () => {
        const subscribeMessage = {
            "request": "Subscribe",
            "events": {
                "Twitch": [
                    "RewardRedemption",
                    "ChatMessage"
                ]
            }
        };
        ws.send(JSON.stringify(subscribeMessage));
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            let textoAAnalizar = "";

            if (message.data) {
                if (message.data.reward && message.data.reward.title) {
                    textoAAnalizar = message.data.reward.title.toLowerCase();
                } else if (message.data.message && message.data.message.message) {
                    textoAAnalizar = message.data.message.message.toLowerCase();
                }
            }
            
            if (!textoAAnalizar) {
                textoAAnalizar = JSON.stringify(message).toLowerCase();
            }

            let eggType = null;
            if (textoAAnalizar.includes("roto")) eggType = "roto";
            else if (textoAAnalizar.includes("poco comun") || textoAAnalizar.includes("poco común") || textoAAnalizar.includes("pcomun")) eggType = "pcomun";
            else if (textoAAnalizar.includes("comun") || textoAAnalizar.includes("común")) eggType = "comun";
            else if (textoAAnalizar.includes("raro")) eggType = "raro";
            else if (textoAAnalizar.includes("epico") || textoAAnalizar.includes("épico")) eggType = "epico";
            else if (textoAAnalizar.includes("legendario")) eggType = "legendario";

            if (eggType) {
                const storageKey = `cnt-${eggType}`;
                let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
                currentCount++;
                localStorage.setItem(storageKey, currentCount);

                const counterElement = document.getElementById(`cnt-${eggType}`);
                if (counterElement) {
                    counterElement.textContent = currentCount;
                }
            }
        } catch (e) {
            console.error("Error al procesar el mensaje:", e);
        }
    };

    ws.onclose = () => {
        setTimeout(connectStreamerBot, 5000);
    };

    ws.onerror = (error) => { 
        console.error("Error en WebSocket:", error); 
    };
}