import React, { useState } from 'react';
import '../css/estilos.css'; // Importa tu archivo de estilos

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simular envío
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccessModal(true);
      setFormData({ name: '', email: '', message: '' });
    }, 800);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };

  return (
    <div className="container mt-4">
      {/* MODAL DE ÉXITO */}
      {showSuccessModal && (
        <div className="contact-modal-overlay">
          <div className="contact-modal-content">
            <div className="contact-modal-icon">
              <i className="fas fa-check-circle"></i>
            </div>
            <h4 className="contact-modal-title">¡Mensaje enviado!</h4>
            <p className="contact-modal-text">
              Gracias por contactarnos. Te responderemos a la brevedad.
            </p>
            <button 
              className="btn btn-spotify"
              onClick={closeSuccessModal}
            >
              <i className="fas fa-check me-2"></i>
              Entendido
            </button>
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card shadow">
            <div className="card-body">
              <h2 className="card-title text-center mb-4">📞 Contacto</h2>
              
              <p className="text-center mb-4">
                ¿Tenés sugerencias, preguntas o no encontras tu álbum favorito? ¡Escribinos!
              </p>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="name" className="form-label">Nombre</label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Tu nombre completo"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tu@email.com"
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="message" className="form-label">Mensaje</label>
                  <textarea
                    className="form-control"
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Escribe tu mensaje aquí..."
                  ></textarea>
                </div>

                <div className="text-center">
                  <button 
                    type="submit" 
                    className="btn btn-spotify btn-lg"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane me-2"></i>
                        Enviar Mensaje
                      </>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-5 pt-4 border-top">
                <h5 className="text-center">O contactanos directamente</h5>
                <div className="row text-center mt-3">
                  <div className="col-md-4 mb-3">
                    <div className="contact-method">
                      <i className="fas fa-envelope fa-2x text-primary mb-2"></i>
                      <p>soundbox@email.com</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="contact-method">
                      <i className="fas fa-phone fa-2x text-success mb-2"></i>
                      <p>+54 11 1234-5678</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <div className="contact-method">
                      <i className="fas fa-map-marker-alt fa-2x text-danger mb-2"></i>
                      <p>Buenos Aires, Argentina</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;