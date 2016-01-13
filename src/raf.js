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

'use strict';

export default {

  /**
   * Sets up the animation to use <code>requestAnimationFrame</code>
   *
   * @private
   * @param {Number} startTime - The start time to use for coordinating multiple
   *  FLIP animations.
   */
  play_: function (startTime) {

    if (typeof startTime === 'undefined')
      this.start_ = window.performance.now() + this.delay_;
    else
      this.start_ = startTime + this.delay_;

    requestAnimationFrame(this.update_);
  },

  /**
   * Updates the element's animation.
   *
   * @private
   */
  update_: function () {

    let time = (window.performance.now() - this.start_) / this.duration_;
    time = this.clamp_(time, 0, 1);
    let remappedTime = this.easing_(time);

    let update = {
      x: this.invert_.x * (1 - remappedTime),
      y: this.invert_.y * (1 - remappedTime),
      sx: this.invert_.sx + (1 - this.invert_.sx) * remappedTime,
      sy: this.invert_.sy + (1 - this.invert_.sy) * remappedTime,
      a: this.first_.opacity + (this.invert_.a) * remappedTime
    };

    if (this.updateTransform_) {
      this.element_.style.transform =
        `translate(${update.x}px, ${update.y}px)
         scale(${update.sx}, ${update.sy})`;
    }

    if (this.updateOpacity_) {
      this.element_.style.opacity = update.a;
    }

    if (time < 1) {
      requestAnimationFrame(this.update_);
    } else {
      this.cleanUpAndFireEvent_();
    }
  }
};
