const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export const searchAlbums = async (query) => {
  try {
    console.log('Buscando álbum:', query);
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const albums = await response.json();
    console.log('Álbumes encontrados:', albums.length);
    const albumsToShow = albums;
    albumsToShow.sort((a, b) => {
      if (a.popularity && b.popularity) {
        return b.popularity - a.popularity;
      }
      const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
      const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
      return yearB - yearA;
    });
    console.log('Álbumes a mostrar:', albumsToShow.length);
    return albumsToShow.slice(0, 10);
  } catch (error) {
    console.error('Error buscando álbumes:', error);
    throw error;
  }
};
