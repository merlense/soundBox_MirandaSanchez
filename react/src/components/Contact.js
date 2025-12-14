import React, { useState } from 'react';

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

  return (
    <div className="container py-4">
      {/* MODAL DE ÉXITO - BOOTSTRAP */}
      <div className={`modal fade ${showSuccessModal ? 'show d-block' : ''}`} tabIndex="-1" style={{display: showSuccessModal ? 'block' : 'none'}}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header border-0">
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => setShowSuccessModal(false)}
              ></button>
            </div>
            <div className="modal-body text-center py-4">
              <div className="mb-3">
                <i className="fas fa-check-circle text-success fa-4x"></i>
              </div>
              <h4 className="modal-title mb-3">¡Mensaje enviado!</h4>
              <p className="text-muted">
                Gracias por contactarnos. Te responderemos a la brevedad.
              </p>
            </div>
            <div className="modal-footer border-0 justify-content-center">
              <button 
                className="btn btn-spotify px-4"
                onClick={() => setShowSuccessModal(false)}
              >
                <i className="fas fa-check me-2"></i>
                Entendido
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* OVERLAY PARA MODAL */}
      {showSuccessModal && <div className="modal-backdrop fade show"></div>}

      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          <div className="card shadow border-0">
            <div className="card-body p-4 p-md-5">
              <h2 className="card-title text-center mb-4">📞 Contacto</h2>
              
              <p className="text-center text-muted mb-4">
                ¿Tenés sugerencias, preguntas o no encontras tu álbum favorito? ¡Escribinos!
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="name" className="form-label fw-medium">Nombre</label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="Tu nombre completo"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="email" className="form-label fw-medium">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="message" className="form-label fw-medium">Mensaje</label>
                  <textarea
                    className="form-control form-control-lg"
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
                    className="btn btn-spotify btn-lg px-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
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
                <h5 className="text-center mb-4">O contactanos directamente</h5>
                <div className="row text-center">
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="p-3">
                      <i className="fas fa-envelope fa-2x text-primary mb-3"></i>
                      <h6>Email</h6>
                      <p className="text-muted mb-0">soundbox@email.com</p>
                    </div>
                  </div>
                  <div className="col-md-4 mb-3 mb-md-0">
                    <div className="p-3">
                      <i className="fas fa-phone fa-2x text-success mb-3"></i>
                      <h6>Teléfono</h6>
                      <p className="text-muted mb-0">+54 11 1234-5678</p>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="p-3">
                      <i className="fas fa-map-marker-alt fa-2x text-danger mb-3"></i>
                      <h6>Ubicación</h6>
                      <p className="text-muted mb-0">Buenos Aires, Argentina</p>
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