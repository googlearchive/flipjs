'use strict';


function once (element, type, handler) {
  let off;
  const proxy = e => {
    if (e.target !== element) return;
    handler(e);
    off();
  };

  off = () => element.removeEventListener(type, proxy);
  element.addEventListener(type, proxy);
  return off;
}


export default {

  /**
   * Sets up the animation to use <code>CSS transitions</code>
   *
   * @private
   */
  play_ () {
    if (typeof this.easing_ === 'function') {
      throw new Error(
        'The CSS player does not support passing easing as a function.' +
        ' Expected a string or an array of cubic-bezier control points.'
      );
    }
    if (Array.isArray(this.easing_))
      this.easing_ = `cubic-bezier(${this.easing_.join(',')})`;

    const transitions = [];
    if (this.updateTransform_)
      transitions.push('transform');
    if (this.updateOpacity_)
      transitions.push('opacity');

    this.element_.offsetLeft; // pliz brawzer recalc stylz !

    this.element_.style.transitionProperty = transitions.join(',');
    this.element_.style.transitionTimingFunction = this.easing_;
    this.element_.style.transitionDuration = `${this.duration_}ms`;
    this.element_.style.transitionDelay = `${this.delay_}ms`;

    const cleanup = () => {
      this.element_.style.transitionDuration = '';
      this.element_.style.transitionTimingFunction = '';
      this.element_.style.transitionProperty = '';
      this.element_.style.transitionDelay = '';
      this.element_.classList.remove('flip-animating');
      this.cleanUpAndFireEvent_();
    };

    // Use CSS Transitions Level 2 events if available.
    // https://drafts.csswg.org/css-transitions-2/#transition-events
    once(this.element_, 'transitionstart', () => {
      this.start_ = window.performance.now();
    });
    once(this.element_, 'transitionend', cleanup);
    once(this.element_, 'transitioncancel', cleanup);

    requestAnimationFrame(() => {
      this.start_ = window.performance.now() + this.delay_;
      this.element_.classList.add('flip-animating');
      if (this.updateTransform_)
        this.element_.style.transform = '';
      if (this.updateOpacity_)
        this.element_.style.opacity = '';
    });
  }
};
