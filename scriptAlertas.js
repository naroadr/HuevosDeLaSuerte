function triggerAlert(username, eggType, prize) {
            const container = document.getElementById("alert-container");
            container.innerHTML = `
                <div class="alert-box">
                    <h3>¡${username} abrió un huevo!</h3>
                    <div class="alert-prize">${prize}</div>
                    <p>Ha conseguido: <strong>${prize}</strong></p>
                </div>
            `;
            
            setTimeout(() => {
                container.innerHTML = "";
            }, 5000);
        }
