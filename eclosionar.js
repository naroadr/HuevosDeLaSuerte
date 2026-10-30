document.addEventListener("DOMContentLoaded", () => {
    // 1. modo claro / oscuro
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
        'imagenes/huevodragonu.png',
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

    // 3. Eclosion de huevo
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
                    
                    hatchBtn.disabled = false;
                    if (eggSelect) eggSelect.disabled = false;
                }, 300);

            }, 3500);
        });
    }
});