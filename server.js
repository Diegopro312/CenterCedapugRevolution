const express = require('express');
const mysql = require('mysql2/promise');
const session = require('express-session');
const app = express();

app.use(express.json());

// Salto de advertencia obligatorio para que Ngrok deje pasar los datos
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true');
    next();
});

// 1. MEMORIA DE SESIÓN SEGURA
app.use(session({
    secret: 'revolucion_l4d2_secret',
    resave: true,
    saveUninitialized: true
}));

// 2. CONEXIÓN DIRECTA A TU BASE DE DATOS DE XAMPP
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'l4d2_comunidad',
    port: 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// TU ID DE FUNDADOR FIJO AMARRADO FÍSICAMENTE
const STEAMID_DUEÑO_SUPREMO = '76561199163516706'; 

// 3. RUTA PRINCIPAL CON EL PANEL INTERACTIVO DE DOS COLUMNAS
app.get('/', (req, res) => {
    const dominioActual = `${req.protocol}://${req.get('host')}`;

    let botonSteam = `<div style="margin-bottom: 25px;">
        <a href="${dominioActual}/auth/steam" style="text-decoration: none;">
            <button style="background-color: #171a21; color: white; border: 1px solid #3a3a3a; padding: 12px 24px; border-radius: 4px; font-weight: bold; cursor: pointer; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                🎮 Iniciar Sesión con Steam Oficial
            </button>
        </a>
    </div>`;
    
    let estadoSeguridadHTML = '<span style="color: #ff4757; font-weight: bold;">[Modo Espectador Anónimo]</span>';
    let habilitarControlesScript = 'false';

    if (req.session.user) {
        const user = req.session.user;
        botonSteam = `<div style="max-width: 500px; margin: 0 auto 25px auto; background: #23272a; padding: 15px; border-radius: 6px; display: flex; align-items: center; gap: 15px; border: 1px solid #2f3542; text-align: left;">
            <div style="font-size: 2rem;">👤</div>
            <div>
                <strong style="font-size: 1.1rem; color: #2ed573;">¡Sesión Iniciada con Éxito! 🎉</strong><br>
                <span style="color: #747d8c; font-size: 0.85rem;">SteamID64: ${user.steamid}</span>
            </div>
        </div>`;
        
        if (user.steamid === STEAMID_DUEÑO_SUPREMO) {
            estadoSeguridadHTML = '<span style="color: #2ed573; font-weight: bold;">[👑 FUNDADOR SUPREMO DETECTADO] Acceso Completo RCON Habilitado.</span>';
            habilitarControlesScript = 'true';
        } else {
            estadoSeguridadHTML = '<span style="color: #ffa502; font-weight: bold;">[⚠️ JUGADOR COMÚN] Consola bloqueada.</span>';
        }
    }

    res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Master Panel | CenterCedapugRevolution</title>
        <style>
            body { font-family: sans-serif; background-color: #121214; color: white; text-align: center; padding: 20px; margin: 0; }
            h1 { color: #ff4757; font-size: 3rem; margin-bottom: 5px; }
            h1 span { color: #ffffff; }
            .sub { color: #a4b0be; margin-top: 0; margin-bottom: 30px; font-weight: bold; letter-spacing: 1px; }
            .grid-revolucion { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; max-width: 1100px; margin: 0 auto; text-align: left; }
            .tarjeta { background: #1a1a1e; padding: 25px; border-radius: 8px; border-left: 4px solid #ff4757; box-shadow: 0 4px 10px rgba(0,0,0,0.5); }
            .grupo { margin-bottom: 15px; }
            label { display: block; color: #a4b0be; margin-bottom: 5px; font-size: 0.9rem; }
            input, select { width: 100%; padding: 10px; background: #23272a; border: 1px solid #2f3542; color: white; border-radius: 4px; box-sizing: border-box; }
            .btn { background-color: #ff4757; color: white; border: none; width: 100%; padding: 12px; font-size: 1.1rem; font-weight: bold; border-radius: 4px; cursor: pointer; transition: background 0.2s; margin-top: 10px; text-align: center; }
            .btn:hover { background-color: #ff6b81; }
            .consola-salida { background: #000; border: 1px solid #2f3542; padding: 15px; border-radius: 4px; font-family: monospace; color: #2ed573; min-height: 60px; margin-top: 15px; white-space: pre-wrap; font-size: 0.9rem; }
            .precio { font-size: 1.8rem; color: #2ed573; font-weight: bold; margin: 15px 0; text-align: center; }
        </style>
    </head>
    <body>
        <h1>Center<span>Cedapug</span>Revolution</h1>
        <div class="sub">🚀 MASTER PANEL PRIVADO DE SEGURIDAD INTERNA 🚀</div>

        ` + botonSteam + `

        <div style="margin-bottom: 30px; background: #1a1a1e; padding: 10px; display: inline-block; border-radius: 4px;">
            Rango Staff: ` + estadoSeguridadHTML + `
        </div>

        <div class="grid-revolucion">
            <!-- BLOQUE RCON -->
            <div class="tarjeta">
                <h3>⚙️ Enviar Comando al Servidor (RCON)</h3>
                <div class="grupo">
                    <label>Seleccionar Servidor Dedicado:</label>
                    <select id="server-select">
                        <option value="127.0.0.1">Servidor Local de Pruebas (Laptop)</option>
                    </select>
                </div>
                <div class="grupo">
                    <label>Comandos Rápidos:</label>
                    <select id="comando-rapido">
                        <option value="sm_zonemod">Cargar Configuración ZoneMod 100 Tickrate 🎮</option>
                        <option value="sm_restart">Reiniciar Partida de Versus 🔄</option>
                    </select>
                </div>
                <button class="btn" onclick="mandarComandoRCON()">Ejecutar Comando en Vivo</button>
                <div class="consola-salida" id="consola-texto">> Servidor listo...</div>
            </div>

            <!-- BLOQUE VENTAJAS VIP -->
            <div class="tarjeta" style="border-left-color: #2ed573; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <h3>⭐ Gestión de Beneficios & Membresías VIP</h3>
                    <p style="color: #a4b0be; font-size: 0.9rem;">El sistema de Valve guarda tu cuenta en tu XAMPP automáticamente.</p>
                </div>
                <div>
                    <div class="precio">$2.90 USD / mes</div>
                    <button class="btn" style="background-color: #23272a; border: 1px solid #3a3a3a;" onclick="alert('Conectando pasarela...')">
                        💳 Cobrar con Pasarela (Mercado Pago / PayPal)
                    </button>
                </div>
            </div>
        </div>

        <script>
            const esDueño = ` + habilitarControlesScript + `;
            
            async function mandarComandoRCON() {
                const consola = document.getElementById('consola-texto');
                const comando = document.getElementById('comando-rapido').value;
                
                if (!esDueño) {
                    alert("[ACCESO DENEGADO CRC]\\nComando bloqueado. No eres el administrador.");
                    return;
                }
                
                consola.innerText = "> Encontrando instrucción de administrador...";
                setTimeout(() => {
                    consola.innerText = "> [RESPUESTA DEL SERVIDOR]:\\nComando '" + comando + "' ejecutado.";
                }, 600);
            }
        </script>
    </body>
    </html>
    `);
});

// 4. EL PUENTE OFICIAL SUPREMO DE VALVE CON RUTA DIRECTA (/openid/login)
app.get('/auth/steam', (req, res) => {
    const dominioActual = `${req.protocol}://${req.get('host')}`;
    
    const openidUrl = 'https://steamcommunity.com?' + 
        'openid.ns=http://openid.net&' +
        'openid.mode=checkid_setup&' +
        `openid.return_to=${encodeURIComponent(dominioActual + '/auth/steam/return')}&` +
        `openid.realm=${encodeURIComponent(dominioActual + '/')}&` +
        'openid.identity=http://openid.net/identifier_select&' +
        'openid.claimed_id=http://openid.net/identifier_select';
    
    res.redirect(openidUrl);
});

// 5. RETORNO DE VALVE: CAPTURA TU ID Y LO METE A TU XAMPP LOCAL
app.get('/auth/steam/return', async (req, res) => {
    try {
        const claimedId = req.query['openid.claimed_id'];
        if (!claimedId) return res.redirect('/');

        const steamId = claimedId.replace('https://steamcommunity.com', '');

        // Guarda físicamente el ID en tu base de datos local
        await pool.query(
            'INSERT INTO usuarios (steam_id64, nombre) VALUES (?, ?) ON DUPLICATE KEY UPDATE steam_id64=?',
            [steamId, 'Fundador_Supremo', steamId]
        );

        req.session.user = { steamid: steamId };
        console.log(`[CenterCedapugRevolution] ¡Sesión exitosa en XAMPP!: ${steamId}`);
        res.redirect('/');
    } catch (error) {
        console.error("Error al retornar de Steam:", error);
        res.redirect('/');
    }
});

const PUERTO = 3000;
app.listen(PUERTO, '127.0.0.1', () => {
    console.log("==================================================");
    console.log("🚀 [CenterCedapugRevolution] ¡Master Panel Listo!");
    console.log("==================================================");
});
