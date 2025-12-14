const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// CONFIGURACION DE CORS CORREGIDA
const allowedOrigins = [
    'https://sound-box-miranda-sanchez.vercel.app',
    'https://sound-box-miranda-sanchez-9odbxfu0j-agustinas-projects-ae398ce4.vercel.app',
    'https://sound-box-miranda-sanchez-fupgl7kwz-agustinas-projects-ae398ce4.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.includes(origin)) {
            console.log('CORS PERMITIDO para:', origin);
            return callback(null, true);
        }
        
        console.log('CORS BLOQUEADO para:', origin);
        return callback(new Error('CORS bloqueado'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options('*', cors());
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = null;
let tokenExpires = 0;

async function getAccessToken() {
    try {
        console.log('INFO: Solicitando token de Spotify...');
        
        if (!CLIENT_ID || !CLIENT_SECRET) {
            console.error('ERROR: CLIENT_ID o CLIENT_SECRET estan vacios');
            console.log(`DEBUG - CLIENT_ID: ${CLIENT_ID ? 'Presente' : 'Ausente'}`);
            console.log(`DEBUG - CLIENT_SECRET: ${CLIENT_SECRET ? 'Presente' : 'Ausente'}`);
            throw new Error('Credenciales de Spotify no configuradas en variables de entorno');
        }
        
        const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authString}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials"
        });

        console.log(`DEBUG - Spotify respondio con status: ${response.status}`);
        
        const responseText = await response.text();
        console.log(`DEBUG - Respuesta de Spotify: ${responseText}`);
        
        if (!response.ok) {
            let errorMessage = `Token request failed: ${response.status}`;
            try {
                const errorData = JSON.parse(responseText);
                if (errorData.error === 'invalid_client') {
                    errorMessage += ' - ERROR: Credenciales invalidas (CLIENT_ID o CLIENT_SECRET incorrectos)';
                } else {
                    errorMessage += ` - ${responseText}`;
                }
            } catch {
                errorMessage += ` - ${responseText}`;
            }
            console.error(`ERROR: ${errorMessage}`);
            throw new Error(errorMessage);
        }

        const data = JSON.parse(responseText);
        accessToken = data.access_token;
        tokenExpires = Date.now() + data.expires_in * 1000;
        console.log('SUCCESS: Token obtenido correctamente');
        console.log(`DEBUG - Token expira: ${new Date(tokenExpires).toLocaleTimeString()}`);
        return accessToken;
        
    } catch (error) {
        console.error('ERROR en getAccessToken:', error.message);
        throw error;
    }
}

async function ensureToken(req, res, next) {
    console.log(`DEBUG - Ruta solicitada: ${req.path} | Origen: ${req.headers.origin || 'N/A'}`);
    
    try {
        if (!accessToken || Date.now() > tokenExpires) {
            console.log('DEBUG - Token expirado o inexistente, solicitando nuevo...');
            await getAccessToken();
            console.log('DEBUG - Nuevo token obtenido');
        } else {
            console.log('DEBUG - Token valido en cache');
        }
        next();
    } catch (error) {
        console.error(`ERROR en ensureToken para ruta ${req.path}:`, error.message);
        res.status(401).json({ 
            error: "Authentication to Spotify failed",
            details: error.message,
            route: req.path,
            timestamp: new Date().toISOString()
        });
    }
}

// RUTA DE SALUD
app.get("/health", (req, res) => {
    const healthStatus = {
        status: "healthy",
        timestamp: new Date().toISOString(),
        spotify: {
            hasCredentials: !!(CLIENT_ID && CLIENT_SECRET),
            hasToken: !!(accessToken && Date.now() < tokenExpires),
            tokenExpires: tokenExpires ? new Date(tokenExpires).toISOString() : null
        }
    };
    res.json(healthStatus);
});

// RUTAS PRINCIPALES
app.get("/top-argentina", ensureToken, async (req, res) => {
    try {
        console.log('INFO: Buscando canciones populares de Argentina...');
        
        const searchQueries = [
            "genre:argentina popular",
            "argentina pop 2024", 
            "argentina rock 2024",
            "cumbia argentina",
            "trap argentino"
        ];
        
        let allTracks = [];
        
        for (const query of searchQueries) {
            try {
                const response = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=AR`,
                    { 
                        headers: { 
                            "Authorization": `Bearer ${accessToken}`,
                            "Content-Type": "application/json"
                        } 
                    }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.tracks && data.tracks.items) {
                        allTracks = [...allTracks, ...data.tracks.items];
                    }
                }
            } catch (error) {
                console.log(`WARN: Busqueda fallida para: ${query}`, error.message);
            }
        }
        
        const topSongs = allTracks
            .sort((a, b) => b.popularity - a.popularity)
            .slice(0, 6)
            .map((track, index) => ({
                id: track.id,
                position: index + 1,
                name: track.name,
                artist: track.artists.map(artist => artist.name).join(", "),
                album: track.album.name,
                album_image: track.album.images[0]?.url || '',
                popularity: track.popularity
            }));
        
        console.log(`INFO: ${topSongs.length} canciones encontradas`);
        
        res.json(topSongs);
        
    } catch (err) {
        console.error('ERROR en /top-argentina:', err.message);
        res.status(500).json({ 
            error: "Error obteniendo canciones populares de Argentina",
            details: err.message 
        });
    }
});

app.get("/search", ensureToken, async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);
    
    try {
        console.log(`INFO: Buscando albumes para: ${q}`);
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=5`,
            { 
                headers: { 
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                } 
            }
        );

        console.log(`DEBUG - Search response status: ${response.status}`);

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log(`INFO: ${data.albums?.items?.length || 0} albumes encontrados`);
        res.json(data.albums.items);
    } catch (err) {
        console.error('ERROR en /search:', err);
        res.status(500).json({ 
            error: "Error buscando albumes en Spotify",
            details: err.message 
        });
    }
});

app.get("/album-by-track", ensureToken, async (req, res) => {
    const trackId = req.query.trackId;
    
    if (!trackId) {
        return res.status(400).json({ error: "Track ID is required" });
    }
    
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            { 
                headers: { 
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                } 
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
        }

        const trackData = await response.json();
        
        const albumData = {
            id: trackData.album.id,
            name: trackData.album.name,
            artist: trackData.album.artists.map(artist => artist.name).join(", ")
        };
        
        res.json(albumData);
        
    } catch (err) {
        console.error('ERROR en /album-by-track:', err);
        res.status(500).json({ 
            error: "Error obteniendo informacion del album",
            details: err.message 
        });
    }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`SoundBox Backend iniciado`);
    console.log(`Puerto: ${PORT}`);
    console.log(`Client ID: ${CLIENT_ID ? "Configurado" : "NO CONFIGURADO"}`);
    console.log(`CORS Origin: ${process.env.CORS_ORIGIN || 'Usando valor por defecto'}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Endpoint principal: http://localhost:${PORT}/top-argentina`);
    console.log('='.repeat(50));
});