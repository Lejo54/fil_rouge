const pubImages = ["pub1.png", "pub2.png","pub3.png","pub4.png"];
const link="https://youtu.be/Aq5WXmQQooo?si=4yEkacgs-1X2Skqa";
const pubList = document.getElementById("pub-list");
const imagesBase = new URL("../images/", document.currentScript.src);

if (pubList) {
  pubImages.forEach((name, index) => {
    const pub = document.createElement("a");
    pub.className = "pub";
    pub.href = link;
    pub.style.backgroundImage = `url("${new URL(name, imagesBase).href}")`;
    pub.style.animationDelay = `${index * 0.5}s`;
    pubList.appendChild(pub);
  });
}