const link = "https://youtu.be/Aq5WXmQQooo?si=4yEkacgs-1X2Skqa";

const pubImages = [
  { src: "pub1.png", alt: "Publicité 1", width: 175, height: 313 },
  { src: "pub2.png", alt: "Publicité 2", width: 201, height: 255 },
  { src: "pub3.png", alt: "Publicité 3", width: 421, height: 417 },
  { src: "pub4.png", alt: "Publicité 4", width: 421, height: 376 }
];

const pubList = document.getElementById("pub-list");
const imagesBase = new URL("../images/", document.currentScript.src);

if (pubList) {
  pubImages.forEach(({ src, alt, width, height }) => {
    const pub = document.createElement("a");
    pub.className = "pub";
    pub.href = link;
    pub.target = "_blank";
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