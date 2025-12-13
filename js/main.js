const container = document.getElementById("albumContainer");
const addBtn = document.getElementById("addAlbumBtn");

const modal = document.getElementById("albumModal");
const saveAlbumBtn = document.getElementById("saveAlbum");
const favSongInput = document.getElementById("modalFavSong");
const reviewInput = document.getElementById("modalReview");
const modalStars = document.getElementById("modalStars");
const modalAlbumName = document.getElementById("modalAlbumName");
const modalAlbumArtist = document.getElementById("modalAlbumArtist");
const modalIframe = document.getElementById("modalIframe");

const bootstrapModal = new bootstrap.Modal(modal);

let selectedStars = 0;
let currentAlbumID = null;
let editingCard = null;

modalStars.querySelectorAll(".star").forEach((star, index) => {
    star.addEventListener("click", () => {
        selectedStars = index + 1;
        modalStars.querySelectorAll(".star").forEach((s, i) =>
            s.classList.toggle("active", i <= index)
        );
    });
});

function createAlbumCard({ albumID, albumName, artist, favSong, review, stars }) {
    const cardCol = document.createElement("div");
    cardCol.classList.add("col-12", "col-md-4", "mb-4"); 

    const card = document.createElement("div");
    card.classList.add("card");

    card.innerHTML = `
        <iframe src="https://open.spotify.com/embed/album/${albumID}" frameborder="0" allowfullscreen allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>
        <p><b>Álbum:</b> <span class="album-name">${albumName}</span></p>
        <p><b>Artista:</b> <span class="artist-name">${artist}</span></p>
        <p><b>Canción favorita:</b> <span class="fav-song">${favSong}</span></p>
        <p><b>Reseña:</b> <span class="review">${review}</span></p>
        <div class="stars mb-2">
            <span class="star">★</span>
            <span class="star">★</span>
            <span class="star">★</span>
            <span class="star">★</span>
            <span class="star">★</span>
        </div>
        <div class="d-flex justify-content-center gap-3 mb-2">
            <button class="btn btn-sm btn-outline-primary edit-btn">✏️</button>
            <button class="btn btn-sm btn-outline-danger delete-btn">🗑️</button>
        </div>
    `;

    const starsEls = card.querySelectorAll(".stars .star");
    starsEls.forEach((s, i) => s.classList.toggle("active", i < stars));
    starsEls.forEach((star, index) =>
        star.addEventListener("click", () => starsEls.forEach((s, i) =>
            s.classList.toggle("active", i <= index)
        ))
    );

    card.querySelector(".delete-btn").addEventListener("click", () => cardCol.remove());

    card.querySelector(".edit-btn").addEventListener("click", () => {
        editingCard = card;
        modalAlbumName.value = albumName;
        modalAlbumArtist.value = artist;
        favSongInput.value = favSong;
        reviewInput.value = review;
        selectedStars = stars;
        modalStars.querySelectorAll(".star").forEach((s, i) => s.classList.toggle("active", i < stars));
        modalIframe.src = `https://open.spotify.com/embed/album/${albumID}`;
        currentAlbumID = albumID;
        bootstrapModal.show();
    });

    cardCol.appendChild(card);
    container.appendChild(cardCol);
}

saveAlbumBtn.addEventListener("click", () => {
    const data = {
        albumID: currentAlbumID,
        albumName: modalAlbumName.value,
        artist: modalAlbumArtist.value,
        favSong: favSongInput.value,
        review: reviewInput.value,
        stars: selectedStars
    };

    if (editingCard) {
        editingCard.querySelector(".album-name").textContent = data.albumName;
        editingCard.querySelector(".artist-name").textContent = data.artist;
        editingCard.querySelector(".fav-song").textContent = data.favSong;
        editingCard.querySelector(".review").textContent = data.review;
        editingCard.querySelectorAll(".stars .star").forEach((s, i) => s.classList.toggle("active", i < data.stars));
        editingCard = null;
    } else {
        createAlbumCard(data);
    }

    bootstrapModal.hide();
});

addBtn.addEventListener("click", async () => {
    const query = prompt("Escribí el nombre del álbum:");
    if (!query) return;

    try {
        const res = await fetch(`http://localhost:3000/search?q=${encodeURIComponent(query)}`);
        const albums = await res.json();

        if (albums.length === 0) {
            alert("No se encontró el álbum");
            return;
        }

        const album = albums[0];
        currentAlbumID = album.id;
        modalAlbumName.value = album.name;
        modalAlbumArtist.value = album.artists.map(a => a.name).join(", ");
        favSongInput.value = "";
        reviewInput.value = "";
        selectedStars = 0;
        modalStars.querySelectorAll(".star").forEach(s => s.classList.remove("active"));
        modalIframe.src = `https://open.spotify.com/embed/album/${currentAlbumID}`;
        editingCard = null;
        bootstrapModal.show();
    } catch (err) {
        console.error(err);
        alert("Error al buscar álbum");
    }
});