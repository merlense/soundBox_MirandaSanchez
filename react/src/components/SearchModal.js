// components/SearchModal.js
import React, { useState, useEffect, useRef } from 'react';
import { searchAlbums } from '../services/spotifyService';
import '../css/SearchModal.css';

const SearchModal = ({ show, onHide, onSelectAlbum }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  // Función para formatear nombres de álbum
  const formatAlbumName = (album) => {
    const artistNames = album.artists.map(a => a.name).join(', ');
    let albumName = album.name;
    
    // Si el nombre del álbum es igual al artista, añadimos el tipo
    if (album.name.toLowerCase() === artistNames.toLowerCase()) {
      if (album.album_type === 'album') {
        albumName = `${album.name} (Álbum)`;
      } else if (album.album_type === 'single') {
        albumName = `${album.name} (Single)`;
      } else if (album.album_type === 'compilation') {
        albumName = `${album.name} (Compilación)`;
      }
    }
    
    // Si tiene fecha, la mostramos siempre
    if (album.release_date) {
      const year = new Date(album.release_date).getFullYear();
      // Solo añadimos el año si no está ya en el nombre
      if (!albumName.includes(`(${year})`) && !albumName.includes(`[${year}]`)) {
        albumName = `${albumName} • ${year}`;
      }
    }
    
    // Si el nombre es muy largo, lo acortamos
    if (albumName.length > 60) {
      return albumName.substring(0, 57) + '...';
    }
    
    return albumName;
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const results = await searchAlbums(searchQuery);
      setAlbums(results || []);
    } catch (err) {
      console.error('Error buscando álbumes:', err);
      setError('Error al buscar álbumes. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAlbum = (album) => {
    onSelectAlbum({
      albumID: album.id,
      albumName: album.name, // Usamos el nombre original de Spotify
      artist: album.artists.map(a => a.name).join(", "),
      favSong: '',
      review: '',
      stars: 0
    });
    resetModal();
  };

  const resetModal = () => {
    setSearchQuery('');
    setAlbums([]);
    setError(null);
    onHide();
  };

  // Efecto para focus en el input
  useEffect(() => {
    if (show && inputRef.current) {
      setTimeout(() => {
        inputRef.current.focus();
      }, 300);
    }
  }, [show]);

  // Efecto para búsqueda en tiempo real
  useEffect(() => {
    if (searchQuery.length >= 3) {
      const timeoutId = setTimeout(() => {
        handleSearch();
      }, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery]);

  if (!show) return null;

  return (
    <div className="search-modal-overlay" onClick={resetModal}>
      <div className="search-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="search-modal-header">
          <h3>
            <i className="fas fa-search me-2"></i>
            Buscar Álbum
          </h3>
          <button className="btn-close-modal" onClick={resetModal}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="search-modal-body">
          <form onSubmit={handleSearch} className="search-form">
            <div className="input-group">
              <span className="input-group-text">
                <i className="fas fa-music"></i>
              </span>
              <input
                ref={inputRef}
                type="text"
                className="form-control search-input"
                placeholder="Escribe el nombre del álbum o artista..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoComplete="off"
              />
              <button 
                className="btn btn-search" 
                type="submit"
                disabled={!searchQuery.trim() || loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>
                    Buscar
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="alert alert-danger mt-3">
              <i className="fas fa-exclamation-circle me-2"></i>
              {error}
            </div>
          )}

          <div className="results-container mt-4">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-3 text-white-50">Buscando álbumes...</p>
              </div>
            ) : albums.length > 0 ? (
              <>
                <div className="results-header">
                  <h6 className="results-title">
                    <i className="fas fa-compact-disc me-2"></i>
                    Resultados ({albums.length})
                  </h6>
                  <div className="results-hint">
                    <i className="fas fa-info-circle me-1"></i>
                    Haz clic en cualquier álbum para seleccionarlo
                  </div>
                </div>
                <div className="album-grid">
                  {albums.map((album, index) => {
                    const artistNames = album.artists.map(a => a.name).join(', ');
                    const displayAlbumName = formatAlbumName(album);
                    const originalAlbumName = album.name;
                    const isSameAsArtist = originalAlbumName.toLowerCase() === artistNames.toLowerCase();
                    
                    return (
                      <div 
                        key={album.id} 
                        className="album-result-card"
                        onClick={() => handleSelectAlbum(album)}
                        style={{ '--index': index }}
                      >
                        <div className="album-result-top">
                          <div className="album-result-image">
                            <img 
                              src={album.images[0]?.url || 'https://via.placeholder.com/120'} 
                              alt={originalAlbumName}
                              className="album-img"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/120/1a1a1a/1db954?text=🎵';
                              }}
                            />
                            <div className="album-overlay">
                              <i className="fas fa-plus fa-lg"></i>
                            </div>
                          </div>
                          <div className="album-main-info">
                            <div className="album-name-container">
                              <h5 className="album-title" title={originalAlbumName}>
                                {displayAlbumName}
                              </h5>
                              {isSameAsArtist && (
                                <span 
                                  className="album-same-name-indicator" 
                                  title="Este álbum tiene el mismo nombre que el artista"
                                >
                                  <i className="fas fa-info-circle"></i>
                                </span>
                              )}
                              {originalAlbumName.length > 60 && (
                                <span 
                                  className="album-full-name" 
                                  title={`Nombre completo: ${originalAlbumName}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    alert(`Nombre completo del álbum:\n"${originalAlbumName}"\n\nArtista: ${artistNames}`);
                                  }}
                                >
                                  <i className="fas fa-expand-alt"></i>
                                </span>
                              )}
                            </div>
                            <p className="album-artist">
                              <i className="fas fa-user me-1"></i>
                              {artistNames}
                            </p>
                            {album.album_type && (
                              <div className="album-type-container">
                                <span className="album-type-badge">
                                  <i className={`fas fa-${album.album_type === 'album' ? 'compact-disc' : album.album_type === 'single' ? 'music' : 'layer-group'} me-1`}></i>
                                  {album.album_type === 'album' ? 'Álbum' : 
                                   album.album_type === 'single' ? 'Single' : 
                                   album.album_type === 'compilation' ? 'Compilación' : album.album_type}
                                </span>
                                {album.total_tracks && (
                                  <span className="album-tracks-badge">
                                    <i className="fas fa-music me-1"></i>
                                    {album.total_tracks} {album.total_tracks === 1 ? 'canción' : 'canciones'}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="album-result-bottom">
                          <div className="album-meta">
                            <div className="meta-item">
                              <i className="fas fa-calendar me-1"></i>
                              <div>
                                <span className="meta-label">Lanzamiento</span>
                                <strong className="meta-value">
                                  {album.release_date ? 
                                    new Date(album.release_date).toLocaleDateString('es-ES', { 
                                      year: 'numeric', 
                                      month: 'short', 
                                      day: 'numeric' 
                                    }) : 
                                    'No disponible'
                                  }
                                </strong>
                              </div>
                            </div>
                            <div className="meta-item">
                              <i className="fas fa-hashtag me-1"></i>
                              <div>
                                <span className="meta-label">Popularidad</span>
                                <strong className="meta-value">
                                  {album.popularity ? `${album.popularity}/100` : 'N/A'}
                                </strong>
                              </div>
                            </div>
                            <div className="meta-item">
                              <i className="fas fa-globe me-1"></i>
                              <div>
                                <span className="meta-label">Mercado</span>
                                <strong className="meta-value">
                                  {album.available_markets?.length > 0 ? 
                                    `${album.available_markets.length} países` : 
                                    'Global'
                                  }
                                </strong>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            className="btn-select-album"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectAlbum(album);
                            }}
                          >
                            <i className="fas fa-plus-circle me-2"></i>
                            Agregar "{displayAlbumName.split(' • ')[0].split(' (')[0]}"
                          </button>
                        </div>
                        
                        {/* Indicador visual de selección */}
                        <div className="album-select-hint">
                          <i className="fas fa-hand-pointer"></i>
                          Haz clic para seleccionar
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : searchQuery.length >= 3 && !loading ? (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 className="text-white">No se encontraron álbumes</h5>
                <p className="text-white-50">Intenta con otro nombre o artista</p>
                <button 
                  className="btn btn-spotify mt-3"
                  onClick={() => inputRef.current?.focus()}
                >
                  <i className="fas fa-redo me-2"></i>
                  Buscar otra vez
                </button>
              </div>
            ) : searchQuery.length > 0 && searchQuery.length < 3 ? (
              <div className="text-center py-5">
                <i className="fas fa-keyboard fa-3x text-muted mb-3"></i>
                <p className="text-white-50">Escribe al menos 3 caracteres para buscar</p>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-search fa-3x text-muted mb-3"></i>
                <h5 className="text-white">Busca tu álbum favorito</h5>
                <p className="text-white-50">Empieza a escribir el nombre del álbum o artista</p>
                <div className="search-examples mt-4">
                  <p className="text-muted mb-2">Ejemplos de búsqueda:</p>
                  <div className="d-flex flex-wrap justify-content-center gap-2">
                    <span 
                      className="badge bg-secondary"
                      onClick={() => setSearchQuery('El después')}
                      style={{ cursor: 'pointer' }}
                    >
                      El después
                    </span>
                    <span 
                      className="badge bg-secondary"
                      onClick={() => setSearchQuery('1989 Taylor Swift')}
                      style={{ cursor: 'pointer' }}
                    >
                      1989 Taylor's Version
                    </span>
                    <span 
                      className="badge bg-secondary"
                      onClick={() => setSearchQuery('Duki')}
                      style={{ cursor: 'pointer' }}
                    >
                      Duki
                    </span>
                    <span 
                      className="badge bg-secondary"
                      onClick={() => setSearchQuery('The Dark Side of the Moon')}
                      style={{ cursor: 'pointer' }}
                    >
                      The Dark Side of the Moon
                    </span>
                    <span 
                      className="badge bg-secondary"
                      onClick={() => setSearchQuery('Bad Bunny')}
                      style={{ cursor: 'pointer' }}
                    >
                      Bad Bunny
                    </span>
                    <span 
                      className="badge bg-secondary"
                      onClick={() => setSearchQuery('Soda Stereo')}
                      style={{ cursor: 'pointer' }}
                    >
                      Soda Stereo
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="search-modal-footer">
          <button className="btn btn-cancel" onClick={resetModal}>
            <i className="fas fa-times me-2"></i>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;