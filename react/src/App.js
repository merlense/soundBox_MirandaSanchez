// App.js
import React, { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AlbumModal from './components/AlbumModal';
import SearchModal from './components/SearchModal';  // ¡NUEVO COMPONENTE!
import AlbumCard from './components/AlbumCard';
import Contact from './components/Contact';
import About from './components/About';
import PopularAlbums from './components/TopSongs';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [albums, setAlbums] = useState([]);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);  // ¡NUEVO ESTADO!
  const [currentView, setCurrentView] = useState('home');
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [currentAlbumData, setCurrentAlbumData] = useState({
    albumID: '',
    albumName: '',
    artist: '',
    favSong: '',
    review: '',
    stars: 0
  });

  const handleAddAlbum = async (albumData = null) => {
    if (albumData && albumData.albumID) {
      console.log('🎵 Adding popular album:', albumData);
      setCurrentAlbumData({
        albumID: albumData.albumID,
        albumName: albumData.albumName,
        artist: albumData.artist,
        favSong: '',
        review: '',
        stars: 0
      });
      setEditingAlbum(null);
      setShowAlbumModal(true);
      return;
    }
    
    // Mostrar modal de búsqueda en lugar de prompt
    setShowSearchModal(true);
  };

  const handleSelectAlbumFromSearch = (albumData) => {
    setCurrentAlbumData(albumData);
    setEditingAlbum(null);
    setShowAlbumModal(true);
    setShowSearchModal(false);
  };

  const handleSaveAlbum = (albumData) => {
    if (editingAlbum) {
      setAlbums(prev => prev.map(album => 
        album === editingAlbum ? { ...albumData } : album
      ));
    } else {
      setAlbums(prev => [...prev, { ...albumData, id: Date.now() }]);
    }
    setShowAlbumModal(false);
    setEditingAlbum(null);
  };

  const handleEditAlbum = (album) => {
    setCurrentAlbumData(album);
    setEditingAlbum(album);
    setShowAlbumModal(true);
  };

  const handleDeleteAlbum = (albumToDelete) => {
    setAlbums(prev => prev.filter(album => album !== albumToDelete));
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'about':
        return <About />;
      
      case 'contact':
        return <Contact />;
      
      case 'home':
      default:
        return (
          <>
            <div className="d-flex justify-content-center mb-4">
              <button 
                className="btn btn-spotify btn-lg" 
                onClick={() => handleAddAlbum()} 
              >
                <i className="fas fa-plus me-2"></i>
                Agregar Álbum
              </button>
            </div>

            {/* SECCIÓN DE ÁLBUMES POPULARES */}
            <PopularAlbums onAddAlbum={handleAddAlbum} />

            <div className="row" id="albumContainer">
              {albums.map((album, index) => (
                <AlbumCard
                  key={album.id || index}
                  album={album}
                  onEdit={handleEditAlbum}
                  onDelete={handleDeleteAlbum}
                />
              ))}
              
              {albums.length === 0 && (
                <div className="col-12 text-center">
                  <div className="card p-5">
                    <i className="fas fa-music fa-3x text-muted mb-3"></i>
                    <h4>Tu colección está vacía</h4>
                    <p className="text-muted">Empezá agregando tu primer álbum</p>
                    <button 
                      className="btn btn-spotify mt-2"
                      onClick={() => handleAddAlbum()}
                    >
                      Agregar Primer Álbum
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        );
    }
  };

  return (
    <div className="d-flex flex-column min-vh-100">
      <Header currentView={currentView} onViewChange={handleViewChange} />
      
      <main className="flex-grow-1">
        <div className="container mt-4">
          {renderContent()}
        </div>
      </main>

      <Footer />

      {/* Modal para agregar/editar álbum */}
      <AlbumModal
        show={showAlbumModal}
        onHide={() => setShowAlbumModal(false)}
        onSave={handleSaveAlbum}
        initialData={currentAlbumData}
        isEditing={!!editingAlbum}
      />

      {/* ¡NUEVO MODAL DE BÚSQUEDA! */}
      <SearchModal
        show={showSearchModal}
        onHide={() => setShowSearchModal(false)}
        onSelectAlbum={handleSelectAlbumFromSearch}
      />
    </div>
  );
}

export default App;