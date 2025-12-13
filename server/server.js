const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || "http://localhost:3000", credentials: true }));
app.use(express.json());

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;

let accessToken = null;
let tokenExpires = 0;

async function getAccessToken() {
    try {
        console.log('Getting Spotify access token...');
        const response = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Authorization": "Basic " + Buffer.from(CLIENT_ID + ":" + CLIENT_SECRET).toString("base64"),
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: "grant_type=client_credentials",
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Token request failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        accessToken = data.access_token;
        tokenExpires = Date.now() + data.expires_in * 1000;
        console.log('Access token obtained successfully');
        return accessToken;
        
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

async function ensureToken(req, res, next) {
    try {
        if (!accessToken || Date.now() > tokenExpires) {
            await getAccessToken();
        }
        next();
    } catch (error) {
        console.error('Token assurance failed:', error);
        res.status(500).json({ error: "Authentication failed: " + error.message });
    }
}

app.get("/top-argentina", ensureToken, async (req, res) => {
    try {
        console.log('Fetching popular Argentina songs...');
        
        const searchQueries = [
            "genre:argentina popular",
            "argentina pop 2024", 
            "argentina rock 2024",
            "cumbia argentina",
            "trap argentino"
        ];
        
        let allTracks = [];
        
        // Buscar en mÃºltiples categorÃ­as
        for (const query of searchQueries) {
            try {
                const response = await fetch(
                    `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10&market=AR`,
                    { headers: { Authorization: "Bearer " + accessToken } }
                );

                if (response.ok) {
                    const data = await response.json();
                    if (data.tracks && data.tracks.items) {
                        allTracks = [...allTracks, ...data.tracks.items];
                    }
                }
            } catch (error) {
                console.log(`Search failed for: ${query}`);
            }
        }
        
        // Ordenar por popularidad y tomar las top 5
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
        
        console.log('Top 6 Argentina songs found:', topSongs.length);
        
        topSongs.forEach(song => {
            console.log(`   ${song.position}. ${song.name} - ${song.artist}`);
        });
        
        res.json(topSongs);
        
    } catch (err) {
        console.error('Error in /top-argentina:', err.message);
        res.status(500).json({ 
            error: "Error obteniendo canciones populares de Argentina",
            details: err.message 
        });
    }
});

// bÃºsqueda de Ã¡lbumes
app.get("/search", ensureToken, async (req, res) => {
    const q = req.query.q;
    if (!q) return res.json([]);
    
    try {
        console.log('Searching albums for:', q);
        const response = await fetch(
            `https://api.spotify.com/v1/search?q=${encodeURIComponent(q)}&type=album&limit=5`,
            { headers: { Authorization: "Bearer " + accessToken } }
        );

        console.log('Search response status:', response.status);

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const data = await response.json();
        console.log('Albums found:', data.albums?.items?.length || 0);
        res.json(data.albums.items);
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: "Error buscando Ã¡lbumes en Spotify" });
    }
});

// para obtener Ã¡lbum por track ID
app.get("/album-by-track", ensureToken, async (req, res) => {
    const trackId = req.query.trackId;
    
    if (!trackId) {
        return res.status(400).json({ error: "Track ID is required" });
    }
    
    try {
        const response = await fetch(
            `https://api.spotify.com/v1/tracks/${trackId}`,
            { headers: { Authorization: "Bearer " + accessToken } }
        );

        if (!response.ok) {
            throw new Error(`Spotify API error: ${response.status}`);
        }

        const trackData = await response.json();
        
        const albumData = {
            id: trackData.album.id,
            name: trackData.album.name,
            artist: trackData.album.artists.map(artist => artist.name).join(", ")
        };
        
        res.json(albumData);
        
    } catch (err) {
        console.error('Error getting album by track:', err);
        res.status(500).json({ error: "Error obteniendo informaciÃ³n del Ã¡lbum" });
    }
});


// INICIAR SERVIDOR
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Client ID: ${CLIENT_ID ? "Configured" : "NOT CONFIGURED"}`);
    console.log(`Endpoint: http://localhost:${PORT}/top-argentina`);
    console.log('='.repeat(50));
});

