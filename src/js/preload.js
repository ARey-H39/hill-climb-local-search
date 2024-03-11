const assets = [
    './src/images/board-dark_tile.png',
    './src/images/board-light_tile.png',
    './src/images/queen.png'
];
const images = [];
let imageCount = 0;

export default function init(app) {
    assets.forEach(src => {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            imageCount += 1;
            if (imageCount === images.length) {
                console.log(images);
                app(images).main();
            }
        }
        images.push(image);
    });
}