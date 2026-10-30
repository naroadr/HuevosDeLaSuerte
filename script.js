const wsUri = "ws://127.0.0.1:8080/";
let websocket;

function initWebSocket() {
    console.log("Conectando a Streamer.bot WebSocket...");
    websocket = new WebSocket(wsUri);

    websocket.onopen = function(evt) {
        console.log("¡Conectado exitosamente al WebSocket!");
    };

    websocket.onclose = function(evt) {
        console.log("Desconectado del WebSocket. Reintentando en 5 segundos...");
        setTimeout(initWebSocket, 5000);
    };

    websocket.onmessage = function(evt) {
        try {
            const data = JSON.parse(evt.data);
            
            if (data.event && data.event.type === "Custom") {
                if (data.data.action === "updateInventory") {
                    actualizarInventario(data.data);
                }
            }
        } catch (error) {
            console.error("Error al procesar el mensaje del WebSocket:", error);
        }
    };

    websocket.onerror = function(evt) {
        console.error("Error en WebSocket:", evt);
    };
}

// ACTUALIZAR LOS CONTADORES EN EL HTML
function actualizarInventario(datos) {
    if (datos.usuario) {
        document.getElementById("user-title").innerText = `Inventario de @${datos.usuario}`;
    }

    if (datos.roto !== undefined) document.getElementById("cnt-roto").innerText = datos.roto;
    if (datos.comun !== undefined) document.getElementById("cnt-comun").innerText = datos.comun;
    if (datos.pcomun !== undefined) document.getElementById("cnt-pcomun").innerText = datos.pcomun;
    if (datos.raro !== undefined) document.getElementById("cnt-raro").innerText = datos.raro;
    if (datos.epico !== undefined) document.getElementById("cnt-epico").innerText = datos.epico;
    if (datos.legendario !== undefined) document.getElementById("cnt-legendario").innerText = datos.legendario;
}
// VENTANA DE FUNCIONAMIENTO DE HUEVOS
const modal = document.getElementById("guide-modal");
const openBtn = document.getElementById("open-guide-btn");
const closeBtn = document.getElementById("close-guide-btn");

if (openBtn && modal && closeBtn) {
    openBtn.onclick = function() {
        modal.style.display = "block";
    }

    closeBtn.onclick = function() {
        modal.style.display = "none";
    }

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
}
// Animacion huevos
function iniciarHuevosFlotantes() {
    let container = document.querySelector(".bg-eggs-container");
    if (!container) {
        container = document.createElement("div");
        container.className = "bg-eggs-container";
        document.body.prepend(container);
    }

    const listaImagenes = [
        "imagenes/huevodragonu.png"
    ];

    const totalHuevosFondo = 15;

    for (let i = 0; i < totalHuevosFondo; i++) {
        const egg = document.createElement("img");
        
        const imgAleatoria = listaImagenes[Math.floor(Math.random() * listaImagenes.length)];
        egg.src = imgAleatoria;
        egg.className = "bg-floating-egg";

        const tamaño = Math.random() * 50 + 35;
        egg.style.width = `${tamaño}px`;

        egg.style.left = `${Math.random() * 100}%`;

        const duracion = Math.random() * 10 + 12;
        egg.style.animationDuration = `${duracion}s`;

        const retraso = Math.random() * 12;
        egg.style.animationDelay = `${retraso}s`;

        container.appendChild(egg);
    }
}
// Modo Oscuro/Modo Claro
const themeToggleBtn = document.getElementById("theme-toggle");
const themeIcon = document.getElementById("theme-icon");


const savedTheme = localStorage.getItem("theme") || "dark";
document.documentElement.setAttribute("data-theme", savedTheme);
updateThemeIcon(savedTheme);

themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    if (theme === "light") {
        themeIcon.src = "imagenes/sol.png";
        themeIcon.alt = "Modo Oscuro";
    } else {
        themeIcon.src = "imagenes/luna.png";
        themeIcon.alt = "Modo Claro";
    }
}

window.addEventListener("load", () => {
    iniciarHuevosFlotantes();
});
