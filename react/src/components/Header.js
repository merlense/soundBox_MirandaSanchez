import React from 'react';

const Header = ({ currentView, onViewChange }) => {
  return (
    <header className="bg-dark text-white">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <div className="container">
          <span className="navbar-brand" style={{cursor: 'pointer'}} onClick={() => onViewChange('home')}>
            <h1 className="mb-0">SoundBox</h1>
          </span>
          
          <button 
            className="navbar-toggler" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target="#navbarNav"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${currentView === 'home' ? 'active' : ''}`}
                  onClick={() => onViewChange('home')}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    color: currentView === 'home' ? '#1DB954' : 'white' 
                  }}
                >
                  <i className="fas fa-home me-1"></i>
                  Inicio
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${currentView === 'about' ? 'active' : ''}`}
                  onClick={() => onViewChange('about')}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    color: currentView === 'about' ? '#1DB954' : 'white' 
                  }}
                >
                  <i className="fas fa-info-circle me-1"></i>
                  Sobre Nosotros
                </button>
              </li>
              <li className="nav-item">
                <button 
                  className={`nav-link btn btn-link ${currentView === 'contact' ? 'active' : ''}`}
                  onClick={() => onViewChange('contact')}
                  style={{ 
                    border: 'none', 
                    background: 'transparent', 
                    color: currentView === 'contact' ? '#1DB954' : 'white' 
                  }}
                >
                  <i className="fas fa-envelope me-1"></i>
                  Contacto
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;