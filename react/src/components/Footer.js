import React from 'react';

const Footer = () => {
  return (
    <footer className="text-center bg-dark text-white pt-4">
      <section className="mb-4">
        <a href="#" className="text-white me-3 social-icon"><i className="fab fa-facebook-f"></i></a>
        <a href="#" className="text-white me-3 social-icon"><i className="fab fa-twitter"></i></a>
        <a href="#" className="text-white me-3 social-icon"><i className="fab fa-google"></i></a>
        <a href="#" className="text-white me-3 social-icon"><i className="fab fa-instagram"></i></a>
        <a href="#" className="text-white me-3 social-icon"><i className="fab fa-linkedin"></i></a>
        <a href="#" className="text-white social-icon"><i className="fab fa-github"></i></a>
      </section>

      <div className="text-center p-3" style={{backgroundColor: 'rgba(0,0,0,0.2)'}}>
        © 2025 SoundBox
      </div>
    </footer>
  );
};

export default Footer;