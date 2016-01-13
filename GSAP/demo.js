/**
 *
 * Copyright 2015 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global FLIP, Bounce */

'use strict';

var target = document.querySelector('.target');

target.addEventListener('click', function () {

  // Set up the FLIP, using GSAP and the Bounce easeOut easing function.
  var flip = new FLIP({
    element: target,
    duration: 2000,
    easing: Bounce.easeOut,
    play: 'GSAP'
  });

  // First position & opacity.
  flip.first();

  // Apply the 'end' class and snapshot the last position & opacity.
  flip.last('end');

  // Move and fade the element back to the original position.
  flip.invert();

  // Play it forwards.
  flip.play();
});
