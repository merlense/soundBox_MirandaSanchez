import React, { useState, useEffect } from 'react';

const TopSongs = ({ onAddAlbum }) => {
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingAlbum, setLoadingAlbum] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopSongs = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching top songs...');
        const songs = await getTopSongs();
        console.log('📦 Songs received:', songs);
        setTopSongs(songs);
      } catch (error) {
        console.error('Error loading top songs:', error);
        setError(error.message);
        setTopSongs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopSongs();
  }, []);

  const handleAddToCollection = async (song) => {
    if (onAddAlbum) {
      setLoadingAlbum(song.id);
      
      try {
        console.log('Searching album for song:', song.name);
        
        const album = await getAlbumByTrack(song.id);
        
        console.log('Album found automatically:', album);
        
        const albumData = {
          albumID: album.id,
          albumName: album.name,
          artist: album.artist
        };
        
        onAddAlbum(albumData);
        
      } catch (error) {
        console.error('Error finding album:', error);
        alert('No se pudo encontrar el álbum automáticamente. Podés buscarlo manualmente.');
        
        const albumData = {
          albumID: '',
          albumName: song.album || `Álbum de ${song.name}`,
          artist: song.artist
        };
        onAddAlbum(albumData);
      } finally {
        setLoadingAlbum(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="popular-albums-section mb-5">
        <h3 className="section-title mb-4">
          Popular This Week
        </h3>
        <div className="albums-grid">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="album-card loading">
              <div className="album-image placeholder"></div>
              <div className="album-info">
                <div className="album-title placeholder"></div>
                <div className="album-artist placeholder"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="popular-albums-section mb-5">
       javascript
      <h3 className="section-title mb-4">
          Top semanal
      </h3>
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Error al cargar los álbumes populares: {error}
        </div>
      </div>
    );
  }

  if (topSongs.length === 0 && !loading) {
    return (
      <div className="popular-albums-section mb-5">
        <h3 className="section-title mb-4">
          Top semanal
        </h3>
        <div className="alert alert-warning">
          <i className="fas fa-info-circle me-2"></i>
          No se encontraron álbumes populares.
        </div>
      </div>
    );
  }

  return (
    <div className="popular-albums-section mb-5">
      <h3 className="section-title mb-4">
          Top semanal
      </h3>

      <div className="albums-grid">
        {topSongs.map((song) => (
          <div key={song.id} className="album-card">
            <div className="album-image-container">
              <img 
                src={song.album_image} 
                alt={song.album}
                className="album-image"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjZjBmMGYwIi8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOTk5OTk5IiBmb250LXNpemU9IjE0Ij7wn42JPC90ZXh0Pgo8L3N2Zz4=';
                }}
              />
              <button 
                className="btn-add-album-overlay"
                onClick={() => handleAddToCollection(song)}
                title="Agregar álbum a la colección"
                disabled={loadingAlbum === song.id}
              >
                {loadingAlbum === song.id ? (
                  <i className="fas fa-spinner fa-spin"></i>
                ) : (
                  <i className="fas fa-plus"></i>
                )}
              </button>
            </div>
            <div className="album-info">
              <div className="album-title">
                {song.album}
              </div>
              <div className="album-artist">
                {song.artist}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Funciones de servicio
const getTopSongs = async () => {
  try {
    console.log('Fetching top songs from Argentina...');
    
    const response = await fetch('http://localhost:3000/top-argentina');
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const songs = await response.json();
    
    if (songs.error) {
      throw new Error(songs.error);
    }
    
    console.log('Top songs found:', songs.length);
    return songs;
    
  } catch (error) {
    console.error('Error fetching top songs:', error);
    throw new Error(`No se pudieron cargar las canciones del Top 50: ${error.message}`);
  }
};

const getAlbumByTrack = async (trackId) => {
  try {
    console.log('Searching album for track:', trackId);
    
    const response = await fetch(`http://localhost:3000/album-by-track?trackId=${trackId}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const album = await response.json();
    console.log('Album found:', album.name);
    return album;
    
  } catch (error) {
    console.error('Error fetching album by track:', error);
    throw error;
  }
};

export default TopSongs;