import React from 'react';

const About = () => {
  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body text-center">
              <h2 className="card-title mb-4">Sobre SoundBox</h2>
              
              <p className="lead">
                Tu plataforma personal para descubrir, clasificar y reseñar álbumes musicales.
              </p>

              <div className="row mt-5">
                <div className="col-md-4 mb-4">
                  <div className="feature-icon">
                    <i className="fas fa-star fa-2x text-warning mb-3"></i>
                    <h5>Calificá</h5>
                    <p>Puntuá tus álbumes favoritos con el sistema de estrellas</p>
                  </div>
                </div>
                
                <div className="col-md-4 mb-4">
                  <div className="feature-icon">
                    <i className="fas fa-music fa-2x text-primary mb-3"></i>
                    <h5>Descubrí</h5>
                    <p>Explorá millones de álbumes gracias a la integración con Spotify</p>
                  </div>
                </div>
                
                <div className="col-md-4 mb-4">
                  <div className="feature-icon">
                    <i className="fas fa-edit fa-2x text-success mb-3"></i>
                    <h5>Reseñá</h5>
                    <p>Compartí tus opiniones y experiencias musicales</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <h5>¿Cómo funciona?</h5>
                <ol className="text-start">
                  <li>Buscá cualquier álbum musical</li>
                  <li>Agregá tu canción favorita y reseña</li>
                  <li>Calificá con estrellas del 1 al 5</li>
                  <li>¡Compartí tu colección musical!</li>
                </ol>
              </div>

              <div className="mt-4">
                <p className="text-muted">
                  Desarrollado con ❤️ para amantes de la música
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;