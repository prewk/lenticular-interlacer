interface Image {
    buffer: Buffer;
    channels: number;
    width: number;
    height: number;
}

/**
 * Interlaces raw pixel buffers from multiple images into one suitable for lenticular printing purposes
 */
class Interlacer {
    images: Image[] = [];

    constructor(
        private lpi: number,
        private dpi: number,
        private horizontal: boolean
    ) {}

    /**
     * Add another image to be interlaced
     */
    public push(
        buffer: Buffer,
        channels: number,
        width: number,
        height: number
    ): this {
        this.images.push({
            buffer,
            channels,
            width,
            height
        });

        return this;
    }

    /**
     * Find the minimum dimensions possible
     */
    private getMVDimensions(): { width: number; height: number } {
        return this.images.reduce(
            (mvd, image) => {
                if (image.width < mvd.width) {
                    mvd.width = image.width;
                }
                if (image.height < mvd.height) {
                    mvd.height = image.height;
                }

                return mvd;
            },
            { width: Infinity, height: Infinity }
        );
    }

    /**
     * Extract one RGB pixel from a raw image buffer
     */
    private getRgbPixel(
        image: Image,
        x: number,
        y: number,
        fallback: [number, number, number]
    ): [number, number, number] {
        if (x >= image.width || y >= image.height) return fallback;

        const offset = y * (image.width * image.channels);

        return typeof image.buffer[offset + x * image.channels + 2] !==
            'undefined'
            ? [
                  image.buffer[offset + x * image.channels + 0],
                  image.buffer[offset + x * image.channels + 1],
                  image.buffer[offset + x * image.channels + 2]
              ]
            : fallback;
    }

    /**
     * Interlace the images into one
     */
    public interlace(): Image {
        const images = this.images;

        if (!images.length) {
            throw new Error('No images to interlace!');
        }

        let pointer = 0;

        /**
         * Cycle through the image buffers
         */
        const cycle = () => {
            pointer++;
            if (!images[pointer]) {
                pointer = 0;
            }
        };

        const { width, height } = this.getMVDimensions();
        const output: number[] = [];
        const lensThickness = this.dpi / (this.lpi * images.length);

        if (this.horizontal) {
            // Horizontal interlace
            for (let y = 0; y < height; y++) {
                if (y && y % lensThickness === 0) {
                    cycle();
                }

                const image = images[pointer];
                for (let x = 0; x < width; x++) {
                    output.push(
                        ...this.getRgbPixel(image, x, y, [255, 255, 255])
                    );
                }
            }
        } else {
            // Vertical interlace
            for (let y = 0; y < height; y++) {
                pointer = 0;

                for (let x = 0; x < width; x++) {
                    if (x && x % lensThickness === 0) {
                        cycle();
                    }

                    const image = images[pointer];
                    output.push(
                        ...this.getRgbPixel(image, x, y, [255, 255, 255])
                    );
                }
            }
        }

        return {
            buffer: Buffer.from(output),
            channels: 3,
            width,
            height
        };
    }
}

export default Interlacer;
