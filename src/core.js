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

/**
 * Helper class for FLIP animations. FLIP is an approach to animations that
 * takes remaps animating expensive properties, like width, height, left and top
 * to significantly cheaper changes using transforms. It does this by taking two
 * snapshots, one of the element's First position (F), another of its Last
 * position (L). It then uses a transform to Invert (I) the element's changes,
 * such that the element appears to still be in the First position. Lastly it
 * Plays (P) the animation forward by removing the transformations applied in
 * the Invert step.
 *
 * @see https://aerotwist.com/blog/flip-your-animations
 * @author paullewis
 */
export default class FLIP {

  /**
   * Returns the library version.
   *
   * @static
   * @returns {String} The library version as a String.
   */
  static get version () {
    return '@VERSION@';
  }

  /**
   * Extends FLIP to be able to play. Allows for the use of libraries when it
   * comes to playback. The functions in the player object are all copied and
   * bound to the instance of the FLIP Helper on instantiation.
   *
   * @param {String} name - The name of the player, e.g. <code>'rAF'</code>.
   * @param {Object} player - The object with the playback functions.
   * @param {Function} player.play_ - The playback function to use.
   */
  static extend (name, player) {

    if (typeof this.players_ === 'undefined')
      this.players_ = {};

    if (typeof this.players_[name] !== 'undefined')
      console.warn(`Player with name ${name} already exists`);

    if (typeof player.play_ === 'undefined')
      console.warn('Player does not contain a play_() function');

    this.players_[name] = player;
  }

  /**
   * @typedef FlipGroup
   * @type Object
   * @property {Array} flips_ - The FLIP helpers.
   * @property {Function} first - Calls <code>first()</code> against all
   *  FLIP helpers.
   * @property {Function} last - Calls <code>last()</code> against all
   *  FLIP helpers.
   * @property {Function} invert - Calls <code>invert()</code> against all
   *  FLIP helpers.
   * @property {Function} play - Calls <code>play()</code> against all
   *  FLIP helpers.
   * @property {Function} addClass - Adds a class to all elements in the group.
   * @property {Function} removeClass - Removes a class from all elements in
   *  the group.
   */

  /**
   * Creates a group of FLIP helpers, usually used when you want to have some
   * form of composite animation, with related but visually independent
   * elements.
   *
   * @static
   * @returns {FlipGroup} An object which has the same API as an individual FLIP
   *  helper, but controls the group as a whole.
   */
  static group (flips) {

    if (!Array.isArray(flips))
      throw new Error ('group() expects an array of objects.');

    // Wrap each in a FLIP helper.
    flips = flips.map(flip => new FLIP(flip));

    return {

      flips_: flips,

      addClass: (className) => {
        flips.forEach(flip => flip.addClass(className));
      },

      removeClass: (className) => {
        flips.forEach(flip => flip.removeClass(className));
      },

      first: () => {
        flips.forEach(flip => flip.first());
      },

      last: (lastClassName) => {

        // To avoid layout thrashing apply all the classes up front
        // then do a second pass where last() is called.
        flips.forEach((flip, index) => {

          let className = lastClassName;

          if (Array.isArray(lastClassName))
            className = lastClassName[index];

          if (typeof className !== 'undefined')
            flip.element_.classList.add(className);

        });

        flips.forEach(flip => flip.last());
      },

      invert: () => {
        flips.forEach(flip => flip.invert());
      },

      play: (startTime) => {

        if (typeof startTime === 'undefined')
          startTime = window.performance.now();

        flips.forEach(flip => flip.play(startTime));
      }
    }
  }

  /**
   * Creates a new FLIP helper.
   *
   * @param {Object} config - The configuration for the helper.
   * @param {HTMLElement} config.element - The element on which to operate.
   * @param {Number} [config.duration=1000] - The duration of the animation
   *  in milliseconds.
   * @param {Function} [config.ease] - The easing function of the animation.
   * @param {Boolean} [config.transform=true] - Whether or not to animate
   *  transforms for the element.
   * @param {Boolean} [config.opacity=true] - Whether or not to animate opacity
   *  for the element.
   */
  constructor (options={}) {

    let defaults = {
      duration: 330,
      delay: 0,
      easing: function (t) { return t; },
      transform: true,
      opacity: true,
      play: 'rAF'
    };

    let config = Object.assign({}, defaults, options);

    if (typeof config.element === 'undefined')
      throw new Error('Element must be provided.');

    // If the easing property is not a function, check for a TweenMax/Lite style
    // object with a getRatio function, and, if that exists, use it, otherwise
    // throw an error.
    if (typeof config.easing !== 'function') {
      if (typeof config.easing.getRatio !== 'undefined') {
        config.easing = config.easing.getRatio;
      } else {
        throw new Error('Easing function must be provided.');
      }
    }

    this.element_ = config.element;
    this.first_ = {
      layout: null,
      opacity: 0
    };

    this.last_ = {
      layout: null,
      opacity: 0
    };

    this.invert_ = {
      x: 0, y: 0, sx: 1, sy: 1, a: 0
    };

    this.start_ = 0;
    this.duration_ = config.duration;
    this.delay_ = config.delay;
    this.easing_ = config.easing;
    this.updateTransform_ = config.transform;
    this.updateOpacity_ = config.opacity;

    let player = FLIP.players_[config.play];

    if (typeof player === 'undefined')
      throw new Error(`Unknown player type: ${config.play}`);

    // Take a copy of the player's functions and bind them on so that
    // they can be used by this FLIP Helper instance.
    let playerFunctions = Object.keys(player);
    let playerFunction;
    playerFunctions.forEach(fn => {
      playerFunction = player[fn];
      this[fn] = playerFunction.bind(this);
    });
  }

  /**
   * Convenience method to add a class to the element.
   * @param {string} className - The class name to add to the element.
   */
  addClass (className) {

    if (typeof className !== 'string')
      return;

    this.element_.classList.add(className);
  }

  /**
   * Convenience method to remove a class to the element.
   * @param {string} className - The class name to remove from the element.
   */
  removeClass (className) {

    if (typeof className !== 'string')
      return;

    this.element_.classList.remove(className);
  }

  /**
   * Convenience method that calls <code>first()</code>, <code>last()</code>,
   * and <code>invert()</code> immediately after each other.
   *
   * @param {string} [lastClassName] - The class name applied to the element
   *  that moves it to its final position.
   */
  snapshot (lastClassName) {
    this.first();
    this.last(lastClassName);
    this.invert();
  }

  /**
   * Snapshots the layout and opacity information for the element.
   */
  first () {
    this.first_.layout = this.element_.getBoundingClientRect();
    this.first_.opacity =
        parseFloat(window.getComputedStyle(this.element_).opacity);
  }

  /**
   * Applies the class that moves the element to its last position. It then
   * takes a snapshot of the element's final location and opacity.
   *
   * @param {string} [lastClassName] - The class name applied to the element
   *  that moves it to its final position.
   */
  last (lastClassName) {

    if (typeof lastClassName !== 'undefined')
      this.addClass(lastClassName);

    this.last_.layout = this.element_.getBoundingClientRect();
    this.last_.opacity =
        parseFloat(window.getComputedStyle(this.element_).opacity);
  }

  /**
   * Moves the element back to its start position, size, and opacity by applying
   * changes to its transform and opacity values.
   */
  invert () {

    let willChange = [];

    if (this.first_.layout === null)
      throw new Error ('You must call first() before invert()');

    if (this.last_.layout === null)
      throw new Error ('You must call last() before invert()');

    // Update the invert values.
    this.invert_.x = this.first_.layout.left - this.last_.layout.left;
    this.invert_.y = this.first_.layout.top - this.last_.layout.top;
    this.invert_.sx = this.first_.layout.width / this.last_.layout.width;
    this.invert_.sy = this.first_.layout.height / this.last_.layout.height;
    this.invert_.a = this.last_.opacity - this.first_.opacity;

    // Apply the transform.
    if (this.updateTransform_) {
      this.element_.style.transformOrigin = '0 0';
      this.element_.style.transform =
          `translate(${this.invert_.x}px, ${this.invert_.y}px)
           scale(${this.invert_.sx}, ${this.invert_.sy})`;

      willChange.push('transform');
    }

    if (this.updateOpacity_) {
      this.element_.style.opacity = this.first_.opacity;
      willChange.push('opacity');
    }

    this.element_.style.willChange = willChange.join(',');
  }

  /**
   * Plays the animation.
   *
   * @param {Number} [startTime] - The time the animation should start (using
   *  <code>window.performance.now</code> as the source of truth).
   */
  play (startTime) {

    if (this.invert_ === null)
      throw new Error('invert() must be called before play()');

    if (typeof this.play_ === 'undefined')
      throw new Error('No player specified.');

    this.play_(startTime);
  }

  /**
   * Fires an event on the element.
   *
   * @private
   * @param {String} eventName - The name of the event.
   * @param {} [detail=null] - The data to include in the event.
   * @param {Boolean} [bubbles=true] - Whether the event should bubble.
   * @param {Boolean} [cancelable=true] - Whether the event is cancelable.
   */
  fire_ (eventName, detail=null, bubbles=true, cancelable=true) {
    let evt = new CustomEvent(eventName, { detail, bubbles, cancelable });
    this.element_.dispatchEvent(evt);
  }

  /**
   * Clamps a value to min/max values.
   *
   * @param {Number} value - The value to clamp.
   * @param {Number} min=Number.NEGATIVE_INFINITY - The minimum value. Defaults
   *     to negative infinity.
   * @param {Number} max=Number.POSITIVE_INFINITY - The maximum value. Defaults
   *     to positive infinity.
   * @private
   */
  clamp_ (value, min=Number.NEGATIVE_INFINITY, max=Number.POSITIVE_INFINITY) {
    return Math.min(max, Math.max(min, value));
  }

  /**
   * Function to call to get rid of all the transforms, opacity, internal values
   * and fire an event for the FLIP completion.
   */
  cleanUpAndFireEvent_ () {
    this.removeTransformsAndOpacity_();
    this.resetFirstLastAndInvertValues_();
    this.fire_('flipComplete');
  }

  /**
   * Removes all transforms and opacity from the element. This should
   * stop side-effects if the element has fixed position children that
   * transition.
   *
   * @private
   */
  removeTransformsAndOpacity_ () {
    this.element_.style.transformOrigin = null;
    this.element_.style.transform = null;
    this.element_.style.opacity = null;
    this.element_.style.willChange = null;
  }

  /**
   * Reset the values held by first_, last_, and invert_.
   *
   * @private
   */
  resetFirstLastAndInvertValues_ () {
    this.first_.layout = null;
    this.first_.opacity = 0;

    this.last_.layout = null;
    this.last_.opacity = 0;

    this.invert_.x = 0;
    this.invert_.y = 0;
    this.invert_.sx = 1;
    this.invert_.sy = 1;
    this.invert_.a = 0;
  }
}
