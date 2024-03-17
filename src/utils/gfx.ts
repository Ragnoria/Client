export const randomColor = function (): string {
    return "#000000".replace(/0/g, function () {
        return (~~(Math.random() * 16)).toString(16);
    });
}

export const hexToRGB = function (hex: string): [number, number, number] {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) {
        throw new Error('Could not convert hexToRGB');
    }

    return [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)];
};

export const replaceColors = function (image: HTMLImageElement, colorMap: {[p: string]: string}) {
    const colorMapRGB: {[p: string]: [number, number, number]} = {};
    Object.keys(colorMap).forEach(key => {
        colorMapRGB[hexToRGB(key).toString()] = hexToRGB(colorMap[key]);
    });

    const ctx: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d") ?? (() => {
        throw Error('Could not get canvas 2d context');
    })();
    ctx.canvas.width = image.width;
    ctx.canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const currentColor = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]].toString();
        if (currentColor in colorMapRGB) {
            const color = colorMapRGB[currentColor];
            imageData.data[i] = color[0];
            imageData.data[i + 1] = color[1];
            imageData.data[i + 2] = color[2];
            imageData.data[i + 3] = 255;
        }
    }
    ctx.putImageData(imageData, 0, 0);

    return ctx.canvas;
}

export const loadImage = async function (src: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.src = src;
    });
}

export const dye = async function (image: HTMLImageElement, mask: HTMLImageElement, colors: string[]): Promise<HTMLImageElement> {
    return new Promise(resolve => {
        if (!mask ?? false) {
            return image;
        }

        const placeholders = ['#ff0000', '#ff00ff', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];
        const map: {[p: string]: string} = {};
        colors.forEach((color, index) => {
            map[placeholders[index]] = color;
        });

        const coloredMask = replaceColors(mask, map);
        const ctx: CanvasRenderingContext2D = document.createElement("canvas").getContext("2d") ?? (() => {
            throw Error('Could not get canvas 2d context');
        })();

        ctx.canvas.width = image.width;
        ctx.canvas.height = image.height;
        ctx.drawImage(image, 0, 0);
        ctx.globalCompositeOperation = "overlay";
        ctx.drawImage(coloredMask, 0, 0);

        const newImage = new Image();
        newImage.onload = () => resolve(newImage);
        newImage.src = ctx.canvas.toDataURL('image/png');
    });
}
