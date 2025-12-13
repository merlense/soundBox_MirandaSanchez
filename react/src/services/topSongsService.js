const API_URL = "https://soundbox.up.railway.app";

export const getTopSongs = async () => {
  try {
    console.log("Fetching top songs from Argentina...");
    const response = await fetch(`${API_URL}/top-argentina`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const songs = await response.json();
    if (songs.error) {
      throw new Error(songs.error);
    }
    console.log("Top songs found:", songs);
    return songs;
  } catch (error) {
    console.error("Error fetching top songs:", error);
    throw new Error(`No se pudieron cargar las canciones del Top 50: ${error.message}`);
  }
};

export const getAlbumByTrack = async (trackId) => {
  try {
    console.log("Searching album for track:", trackId);
    const response = await fetch(`${API_URL}/album-by-track?trackId=${trackId}`);
    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }
    const album = await response.json();
    console.log("Album found:", album.name);
    return album;
  } catch (error) {
    console.error("Error fetching album by track:", error);
    throw error;
  }
};
