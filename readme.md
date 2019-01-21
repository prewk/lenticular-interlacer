# Lenticular interlacer [![Build Status](https://travis-ci.org/prewk/lenticular-interlacer.svg?branch=master)](https://travis-ci.org/prewk/lenticular-interlacer) [![Coverage Status](https://coveralls.io/repos/github/prewk/lenticular-interlacer/badge.svg?branch=master)](https://coveralls.io/github/prewk/lenticular-interlacer?branch=master)

Interlaces raw pixel buffers from two or more images either horizontally or vertically for lenticular printing purposes.

```
╔═══════════╗     ╔═══════════╗     ╔═══════════╗
║###########║     ║///////////║     ║###########║
║###########║     ║///////////║     ║///////////║
║###########║  +  ║///////////║  =  ║###########║
║###########║     ║///////////║     ║///////////║
║###########║     ║///////////║     ║###########║
╚═══════════╝     ╚═══════════╝     ╚═══════════╝
```

### Raw pixel buffers

A raw pixel buffer is an image's pixels as a long list of flat channel data. 

```             
   2*2 px 3 channels      
╔═════════════════════╗   
║(255,0,0) (255,255,0)║   
║(64,64,0) (255,0,255)║
║(255,0,0) (255,255,0)║   
╚═════════════════════╝
= Buffer [255,0,0,255,255,0,64,64,0,255,0,255,255,0,0,255,255,0]   
```

## Installation

```
npm install lenticular-interlacer
```

## Usage

```js
const Interlacer = require('lenticular-interlacer');

// Construct an Interlacer instance
const interlacer = new Interlacer(
    60, // LPI - Lenses per inch
    600, // DPI - DPI in which it will be printed
    true // Orientation - horizontal/vertical: true/false
);

// Add an image to be interlaced
interlacer.push(
    myBuffer, // Raw pixel buffer
    3, // Number of channels (RGB = 3, RGBA = 4)
    200, // Image width
    100, // Image height 
);

// ...add another
interlacer.push(anotherBuffer, 3, 300, 300);

// Interlace
const {
    buffer,
    channels,
    width,
    height,
} = interlacer.interlace();
```

## Example

```js
const Interlacer = require('lenticular-interlacer');
const sharp = require('sharp');

// Source images:
// image1.jpg 400x400 RGB (3 channels)
// image2.png 500x500 RGBA (4 channels)

Promise.all([
    sharp('image1.jpg').raw().toBuffer(),
    sharp('image2.png').raw().toBuffer(),
])
    .then(([image1, image2]) => {
        const interlacer = new Interlacer(
            61,
            366,
            true
        );
        
        interlacer
            .push(image1, 3, 400, 400)
            .push(image2, 4, 500, 500);
        
        const { buffer, channels, width, height } = interlacer.interlace();
        
        // Produce a 400x400 RGB TIFF image in 366 DPI
        return sharp(buffer, { raw: { width, height, channels } })
            .tiff({
                // TIFF DPI is set in dots per mm
                xres: 366 / 2.54,
                yres: 366 / 2.54,
            })
            .toFile('output.tiff');
    });
```

## License
MIT
