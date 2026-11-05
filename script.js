const CLIENT_ID = 'h987nd0jv7sd956zhnockko3mjmgaa';
const REDIRECT_URI = window.location.origin + window.location.pathname;
const tiposHuevos = ['roto', 'comun', 'pcomun', 'raro', 'epico', 'legendario'];

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

    // 3. Menú desplegable de usuario (Esquina superior izquierda)
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

    // 4. Botones manuales para añadir huevos (+1) vinculados al usuario logueado
    const addButtons = document.querySelectorAll(".add-egg-btn");
    addButtons.forEach(button => {
        button.addEventListener("click", () => {
            const eggType = button.getAttribute("data-egg");
            const currentUser = localStorage.getItem("current_twitch_user") || "default";
            const storageKey = currentUser !== "default" ? `cnt-${currentUser}-${eggType}` : `cnt-${eggType}`;
            
            let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
            currentCount++;
            localStorage.setItem(storageKey, currentCount);

            const counterElement = document.getElementById(`cnt-${eggType}`);
            if (counterElement) {
                counterElement.textContent = currentCount;
            }
        });
    });

    // 5. Modal de guía de funcionamiento
    const openGuideBtn = document.getElementById("open-guide-btn");
    const closeGuideBtn = document.getElementById("close-guide-btn");
    const guideModal = document.getElementById("guide-modal");

    if (openGuideBtn && guideModal) {
        openGuideBtn.addEventListener("click", () => { guideModal.style.display = "flex"; });
    }
    if (closeGuideBtn && guideModal) {
        closeGuideBtn.addEventListener("click", () => { guideModal.style.display = "none"; });
    }
    window.addEventListener("click", (event) => {
        if (event.target === guideModal) guideModal.style.display = "none";
    });

    // 6. Autenticación Twitch y conexión WebSocket
    checkTwitchLogin();
    connectStreamerBot();
    const openAchievementsBtn = document.getElementById("open-achievements-btn");
    const achievementsModal = document.getElementById("achievements-modal");
    const closeAchievementsBtn = document.getElementById("close-achievements-btn");

    if(openAchievementsBtn){

        openAchievementsBtn.addEventListener("click", () => {

            cargarLogros();
            achievementsModal.style.display = "flex";

        });

    }

    if(closeAchievementsBtn){

        closeAchievementsBtn.addEventListener("click", () => {

            achievementsModal.style.display = "none";

        });

    }
});

// Comprobar inicio de sesión con Twitch mediante Hash de URL o Token guardado
function checkTwitchLogin() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');

    if (accessToken) {
        localStorage.setItem('twitch_token', accessToken);
        window.location.hash = ''; 
        fetchTwitchUser(accessToken);
    } else {
        const savedToken = localStorage.getItem('twitch_token');
        if (savedToken) {
            fetchTwitchUser(savedToken);
        } else {
            configurarEstadoInvitado();
        }
    }
}

// Consultar datos del usuario autenticado en la API de Twitch
async function fetchTwitchUser(token) {
    try {
        const response = await fetch('https://api.twitch.tv/helix/users', {
            headers: {
                'Client-ID': CLIENT_ID,
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (data.data && data.data.length > 0) {
            const user = data.data[0];
            localStorage.setItem("current_twitch_user", user.login.toLowerCase());
            
            const displayUsername = document.getElementById("display-username");
            if (displayUsername) displayUsername.textContent = user.display_name;

            const titleEl = document.getElementById("user-title");
            if (titleEl) {
                titleEl.innerHTML = `Inventario de recompensas de <strong>${user.display_name}</strong>`;
            }
            
            const authBtn = document.getElementById("auth-action-btn");
            if (authBtn) {
                authBtn.textContent = "🚪 Cerrar sesión";
                authBtn.href = "#";
                authBtn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem('twitch_token');
                    localStorage.removeItem('current_twitch_user');
                    window.location.reload();
                };
            }

<<<<<<< HEAD
            cargarInventarioUsuario(user.login);
            cargarHistorial();
            cargarStats(user.login);
=======
            cargarInventarioUsuario(user.login.toLowerCase());
>>>>>>> 2976407db3ae5aa65dcfe36cdda6999a2ee7fd4e
        } else {
            throw new Error("Token no válido");
        }
    } catch (error) {
        console.error("Error al obtener el usuario de Twitch:", error);
        localStorage.removeItem('twitch_token');
        localStorage.removeItem('current_twitch_user');
        configurarEstadoInvitado();
    }
}

function configurarEstadoInvitado() {
    const displayUsername = document.getElementById("display-username");
    if (displayUsername) displayUsername.textContent = "Invitado";

    cargarInventarioUsuario("default");
    cargarHistorial();
    cargarStats("default");

    const authBtn = document.getElementById("auth-action-btn");
    if (authBtn) {
        authBtn.textContent = "🟣 Iniciar sesión con Twitch";
        authBtn.href = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=token&scope=user:read:email`;
        authBtn.onclick = null;
    }
}

function cargarInventarioUsuario(username) {
    tiposHuevos.forEach(tipo => {
        const storageKey = username !== "default" ? `cnt-${username}-${tipo}` : `cnt-${tipo}`;
        const count = localStorage.getItem(storageKey) || 0;
        const el = document.getElementById(`cnt-${tipo}`);
        if (el) el.textContent = count;
    });
}

// Conexión con Streamer.bot para registrar canjes en tiempo real y sincronizar datos
function connectStreamerBot() {
    const ws = new WebSocket('ws://localhost:8080/');

    ws.onopen = () => {
        const subscribeMessage = {
            "request": "Subscribe",
            "events": {
                "Twitch": ["RewardRedemption", "ChatMessage"]
            }
        };
        ws.send(JSON.stringify(subscribeMessage));

        // Si ya hay un usuario logueado, pedir su inventario a Streamer.bot
        const currentUser = localStorage.getItem("current_twitch_user");
        if (currentUser && currentUser !== "default") {
            const syncRequest = {
                "request": "GetInventory",
                "user": currentUser
            };
            ws.send(JSON.stringify(syncRequest));
        }
    };

    ws.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            
            // Si Streamer.bot responde con el inventario guardado del usuario
            if (message.response === "InventoryData" && message.user && message.eggs) {
                const targetUser = message.user.toLowerCase();
                const loggedUser = (localStorage.getItem("current_twitch_user") || "default").toLowerCase();
                
                Object.keys(message.eggs).forEach(tipo => {
                    const storageKey = `cnt-${targetUser}-${tipo}`;
                    localStorage.setItem(storageKey, message.eggs[tipo]);
                });

                if (targetUser === loggedUser) {
                    cargarInventarioUsuario(targetUser);
                }
                return;
            }

            // Lógica normal de canjes en directo
            let textoAAnalizar = "";
            let twitchUser = "";

            if (message.data) {
                if (message.data.user_name) twitchUser = message.data.user_name.toLowerCase();
                else if (message.data.userName) twitchUser = message.data.userName.toLowerCase();
                else if (message.data.message && message.data.message.user && message.data.message.user.username) {
                    twitchUser = message.data.message.user.username.toLowerCase();
                }

                if (message.data.reward && message.data.reward.title) {
                    textoAAnalizar = message.data.reward.title.toLowerCase();
                } else if (message.data.message && message.data.message.message) {
                    textoAAnalizar = message.data.message.message.toLowerCase();
                }
            }
            
            if (!textoAAnalizar) textoAAnalizar = JSON.stringify(message).toLowerCase();

            let eggType = null;
            if (textoAAnalizar.includes("roto")) eggType = "roto";
            else if (textoAAnalizar.includes("poco comun") || textoAAnalizar.includes("poco común") || textoAAnalizar.includes("pcomun")) eggType = "pcomun";
            else if (textoAAnalizar.includes("comun") || textoAAnalizar.includes("común")) eggType = "comun";
            else if (textoAAnalizar.includes("raro")) eggType = "raro";
            else if (textoAAnalizar.includes("epico") || textoAAnalizar.includes("épico")) eggType = "epico";
            else if (textoAAnalizar.includes("legendario")) eggType = "legendario";

            if (eggType) {
                const targetUser = twitchUser || localStorage.getItem("current_twitch_user") || "default";
                const storageKey = targetUser !== "default" ? `cnt-${targetUser}-${eggType}` : `cnt-${eggType}`;
                
                let currentCount = parseInt(localStorage.getItem(storageKey)) || 0;
                currentCount++;
                localStorage.setItem(storageKey, currentCount);

                const loggedUser = localStorage.getItem("current_twitch_user") || "default";
                if (targetUser === loggedUser.toLowerCase()) {
                    const counterElement = document.getElementById(`cnt-${eggType}`);
                    if (counterElement) counterElement.textContent = currentCount;
                }
            }
        } catch (e) {
            console.error("Error al procesar mensaje de Streamer.bot:", e);
        }
    };

    ws.onclose = () => { setTimeout(connectStreamerBot, 5000); };
    ws.onerror = (error) => { console.error("Error en WebSocket:", error); };
}
function cargarHistorial(){

    const lista = document.getElementById("hatch-history-list");

    if(!lista) return;

    const historial = JSON.parse(localStorage.getItem("hatchHistory")) || [];

    if(!historial.length){
        return;
    }

    lista.innerHTML = "";

    historial.forEach(item=>{

        const li = document.createElement("li");

        li.className = "history-item";

        li.innerHTML = `
            <span>${item.user} obtuvo ${item.reward} desde un huevo ${item.egg}</span>
        `;

        lista.appendChild(li);

    });

}

function cargarStats(user){

    const fragmentos = parseInt(localStorage.getItem(`fragments-${user}`)) || 0;

    const fragmentUI = document.getElementById("fragment-count");

    if(fragmentUI){
        fragmentUI.textContent = fragmentos;
    }

    const achievements = [];
 
    tiposHuevos.forEach(tipo=>{

        const cantidad = parseInt(localStorage.getItem(`cnt-${user}-${tipo}`)) || 0;

        if(cantidad > 0){
            achievements.push(`✅ ${tipo}`);
        }

    });

    const logros = document.getElementById("achievement-list");

    if(logros){
        logros.innerHTML = achievements.length ? achievements.join("<br>") : "Ninguno";
    }

    const discovered = achievements.length;

    const fill = document.getElementById("collection-fill");
    const text = document.getElementById("collection-text");

    const percent = (discovered / 6) * 100;

    if(fill){
        fill.style.width = percent + "%";
    }

    if(text){
        text.textContent = `${discovered} / 6 descubiertos`;
    }

    const rank = document.getElementById("user-rank");

    if(rank){

        const score =
        (parseInt(localStorage.getItem(`cnt-${user}-comun`)) || 0) * 1 +
        (parseInt(localStorage.getItem(`cnt-${user}-pcomun`)) || 0) * 3 +
        (parseInt(localStorage.getItem(`cnt-${user}-raro`)) || 0) * 10 +
        (parseInt(localStorage.getItem(`cnt-${user}-epico`)) || 0) * 25 +
        (parseInt(localStorage.getItem(`cnt-${user}-legendario`)) || 0) * 100;

        rank.innerHTML = `⭐ ${score} pts`;
    }

}
const achievementDefinitions = [
    {
        title: "🥚 Eclosionador Novato",
        current: () => parseInt(localStorage.getItem("hatched-total")) || 0,
        goal: 10
    },
    {
        title: "📦 Eclosionador Experto",
        current: () => parseInt(localStorage.getItem("hatched-total")) || 0,
        goal: 100
    },
    {
        title: "💀 Skill issue de manual",
        current: () => parseInt(localStorage.getItem("hatched-roto")) || 0,
        goal: 20
    },
    {
        title: "🔵 Cazador de Huevos raros",
        current: () => parseInt(localStorage.getItem("hatched-raro")) || 0,
        goal: 10
    },
    {
        title: "🟣 Bendecido por los huevos",
        current: () => parseInt(localStorage.getItem("hatched-epico")) || 0,
        goal: 5
    },
    {
        title: "👑 Elegido de RyuuzZ",
        current: () => parseInt(localStorage.getItem("hatched-legendario")) || 0,
        goal: 1
    },
    {
        title: "✨ Acumulador",
        current: () => {
            const user = localStorage.getItem("current_twitch_user") || "default";
            return parseInt(localStorage.getItem(`fragments-${user}`)) || 0;
        }        
    }
];

function cargarLogros(){

    const container = document.getElementById("achievements-container");

    if(!container) return;

    container.innerHTML = "";

    achievementDefinitions.forEach(logro => {

        const actual = logro.current();
        const porcentaje = Math.min((actual / logro.goal) * 100, 100);

        container.innerHTML += `
            <div class="achievement-card">
                <strong>${logro.title}</strong>
                <div class="progress-bar">
                    <div class="progress-fill" style="width:${porcentaje}%"></div>
                </div>
                <span>${actual} / ${logro.goal}</span>
            </div>
        `;
    });

}