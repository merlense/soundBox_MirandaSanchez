// components/AlbumModal.js
import React, { useState, useEffect, useRef } from 'react';
import '../css/AlbumModal.css';

const AlbumModal = ({ show, onHide, onSave, initialData, isEditing }) => {
  const [formData, setFormData] = useState(initialData);
  const [selectedStars, setSelectedStars] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    if (show) {
      setFormData(initialData);
      setSelectedStars(initialData.stars || 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [show, initialData]);

  const handleStarClick = (stars) => {
    setSelectedStars(stars);
    setFormData(prev => ({ ...prev, stars }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({ ...formData, stars: selectedStars });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
      onHide();
    }
  };

  if (!show) return null;

  return (
    <div className="album-modal-overlay" onClick={handleOverlayClick}>
      <div className="album-modal-content" ref={modalRef}>
        <div className="album-modal-header">
          <div className="modal-title-container">
            <h3>
              <i className={`fas fa-${isEditing ? 'edit' : 'plus-circle'} me-2`}></i>
              {isEditing ? 'Editar Álbum' : 'Agregar Nuevo Álbum'}
            </h3>
            <p className="modal-subtitle">
              {isEditing ? 'Actualiza la información de tu álbum' : 'Completa los detalles de tu álbum'}
            </p>
          </div>
          <button className="modal-close-btn" onClick={onHide}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="album-modal-body">
          {/* Vista previa del álbum - SOLUCIÓN DIRECTA */}
          <div style={{ margin: 0, padding: 0, border: 'none' }}>
            <div className="modal-preview-header">
              <h5>
                <i className="fas fa-play-circle me-2"></i>
                Vista previa del álbum
              </h5>
            </div>
            
            {/* Contenedor ultra-minimalista - SIN CLASES CSS */}
            <div style={{
              width: '100%',
              height: '352px', // +2px extra para cubrir
              backgroundColor: '#121212',
              overflow: 'hidden',
              position: 'relative',
              margin: '0',
              padding: '0',
              lineHeight: '0',
              border: 'none',
              display: 'block'
            }}>
              <iframe 
                src={`https://open.spotify.com/embed/album/${formData.albumID}?theme=0`}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  margin: '0',
                  padding: '0',
                  display: 'block',
                  position: 'absolute',
                  top: '0',
                  left: '0',
                  backgroundColor: '#121212',
                  minHeight: '350px'
                }}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                title="Vista previa del álbum"
                loading="lazy"
              ></iframe>
            </div>
          </div>

          {/* Formulario */}
          <div className="album-form-section">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-compact-disc me-2"></i>
                  Nombre del álbum
                </label>
                <input 
                  type="text" 
                  className="form-control-custom" 
                  value={formData.albumName}
                  onChange={(e) => handleInputChange('albumName', e.target.value)}
                  placeholder="Ej: 1989 (Taylor's Version)"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-user me-2"></i>
                  Artista
                </label>
                <input 
                  type="text" 
                  className="form-control-custom" 
                  value={formData.artist}
                  onChange={(e) => handleInputChange('artist', e.target.value)}
                  placeholder="Ej: Taylor Swift"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <i className="fas fa-heart me-2"></i>
                  Canción favorita
                </label>
                <input 
                  type="text" 
                  className="form-control-custom" 
                  value={formData.favSong}
                  onChange={(e) => handleInputChange('favSong', e.target.value)}
                  placeholder="¿Cuál es tu canción favorita de este álbum?"
                />
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  <i className="fas fa-comment me-2"></i>
                  Reseña personal
                </label>
                <textarea 
                  className="form-control-custom textarea-custom"
                  rows="4"
                  value={formData.review}
                  onChange={(e) => handleInputChange('review', e.target.value)}
                  placeholder="Comparte tus pensamientos, sentimientos o recuerdos sobre este álbum..."
                ></textarea>
                <div className="textarea-hint">
                  <i className="fas fa-lightbulb me-1"></i>
                  Cuéntanos qué te hace especial este álbum
                </div>
              </div>
            </div>

            {/* Calificación con estrellas */}
            <div className="rating-section">
              <div className="rating-header">
                <h6>
                  <i className="fas fa-star me-2"></i>
                  Calificación
                </h6>
                <div className="rating-value">
                  <span className="current-rating">{selectedStars}</span>
                  <span className="max-rating">/5</span>
                </div>
              </div>
              
              <div className="stars-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <div 
                    key={star}
                    className={`star-wrapper ${star <= selectedStars ? 'selected' : ''}`}
                    onClick={() => handleStarClick(star)}
                    title={`${star} estrella${star !== 1 ? 's' : ''}`}
                  >
                    <div className="star-background">
                      <i className="fas fa-star star-icon"></i>
                    </div>
                    <span className="star-number">{star}</span>
                  </div>
                ))}
              </div>
              
              <div className="rating-labels">
                <span className="rating-label">Malo</span>
                <span className="rating-label">Excelente</span>
              </div>
            </div>
          </div>
        </div>

        <div className="album-modal-footer">
          <button 
            type="button" 
            className="btn btn-cancel"
            onClick={onHide}
          >
            <i className="fas fa-times me-2"></i>
            Cancelar
          </button>
          <button 
            type="button" 
            className="btn btn-save"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Guardando...
              </>
            ) : (
              <>
                <i className={`fas fa-${isEditing ? 'save' : 'plus-circle'} me-2`}></i>
                {isEditing ? 'Actualizar Álbum' : 'Agregar a mi Colección'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlbumModal;