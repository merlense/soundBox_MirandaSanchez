const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

// Configuración CORRECTA de CORS para producción
const allowedOrigins = [
  'https://soundbox-mirandasanchez.vercel.app',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Permitir solicitudes sin origen (como apps móviles o curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `El origen ${origin} no está permitido por CORS`;
      console.error('CORS bloqueado:', msg);
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

console.log('Configuración cargada - Client ID:', CLIENT_ID ? 'Presente' : 'Faltante');
console.log('CORS Origins permitidos:', allowedOrigins);

let accessToken = null;
let tokenExpires = 0;

async function getAccessToken() {
    try {
        console.log('Solicitando token de acceso a Spotify...');
        
        if (!CLIENT_ID || !CLIENT_SECRET) {
            throw new Error('Faltan CLIENT_ID o CLIENT_SECRET en las variables de entorno');
        }

        const authString = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');
        
        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');

        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": `Basic ${authString}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.toString()
        });

        console.log('📊 Estado de respuesta de Spotify:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de Spotify:', errorText);
            throw new Error(`Token request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpires = Date.now() + data.expires_in * 1000;
        console.log('Token de acceso obtenido exitosamente');
        console.log('Token expira en:', new Date(tokenExpires).toLocaleTimeString());
        return accessToken;
        
    } catch (error) {
        console.error('Error obteniendo token de acceso:', error.message);
        throw error;
    }
}

async function ensureToken(req, res, next) {
    try {
        console.log('Verificando token...');
        if (!accessToken || Date.now() > tokenExpires) {
            console.log('Token expirado o no presente, renovando...');
            await getAccessToken();
        } else {
            console.log('Token válido presente');
        }
        next();
    } catch (error) {
        console.error('Falló la verificación del token:', error.message);
        res.status(500).json({ 
            error: "Error de autenticación con Spotify",
            message: error.message,
            details: "Verifica tus credenciales CLIENT_ID y CLIENT_SECRET"
        });
    }
}

// Ruta de prueba de salud
app.get("/", (req, res) => {
    res.json({ 
        status: "online",
        service: "SoundBox Backend API",
        endpoints: {
            topArgentina: "/top-argentina",
            search: "/search?q=[query]",
            albumByTrack: "/album-by-track?trackId=[id]",
            health: "/health"
        },
        spotifyStatus: accessToken ? "Conectado" : "No conectado"
    });
});

app.get("/health", (req, res) => {
    res.json({ 
        status: "healthy",
        timestamp: new Date().toISOString(),
        spotify: {
            hasCredentials: !!(CLIENT_ID && CLIENT_SECRET),
            hasToken: !!accessToken,
            tokenExpires: tokenExpires ? new Date(tokenExpires).toISOString() : null
        }
    });
});

app.get("/top-argentina", ensureToken, async (req, res) => {
    try {
        console.log('🎵 Buscando canciones populares de Argentina...');
        
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
                console.log(`Búsqueda: ${query}`);
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
                        console.log(`Encontrados ${data.tracks.items.length} tracks para "${query}"`);
                        allTracks = [...allTracks, ...data.tracks.items];
                    }
                } else {
                    console.log(`Búsqueda fallida para: ${query} - Status: ${response.status}`);
                }
            } catch (error) {
                console.log(`Error en búsqueda: ${query}`, error.message);
            }
        }
        
        console.log(`Total de tracks recolectados: ${allTracks.length}`);
        
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
                popularity: track.popularity,
                preview_url: track.preview_url || null
            }));
        
        console.log('Top 6 canciones de Argentina procesadas');
        
        res.json({
            success: true,
            count: topSongs.length,
            songs: topSongs,
            generated_at: new Date().toISOString()
        });
        
    } catch (err) {
        console.error('Error en /top-argentina:', err.message);
        res.status(500).json({ 
            success: false,
            error: "Error obteniendo canciones populares de Argentina",
            message: err.message 
        });
    }
});

app.get("/search", ensureToken, async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json({ success: false, error: "Query parameter 'q' is required" });
    
    try {
        console.log('🔍 Buscando álbumes para:', q);
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=5`,
            { 
                headers: { 
                    "Authorization": `Bearer ${accessToken}`,
                    "Content-Type": "application/json"
                } 
            }
        );

        console.log('📊 Estado de búsqueda:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Error de API de Spotify:', errorText);
            throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Álbumes encontrados:', data.albums?.items?.length || 0);
        
        res.json({
            success: true,
            query: q,
            count: data.albums?.items?.length || 0,
            albums: data.albums?.items || []
        });
    } catch (err) {
        console.error('Error en búsqueda:', err.message);
        res.status(500).json({ 
            success: false,
            error: "Error buscando álbumes en Spotify",
            message: err.message 
        });
    }
});

app.get("/album-by-track", ensureToken, async (req, res) => {
    const trackId = req.query.trackId;
    
    if (!trackId) {
        return res.status(400).json({ 
            success: false,
            error: "Track ID is required" 
        });
    }
    
    try {
        console.log(`🎵 Obteniendo información del track: ${trackId}`);
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
            console.error('Error de API de Spotify:', errorText);
            throw new Error(`Spotify API error: ${response.status} - ${errorText}`);
        }

        const trackData = await response.json();
        
        const albumData = {
            success: true,
            album: {
                id: trackData.album.id,
                name: trackData.album.name,
                artist: trackData.album.artists.map(artist => artist.name).join(", "),
                images: trackData.album.images,
                release_date: trackData.album.release_date,
                total_tracks: trackData.album.total_tracks
            },
            track: {
                id: trackData.id,
                name: trackData.name,
                duration_ms: trackData.duration_ms,
                explicit: trackData.explicit
            }
        };
        
        console.log(`Información del álbum obtenida: ${albumData.album.name}`);
        res.json(albumData);
        
    } catch (err) {
        console.error('Error obteniendo álbum por track:', err.message);
        res.status(500).json({ 
            success: false,
            error: "Error obteniendo información del álbum",
            message: err.message 
        });
    }
});

// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('SOUNDBOX BACKEND API INICIADA');
    console.log('='.repeat(60));
    console.log(`Puerto: ${PORT}`);
    console.log(`Spotify Client ID: ${CLIENT_ID ? 'Configurado' : 'NO CONFIGURADO'}`);
    console.log(`Spotify Client Secret: ${CLIENT_SECRET ? 'Configurado' : 'NO CONFIGURADO'}`);
    console.log(`CORS Origins permitidos:`, allowedOrigins);
    console.log(`URL Local: http://localhost:${PORT}`);
    console.log(`Ruta de salud: http://localhost:${PORT}/health`);
    console.log(`Endpoint principal: http://localhost:${PORT}/top-argentina`);
    console.log('='.repeat(60));
    console.log('Obteniendo token inicial de Spotify...');
});