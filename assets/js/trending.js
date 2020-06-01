function setLoading(isLoading) {
  const loaderElement = document.getElementById("loader");
  const gifsElement = document.getElementById("gifs");
  if (isLoading) {
    loaderElement.style.display = null;
    gifsElement.style.display = "none";
  } else {
    loaderElement.style.display = "none";
    gifsElement.style.display = null;
  }
}

function addGIFToFavorite(event) {
  const likeButton = event.currentTarget;
  const gifId = likeButton.dataset.gifId;

  const gifElement = document.getElementById(gifId);

  const gifTitle = gifElement.querySelector("div h3").textContent;
  const gifVideoUrl = gifElement.querySelector("source").src;
  const gifImageUrl = gifElement.querySelector("video img").dataset.src;

  const db = window.db;

  // TODO: 4a - Open IndexedDB's database
  db.open();
  // TODO: 4b - Save GIF data into IndexedDB's database
  db.gifs.add({
    id: gifId,
    title: gifTitle,
    imageUrl: gifImageUrl,
    videoUrl: gifVideoUrl
  });

  // TODO: 4c - Put GIF media (image and video) into a cache named "gif-images"
  caches
    .open("gif-images")
    .then(cache => {
      cache.add(gifImageUrl);
      cache.add(gifVideoUrl);
    })
    .catch(e => console.log(e));
  // Set button in 'liked' state (disable the button)
  likeButton.disabled = true;
}

function buildGIFCard(gifItem, isSaved) {
  // Create GIF Card element
  const newGifElement = document.createElement("article");
  newGifElement.classList.add("gif-card");
  newGifElement.id = gifItem.id;

  // Append GIF to card
  const gifImageElement = document.createElement("video");
  gifImageElement.autoplay = true;
  gifImageElement.loop = true;
  gifImageElement.muted = true;
  gifImageElement.setAttribute("playsinline", true);

  const videoSourceElement = document.createElement("source");
  videoSourceElement.src = gifItem.images.original.mp4;
  videoSourceElement.type = "video/mp4";
  gifImageElement.appendChild(videoSourceElement);

  const imageSourceElement = document.createElement("img");
  imageSourceElement.classList.add("lazyload");
  imageSourceElement.dataset.src = gifItem.images.original.webp;
  imageSourceElement.alt = `${gifItem.title} image`;
  gifImageElement.appendChild(imageSourceElement);

  newGifElement.appendChild(gifImageElement);

  // Append metadata to card
  const gifMetaContainerElement = document.createElement("div");
  newGifElement.appendChild(gifMetaContainerElement);

  // Append title to card metadata
  const gifTitleElement = document.createElement("h3");
  const gifTitleNode = document.createTextNode(gifItem.title || "No title");
  gifTitleElement.appendChild(gifTitleNode);
  gifMetaContainerElement.appendChild(gifTitleElement);

  // Append favorite button to card metadata
  const favButtonElement = document.createElement("button");
  favButtonElement.setAttribute("aria-label", `Save ${gifItem.title}`);
  favButtonElement.classList.add("button");
  favButtonElement.dataset.gifId = gifItem.id;
  favButtonElement.onclick = addGIFToFavorite;
  const favIconElement = document.createElement("i");
  favIconElement.classList.add("fas", "fa-heart");
  favButtonElement.appendChild(favIconElement);
  gifMetaContainerElement.appendChild(favButtonElement);

  // Disable button (set GIF as liked) if liked
  if (isSaved) {
    favButtonElement.disabled = true;
  }

  // Append GIF Card to DOM
  const articlesContainerElement = document.getElementById("gifs");
  articlesContainerElement.appendChild(newGifElement);
}

window.addEventListener("DOMContentLoaded", async function() {
  setLoading(true);

  // TODO: 1a - Set up a new URL object to use Giphy trending endpoint
  const url = new URL(
    "http://api.giphy.com/v1/gifs/trending?api_key=AeyszZfxBCkVqUztAGioyHjJEGMDc4CI&limiter=24"
  );

  // TODO: 1b - Set proper query parameters to the newly created URL object
  const params = {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  };

  try {
    const db = window.db;
    // TODO: 4d - Open IndexedDB's database
    db.open();
    // Display every GIF
    fetch(url, params)
      .then(rawResponse =>
        rawResponse
          .json()
          .then(gifs => {
            gifs.data.forEach(async gif => {
              let isSaved = false;
              db.gifs
                .get(gif.id)
                .then(savedGif => {
                  if (savedGif !== null && savedGif !== undefined) {
                    isSaved = true;
                  } else {
                    isSaved = false;
                  }
                  buildGIFCard(gif, isSaved);
                })
                .catch(() => buildGIFCard(gif, isSaved));
            });
          })
          .catch(e => console.log(e))
      )
      .catch(e => console.log(e));
  } catch (e) {
    console.log("No cats gifs for you ! Error occured while fetching gifs");
  } finally {
    setLoading(false);
  }
});
