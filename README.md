# FLIP.js

A helper library for FLIP animations.

FLIP is an approach to animations that remaps animating expensive properties, like width, height, left and top to significantly cheaper changes using transforms. It does this by taking two snapshots, one of the element's **First** position (F), another of its **Last** position (L). It then uses a transform to **Invert** (I) the element's changes, such that the element appears to still be in the First position. Lastly it **Plays** (P) the animation forward by removing the transformations applied in the Invert step.

## Usage

```javascript
let flip = new FLIP({
  element: target,
  duration: 2000
});

// First position & opacity.
flip.first();

// Apply the 'end' class and snapshot the last position & opacity.
flip.last('end');

// Move and fade the element back to the original position.
flip.invert();

// Play it forwards.
flip.play();
```

## Documentation

You can find the full breakdown in the [https://googlechrome.github.io/flipjs](API docs).

## New to FLIP?

For more see [https://aerotwist.com/blog/flip-your-animations](the FLIP intro).

License: Apache 2.0 - See [/LICENSE](/LICENSE)
Author: paullewis
Please note: this is not an official Google product.
