import { useEffect, useState } from 'react';

const API_BASE = "https://soundbox.up.railway.app";

function Home() {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchAlbums() {
      try {
        const res = await fetch(`${API_BASE}/api/albums`);
        const data = await res.json();
        setAlbums(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, []);

  if (loading) return <p>Cargando álbumes...</p>;
  if (albums.length === 0) return <p>No hay álbumes guardados aún.</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Álbumes guardados</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
        {albums.map(({ albumID, albumName, artist, favSong, review, stars }) => (
          <div key={albumID} style={{ border: "1px solid #ccc", padding: "1rem", width: "300px", borderRadius: "8px" }}>
            <iframe
              src={`https://open.spotify.com/embed/album/${albumID}`}
              width="100%"
              height="150"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              title={albumName}
              style={{ borderRadius: "12px" }}
            ></iframe>
            <p><b>Álbum:</b> {albumName}</p>
            <p><b>Artista:</b> {artist}</p>
            <p><b>Canción favorita:</b> {favSong}</p>
            <p><b>Reseña:</b> {review}</p>
            <p><b>Estrellas:</b> {"★".repeat(stars)}{"☆".repeat(5 - stars)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
