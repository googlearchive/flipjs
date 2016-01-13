/**
 * Copyright 2016 Google Inc. All rights reserved.
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

/* global TweenMax, TweenLite */

export default {

  /**
   * Sets up the animation to use <code>requestAnimationFrame</code>
   *
   * @private
   * @param {Number} startTime - The start time to use for coordinating multiple
   *  FLIP animations.
   */
  play_: function (startTime) {

    let start = (startTime || window.performance.now()) / 1000;
    let tweenLiteAvailable = (typeof 'TweenLite' !== 'undefined');
    let tweenMaxAvailable = (typeof 'TweenMax' !== 'undefined');
    let tween = null;

    if (tweenMaxAvailable)
      tween = TweenMax;
    else if (tweenLiteAvailable)
      tween = TweenLite;
    else
      throw new Error('GSAP requested, but TweenMax/Lite not available.');

    let options = {
      ease: this.easing_,
      onComplete: this.cleanUpAndFireEvent_.bind(this)
    };

    if (this.updateTransform_) {
      Object.assign(options, {
        scaleX: 1,
        scaleY: 1,
        x: 0,
        y: 0});
    }

    if (this.updateOpacity_) {
      Object.assign(options, {
        opacity: this.last_.opacity
      });
    }

    let elTween = new tween(this.element_, this.duration_ / 1000, options);
    elTween.startTime(start + (this.delay_ / 1000));
  }
};
