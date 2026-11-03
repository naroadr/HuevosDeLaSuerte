const CLIENT_ID = 'TU_CLIENT_ID_DE_TWITCH';
const tiposHuevos = ['roto', 'comun', 'pcomun', 'raro', 'epico', 'legendario'];

document.addEventListener("DOMContentLoaded", () => {
    // 1. Tema claro / oscuro
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

    // 2. Menú de usuario
    const usernameContainer = document.getElementById("top-username-container");
    const userDropdown = document.getElementById("user-dropdown");

    if (usernameContainer && userDropdown) {
        usernameContainer.addEventListener("click", (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle("show");
        });
        window.addEventListener("click", () => {
            userDropdown.classList.remove("show");
        });
    }

    // 3. Fondo Flotante Animado
    const bgContainer = document.getElementById("bg-eggs");
    const eggImages = [
        'imagenes/huevodragonu.png'
    ];
    
    function createFloatingEgg() {
        if (!bgContainer) return;
        const img = document.createElement("img");
        img.src = eggImages[Math.floor(Math.random() * eggImages.length)];
        img.classList.add("bg-floating-egg");
        
        const size = Math.floor(Math.random() * 30) + 30;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        img.style.left = `${Math.random() * 95}vw`;
        
        const duration = Math.random() * 6 + 6;
        img.style.animationDuration = `${duration}s`;
        
        bgContainer.appendChild(img);
        setTimeout(() => img.remove(), duration * 1000);
    }
    setInterval(createFloatingEgg, 800);

    // 4. Lógica de Eclosión Aleatoria
    const hatchBtn = document.getElementById("hatch-btn");
    const eggDisplay = document.getElementById("egg-display");
    const resultDiv = document.getElementById("hatch-result");

    const rewardsMap = {
        roto: ["💩", "🪨", "🦴", "💨"],
        comun: ["🌟", "🍪", "🪙", "💧"],
        pcomun: ["🔮", "⚡", "🎁", "🍀"],
        raro: ["💎", "🔥", "🚀", "🛡️"],
        epico: [            
            { name: "2.500 Dragonus", img: "imagenes/huevodragonu.png" },
        ],
        legendario: [
            { name: "Cofre de Streamloots", img: "imagenes/huevodragonu.png" },
            { name: "10.000 Dragonus", img: "imagenes/huevodragonu.png" },
            { name: "VIP 1 Semana", img: "imagenes/huevodragonu.png" }
        ]
    };

    if (hatchBtn) {
        hatchBtn.addEventListener("click", () => {
            const currentUser = localStorage.getItem("current_twitch_user") || "default";

            let availableEggs = tiposHuevos.filter(tipo => {
                const storageKey = currentUser !== "default" ? `cnt-${currentUser}-${tipo}` : `cnt-${tipo}`;
                let count = parseInt(localStorage.getItem(storageKey)) || 0;
                return count > 0;
            });

            if (availableEggs.length === 0) {
                resultDiv.textContent = "¡No te quedan huevos de ningún tipo para eclosionar!";
                resultDiv.style.color = "#ef4444";
                return;
            }

            const selectedEgg = availableEggs[Math.floor(Math.random() * availableEggs.length)];
            
            const storageKey = currentUser !== "default" ? `cnt-${currentUser}-${selectedEgg}` : `cnt-${selectedEgg}`;
            let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;

            currentCount--;
            localStorage.setItem(storageKey, currentCount);

            hatchBtn.disabled = true;

            resultDiv.textContent = `¡Eclosionando un Huevo ${selectedEgg.toUpperCase()}...!`;
            resultDiv.style.color = "var(--count-color)";
            
            // Ponemos el huevo inicial en tamaño perfecto y activamos la sacudida
            eggDisplay.innerHTML = "🥚";
            eggDisplay.className = "egg-visual shaking";
            
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

                    hatchBtn.disabled = false;
                }, 300);

            }, 3500);
        });
    }

    checkTwitchLoginEclosion();
});

function checkTwitchLoginEclosion() {
    const savedUser = localStorage.getItem("current_twitch_user");
    const displayUsername = document.getElementById("display-username");
    const authBtn = document.getElementById("auth-action-btn");

    if (savedUser && savedUser !== "default") {
        if (displayUsername) displayUsername.textContent = savedUser;
        if (authBtn) {
            authBtn.textContent = "🚪 Cerrar sesión";
            authBtn.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('twitch_token');
                localStorage.removeItem('current_twitch_user');
                window.location.reload();
            };
        }
    } else {
        if (displayUsername) displayUsername.textContent = "Invitado";
        if (authBtn) {
            authBtn.textContent = "Iniciar sesión con Twitch";
            authBtn.href = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(window.location.origin + window.location.pathname)}&response_type=token&scope=user:read:email`;
        }
    }
}