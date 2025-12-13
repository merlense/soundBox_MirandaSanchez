const API_URL = process.env.REACT_APP_API_URL || '';\n\nconst API_URL = process.env.REACT_APP_API_URL || API_URL;\n\n// services/spotifyService.js
export const searchAlbums = async (query) => {
  try {
    console.log('Buscando Ã¡lbum:', query);
    
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const albums = await response.json();
    console.log('Ãlbumes encontrados:', albums.length);
    
    // Â¡SIN FILTRADO! Mostrar TODOS los Ã¡lbumes
    const albumsToShow = albums;
    
    // Ordenar por popularidad o aÃ±o de lanzamiento
    albumsToShow.sort((a, b) => {
      // Primero por popularidad (si estÃ¡ disponible)
      if (a.popularity && b.popularity) {
        return b.popularity - a.popularity;
      }
      // Luego por aÃ±o de lanzamiento (mÃ¡s reciente primero)
      const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
      const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
      return yearB - yearA;
    });
    
    console.log('Ãlbumes a mostrar:', albumsToShow.length);
    albumsToShow.forEach((album, i) => {
      console.log(`   ${i + 1}. "${album.name}" - ${album.artists.map(a => a.name).join(', ')} (${album.release_date || 'Sin fecha'})`);
    });
    
    return albumsToShow.slice(0, 10); // Limitar a 10 resultados mÃ¡ximo
    
  } catch (error) {
    console.error('Error buscando Ã¡lbumes:', error);
    throw error;
  }
};



