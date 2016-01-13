# FLIP.js

A helper library for [FLIP animations](https://aerotwist.com/blog/flip-your-animations).

[![FLIP Demos](https://cloud.githubusercontent.com/assets/617438/12309072/8be03324-ba40-11e5-8f6c-0e5c04f87336.png)](http://googlechrome.github.io/flipjs/)

FLIP is an approach to animations that remaps animating expensive properties, like width, height, left and top to significantly cheaper changes using transforms. It does this by taking two snapshots, one of the element's **First** position (F), another of its **Last** position (L). It then uses a transform to **Invert** (I) the element's changes, such that the element appears to still be in the First position. Lastly it **Plays** (P) the animation forward by removing the transformations applied in the Invert step.

## Usage

You can use the FLIP helper on its own, like this:

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

### Using GSAP.

If you've already got [GSAP](http://greensock.com/gsap) in place, you may wish for it to handle playback. In which case, you can declare that in the config object:

```javascript
let flip = new FLIP({
  element: target,
  duration: 2000,
  play: 'GSAP'
});
```

### Specifying timing functions

You can either specify your own function, or, if you're using GSAP, you can use its easing functions:

```javascript
// Declare an easing function directly.
let flip = new FLIP({
  element: target,
  easing: function (t) {
    return t * t;
  }
});

// ... or declare an easing function from GSAP.
let flip = new FLIP({
  element: target,
  easing: Bounce.easeOut
});
```

## Documentation & Demos

  * [Demos](https://googlechrome.github.io/flipjs/) - There are more to make :)
  * [API docs](https://googlechrome.github.io/flipjs/docs/FLIP.html).

## New to FLIP?

For more background info take a look at [the FLIP intro](https://aerotwist.com/blog/flip-your-animations) post.

License: Apache 2.0 - See [/LICENSE](/LICENSE).

Author: paullewis.

Please note: this is not an official Google product.
