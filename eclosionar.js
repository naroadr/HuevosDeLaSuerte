document.addEventListener("DOMContentLoaded", () => {
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

    const hatchBtn = document.getElementById("hatch-btn");
    const eggDisplay = document.getElementById("egg-display");
    const resultDiv = document.getElementById("hatch-result");

    const tiposHuevos = ['roto', 'comun', 'pcomun', 'raro', 'epico', 'legendario'];

    const rewardsMap = {
        roto: ["💩", "🪨", "🦴", "💨"],
        comun: ["🌟", "🍪", "🪙", "💧"],
        pcomun: ["🔮", "⚡", "🎁", "🍀"],
        raro: ["💎", "🔥", "🚀", "🛡️"],
        epico: [            
            { name: "2.500 Dragonus", img: "imagenes/huevodragonu.png" },
        ],
        legendario: [
            { name: "Cofre de Streamloots", img: "imagenes/cofre.png" },
            { name: "10.000 Dragonus", img: "imagenes/huevodragonu.png" },
            { name: "VIP 1 Semana (Si ya eres VIP, se cambia por 2 cofres)", img: "imagenes/vip.png" }
        ]
    };

    if (hatchBtn) {
        hatchBtn.addEventListener("click", () => {
            let availableEggs = tiposHuevos.filter(tipo => {
                let count = parseInt(localStorage.getItem(`cnt-${tipo}`)) || 0;
                return count > 0;
            });

            if (availableEggs.length === 0) {
                resultDiv.textContent = "¡No te quedan huevos de ningún tipo para eclosionar!";
                resultDiv.style.color = "#ef4444";
                return;
            }

            const selectedEgg = availableEggs[Math.floor(Math.random() * availableEggs.length)];
            
            const storageKey = `cnt-${selectedEgg}`;
            let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;

            currentCount--;
            localStorage.setItem(storageKey, currentCount);

            hatchBtn.disabled = true;

            resultDiv.textContent = `¡Eclosionando un Huevo ${selectedEgg.toUpperCase()}... !`;
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
                    if (typeof finalPrize === 'object') {
                        eggDisplay.innerHTML = `<img src="${finalPrize.img}" alt="${finalPrize.name}" class="prize-img">`;
                        resultDiv.innerHTML = `¡Felicidades! Has conseguido:<br><strong>${finalPrize.name}</strong>`;
                    } else {
                        eggDisplay.textContent = finalPrize;
                        resultDiv.innerHTML = `¡Felicidades! Has conseguido: <strong>${finalPrize}</strong>`;
                    }

                    eggDisplay.classList.remove("hatching-pop");
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
                        prize: typeof finalPrize === 'object' ? finalPrize.name : finalPrize,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    };

                    let history = JSON.parse(localStorage.getItem("egg-history")) || [];
                    history.unshift(historyItem); 
                    if (history.length > 5) history.pop(); 
                    localStorage.setItem("egg-history", JSON.stringify(history));

                    hatchBtn.disabled = false;
                }, 300);

            }, 3500);
        });
    }
});