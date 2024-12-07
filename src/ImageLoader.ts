/* eslint-disable-next-line @typescript-eslint/no-extraneous-class */
export class ImageLoader {
    private static cache: Record<string, HTMLImageElement> = {};

    public static get(url: string): HTMLImageElement {
        if (ImageLoader.cache[url]) {
            return ImageLoader.cache[url];
        }
        const image = new Image();
        ImageLoader.cache[url] = image;
        image.src = url;
        return image;
    }
}
