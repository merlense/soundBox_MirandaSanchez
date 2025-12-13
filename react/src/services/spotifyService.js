// services/spotifyService.js
export const searchAlbums = async (query) => {
  try {
    console.log('Buscando álbum:', query);
    
    const response = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    
    const albums = await response.json();
    console.log('Álbumes encontrados:', albums.length);
    
    // ¡SIN FILTRADO! Mostrar TODOS los álbumes
    const albumsToShow = albums;
    
    // Ordenar por popularidad o año de lanzamiento
    albumsToShow.sort((a, b) => {
      // Primero por popularidad (si está disponible)
      if (a.popularity && b.popularity) {
        return b.popularity - a.popularity;
      }
      // Luego por año de lanzamiento (más reciente primero)
      const yearA = a.release_date ? new Date(a.release_date).getFullYear() : 0;
      const yearB = b.release_date ? new Date(b.release_date).getFullYear() : 0;
      return yearB - yearA;
    });
    
    console.log('Álbumes a mostrar:', albumsToShow.length);
    albumsToShow.forEach((album, i) => {
      console.log(`   ${i + 1}. "${album.name}" - ${album.artists.map(a => a.name).join(', ')} (${album.release_date || 'Sin fecha'})`);
    });
    
    return albumsToShow.slice(0, 10); // Limitar a 10 resultados máximo
    
  } catch (error) {
    console.error('Error buscando álbumes:', error);
    throw error;
  }
};