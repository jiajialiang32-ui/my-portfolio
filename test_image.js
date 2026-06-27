const fs = require('fs');
const PNG = require('pngjs').PNG;

fs.createReadStream('assets/Free pack/coin4_16x16.png')
  .pipe(new PNG())
  .on('parsed', function() {
    console.log(`width: ${this.width}, height: ${this.height}`);
    // find non transparent columns
    let cols = [];
    for (let x = 0; x < this.width; x++) {
        let hasPixel = false;
        for (let y = 0; y < this.height; y++) {
            let idx = (this.width * y + x) << 2;
            if (this.data[idx+3] > 0) {
                hasPixel = true; break;
            }
        }
        cols.push(hasPixel ? 1 : 0);
    }
    console.log(cols.join(''));
  });
