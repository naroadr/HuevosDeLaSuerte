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
        'imagenes/huevo-epico.png',
        'imagenes/huevo-legendario.png'
    ];
    
    function createFloatingEgg() {
        if (!bgContainer) return;
        const img = document.createElement("img");
        img.src = eggImages[Math.floor(Math.random() * eggImages.length)];
        img.classList.add("bg-floating-egg");
        
        const size = Math.floor(Math.random() * 30) + 30; // 30px - 60px
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.left = `${Math.random() * 100}vw`;
        
        const duration = Math.random() * 6 + 6; // 6s - 12s
        img.style.animationDuration = `${duration}s`;
        
        bgContainer.appendChild(img);
        setTimeout(() => img.remove(), duration * 1000);
    }
    setInterval(createFloatingEgg, 800);

    // 3. Eclosión de huevo, Historial y Confeti
    const hatchBtn = document.getElementById("hatch-btn");
    const eggDisplay = document.getElementById("egg-display");
    const eggSelect = document.getElementById("egg-type-select");
    const resultDiv = document.getElementById("hatch-result");

    const rewardsMap = {
        roto: ["💩", "🪨", "🦴", "💨"],
        comun: ["🌟", "🍪", "🪙", "💧"],
        pcomun: ["🔮", "⚡", "🎁", "🍀"],
        raro: ["💎", "🔥", "🚀", "🛡️"],
        epico: ["👑", "🦄", "⭐", "💎"],
        legendario: ["🏆", "🐉", "💎", "👑"]
    };

    if (hatchBtn) {
        hatchBtn.addEventListener("click", () => {
            const selectedEgg = eggSelect ? eggSelect.value : "comun";
            
            const storageKey = `cnt-${selectedEgg}`;
            let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;

            if (currentCount <= 0) {
                resultDiv.textContent = "¡No te quedan huevos de este tipo para eclosionar!";
                resultDiv.style.color = "#ef4444";
                return;
            }

            currentCount--;
            localStorage.setItem(storageKey, currentCount);

            hatchBtn.disabled = true;
            if (eggSelect) eggSelect.disabled = true;

            resultDiv.textContent = "¿El huevo va a abrirse... ?";
            resultDiv.style.color = "var(--count-color)";
            eggDisplay.textContent = "🥚";

            eggDisplay.classList.add("shaking");
            
            setTimeout(() => {
                resultDiv.textContent = "¡El huevo está temblando!";
            }, 1500);

            setTimeout(() => {
                eggDisplay.classList.remove("shaking");
                eggDisplay.classList.add("hatching-pop");

                const possibleRewards = rewardsMap[selectedEgg] || rewardsMap["comun"];
                const finalPrize = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

                setTimeout(() => {
                    eggDisplay.textContent = finalPrize;
                    eggDisplay.classList.remove("hatching-pop");
                    resultDiv.innerHTML = `¡Felicidades! Has conseguido: <strong>${finalPrize}</strong>`;
                    resultDiv.style.color = "#16a34a";
                    
                    if (['epico', 'legendario'].includes(selectedEgg) && typeof confetti === 'function') {
                        confetti({
                            particleCount: 100,
                            spread: 80,
                            origin: { y: 0.6 },
                            colors: ['#a855f7', '#ca8a04', '#0284c7', '#22c55e']
                        });
                    }

                    const historyItem = {
                        egg: selectedEgg.toUpperCase(),
                        prize: finalPrize,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };

                    let history = JSON.parse(localStorage.getItem("egg-history")) || [];
                    history.unshift(historyItem); 
                    if (history.length > 5) history.pop(); 
                    localStorage.setItem("egg-history", JSON.stringify(history));

                    hatchBtn.disabled = false;
                    if (eggSelect) eggSelect.disabled = false;
                }, 300);

            }, 3500);
        });
    }
});
function connectStreamerBot() {
    const ws = new WebSocket('ws://localhost:8080/');

    ws.onopen = () => {
        console.log("Conectado correctamente a Streamer.bot por WebSocket 🚀");
    };

    ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        
        if (message.event && message.event.type === 'Twitch.RewardRedemption') {
            const rewardName = message.data.reward.title.toLowerCase();
            const username = message.data.user.name;

            let eggType = null;

            if (rewardName.includes("roto")) eggType = "roto";
            else if (rewardName.includes("comun")) eggType = "comun";
            else if (rewardName.includes("poco comun")) eggType = "pcomun";
            else if (rewardName.includes("raro")) eggType = "raro";
            else if (rewardName.includes("epico")) eggType = "epico";
            else if (rewardName.includes("legendario")) eggType = "legendario";

            if (eggType) {
                const storageKey = `cnt-${eggType}`;
                let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
                currentCount++;
                localStorage.setItem(storageKey, currentCount);

                const counterElement = document.getElementById(`cnt-${eggType}`);
                if (counterElement) {
                    counterElement.textContent = currentCount;
                }

                console.log(`¡${username} canjeó un huevo tipo ${eggType}! Total: ${currentCount}`);
            }
        }
    };

    ws.onclose = () => {
        console.log("Conexión perdida con Streamer.bot. Reintentando en 5 segundos...");
        setTimeout(connectStreamerBot, 5000);
    };

    ws.onerror = (error) => { console.error("Error en el WebSocket:", error); 

    }        
    };
document.addEventListener("DOMContentLoaded", () => {
    connectStreamerBot();
});