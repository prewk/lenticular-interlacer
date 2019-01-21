const pixels = (times: number, rgb: number[]): number[] => {
    const out = [];
    for (let i = 0; i < times; i++) {
        out.push(...rgb);
    }
    return out;
};

describe('Interlacer', () => {
    it('should vertically interlace 2 images', () => {
        const Interlacer = require('../interlacer').default;

        const interlacer = new Interlacer(1, 2, false);

        // Add a 5x5 image with 4 channels
        interlacer.push(
            Buffer.from([
                ...pixels(5, [255, 0, 0, 255]),
                ...pixels(5, [128, 0, 0, 255]),
                ...pixels(5, [64, 0, 0, 0]),
                ...pixels(5, [32, 0, 0, 0]),
                ...pixels(5, [16, 0, 0, 0])
            ]),
            4,
            5,
            5
        );

        // Add a 4x4 image with 3 channels
        interlacer.push(
            Buffer.from([
                ...pixels(4, [0, 255, 0]),
                ...pixels(4, [0, 128, 0]),
                ...pixels(4, [0, 64, 0]),
                ...pixels(4, [0, 32, 0])
            ]),
            3,
            4,
            4
        );

        const results = interlacer.interlace();

        expect(Array.from(results.buffer)).toEqual([
            ...[255, 0, 0],
            ...[0, 255, 0],
            ...[255, 0, 0],
            ...[0, 255, 0],
            ...[128, 0, 0],
            ...[0, 128, 0],
            ...[128, 0, 0],
            ...[0, 128, 0],
            ...[64, 0, 0],
            ...[0, 64, 0],
            ...[64, 0, 0],
            ...[0, 64, 0],
            ...[32, 0, 0],
            ...[0, 32, 0],
            ...[32, 0, 0],
            ...[0, 32, 0]
        ]);
    });

    it('should horizontally interlace 2 images', () => {
        const Interlacer = require('../interlacer').default;

        const interlacer = new Interlacer(1, 2, true);

        // Add a 5x5 image with 4 channels
        interlacer.push(
            Buffer.from([
                ...pixels(5, [255, 0, 0, 255]),
                ...pixels(5, [128, 0, 0, 255]),
                ...pixels(5, [64, 0, 0, 0]),
                ...pixels(5, [32, 0, 0, 0]),
                ...pixels(5, [16, 0, 0, 0])
            ]),
            4,
            5,
            5
        );

        // Add a 4x4 image with 3 channels
        interlacer.push(
            Buffer.from([
                ...pixels(4, [0, 255, 0]),
                ...pixels(4, [0, 128, 0]),
                ...pixels(4, [0, 64, 0]),
                ...pixels(4, [0, 32, 0])
            ]),
            3,
            4,
            4
        );

        const results = interlacer.interlace();

        expect(Array.from(results.buffer)).toEqual([
            ...pixels(4, [255, 0, 0]),
            ...pixels(4, [0, 128, 0]),
            ...pixels(4, [64, 0, 0]),
            ...pixels(4, [0, 32, 0])
        ]);
    });
});
