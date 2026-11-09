// Renders a list of clickable ad banners inside the #pub-list element.

// Destination URL shared by every ad
const link = "https://youtu.be/Aq5WXmQQooo?si=4yEkacgs-1X2Skqa";

// Ad images with their display dimensions (set explicitly to avoid layout shift)
const pubImages = [
  { src: "pub1.png", alt: "Publicité 1", width: 175, height: 313 },
  { src: "pub2.png", alt: "Publicité 2", width: 201, height: 255 },
  { src: "pub3.png", alt: "Publicité 3", width: 421, height: 417 },
  { src: "pub4.png", alt: "Publicité 4", width: 421, height: 376 }
];

const pubList = document.getElementById("pub-list");

// Resolve the images folder relative to THIS script (not the page), so the
// script works from any page depth. Must be read synchronously at load time:
// document.currentScript is null inside async callbacks.
const imagesBase = new URL("../images/", document.currentScript.src);

// Only build the ads if the page actually has the container
if (pubList) {
  pubImages.forEach(({ src, alt, width, height }) => {
    const pub = document.createElement("a");
    pub.className = "pub";
    pub.href = link;
    pub.target = "_blank";
    // noopener/noreferrer: prevents the opened page from accessing window.opener
    pub.rel = "noopener noreferrer";

    const img = document.createElement("img");
    img.src = new URL(src, imagesBase).href;
    img.alt = alt;
    img.width = width;
    img.height = height;

    pub.append(img);
    pubList.append(pub);
  });
}