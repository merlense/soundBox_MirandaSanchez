import React, { useState, useEffect } from 'react';
import '../css/AlbumCard.css';

const AlbumCard = ({ album, onEdit, onDelete }) => {
  const [showFullReview, setShowFullReview] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  const toggleReview = () => {
    setShowFullReview(!showFullReview);
  };

  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteModal(true); // Mostrar modal propio
  };

  const confirmDelete = () => {
    onDelete(album);
    setShowDeleteModal(false);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
  };

  const getReviewPreview = (review) => {
    if (!review) return 'Sin reseña';
    if (review.length <= 100 || showFullReview) return review;
    return review.substring(0, 100) + '...';
  };

  useEffect(() => {
    const handleResize = () => {
      setIframeKey(prev => prev + 1);
    };

    let resizeTimer;
    const debouncedResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(handleResize, 250);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  const SPOTIFY_HEIGHT = 352;

  return (
    <div className="col-12 col-md-6 col-lg-4 mb-4">
      {/* MODAL DE CONFIRMACIÓN - ESTILOS INLINE SIMPLES */}
      {showDeleteModal && (
        <div className="modal-confirm-overlay">
          <div className="modal-confirm-content">
            <div className="modal-confirm-header">
              <i className="fas fa-exclamation-triangle text-warning me-2"></i>
              <h5 className="modal-confirm-title">Eliminar álbum</h5>
            </div>
            
            <div className="modal-confirm-body">
              <p>
                ¿Estás seguro de que quieres eliminar <strong>"{album.albumName}"</strong> 
                {album.artist && ` de ${album.artist}`} de tu colección?
              </p>
              <p className="text-muted small">
                Esta acción no se puede deshacer.
              </p>
            </div>
            
            <div className="modal-confirm-footer">
              <button 
                className="btn btn-outline-secondary btn-sm"
                onClick={cancelDelete}
              >
                <i className="fas fa-times me-2"></i>
                Cancelar
              </button>
              <button 
                className="btn btn-danger btn-sm"
                onClick={confirmDelete}
              >
                <i className="fas fa-trash me-2"></i>
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="album-card">
        {/* Header de la tarjeta */}
        <div className="album-card-header">
          <div className="album-badge">
            <i className="fas fa-compact-disc"></i>
          </div>
          <div className="album-actions">
            <button 
              className="btn-action btn-edit"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(album);
              }}
              title="Editar álbum"
            >
              <i className="fas fa-edit"></i>
            </button>
            <button 
              className="btn-action btn-delete"
              onClick={handleDeleteClick}
              title="Eliminar álbum"
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        </div>

        {/* CONTENEDOR DE SPOTIFY */}
        <div className="spotify-wrapper">
          <iframe 
            key={iframeKey}
            src={`https://open.spotify.com/embed/album/${album.albumID}`}
            className="spotify-iframe"
            title={`Spotify - ${album.albumName}`}
            allow="encrypted-media"
            loading="lazy"
          />
        </div>

        {/* Información del álbum */}
        <div className="album-card-content">
          <div className="album-info">
            <h3 className="album-title" title={album.albumName}>
              {album.albumName && album.albumName.length > 40 ? 
                album.albumName.substring(0, 40) + '...' : 
                album.albumName || 'Sin nombre'}
            </h3>
            <p className="album-artist">
              <i className="fas fa-user me-2"></i>
              {album.artist || 'Artista desconocido'}
            </p>
          </div>

          {/* Canción favorita */}
          {album.favSong && (
            <div className="favorite-song-section">
              <div className="section-header">
                <i className="fas fa-heart"></i>
                <h6>Canción Favorita</h6>
              </div>
              <p className="favorite-song-text" title={album.favSong}>
                "{album.favSong}"
              </p>
            </div>
          )}

          {/* Reseña */}
          {album.review && (
            <div className="review-section">
              <div className="section-header">
                <i className="fas fa-comment"></i>
                <h6>Mi Reseña</h6>
              </div>
              <div className="review-content">
                <p className="review-text">
                  {getReviewPreview(album.review)}
                </p>
                {album.review && album.review.length > 100 && (
                  <button 
                    className="btn-read-more"
                    onClick={toggleReview}
                  >
                    {showFullReview ? (
                      <>
                        <i className="fas fa-chevron-up me-1"></i>
                        Ver menos
                      </>
                    ) : (
                      <>
                        <i className="fas fa-chevron-down me-1"></i>
                        Leer más
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Calificación */}
          <div className="rating-section">
            <div className="rating-header">
              <h6>Mi Calificación</h6>
              <div className="rating-badge">
                {album.stars || 0}/5
              </div>
            </div>
            <div className="stars-display">
              {[1, 2, 3, 4, 5].map((star) => (
                <div 
                  key={star}
                  className={`star-display ${star <= (album.stars || 0) ? 'active' : ''}`}
                >
                  <i className="fas fa-star"></i>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer de la tarjeta - TAMBIÉN CON MODAL PROPIO */}
        <div className="album-card-footer">
          <div className="footer-actions">
            <button 
              className="btn-footer-action btn-edit-footer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEdit(album);
              }}
            >
              <i className="fas fa-edit me-2"></i>
              Editar
            </button>
            <button 
              className="btn-footer-action btn-delete-footer"
              onClick={handleDeleteClick}
            >
              <i className="fas fa-trash me-2"></i>
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;