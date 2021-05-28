/**
 * EventCache keeps track of events and allows to clear them all at once
 * when the object is destroyed.
 *
 * Uses:
 * - Clearing events fixes a memory leak in old versions of IE.
 * - It is useful for ajax components, by clearing the events the content
 *   can be rendered more or less disabled until it is replaced with the result
 *   of an ajax call.
 *
 * Methods:
 *   init(sDebug)
 *   addEvent(element, sEventType, fnEventHandler);
 *   destroy()
 *
 * Examples:
 *   this.evtCache = new EventCache();
 *   this.evtCache.addEvent(elem, 'click', this.clickEvent.bind(this));
 *
 */
import * as Core from "@old/core";

let EventCache = Core.make();

EventCache.prototype = {
  sId: null,

  eCache: null,

  init: function (sId) {
    this.sId = sId || "";
    this.eCache = [];
  },

  addEvent: function (target, type, listener) {
    target.addEventListener(type, listener);
    this.eCache.push({ target, type, listener });
  },

  /**
   * Bind multiple events to one event handler function.
   *
   * @param {Object} element
   * @param {Object} aEventTypes   An array of event types
   * @param {Object} fn
   */
  addEvents: function (element, aEventTypes, fn) {
    var i;
    for (i = 0; i < aEventTypes.length; i++) {
      this.addEvent(element, aEventTypes[i], fn);
    }
  },

  destroy: function () {
    if (this.eCache) {
      // uiConsole.log('uiEventCache.destroy('+this.sId+') '+this.eCache.length+' events');
      for (var i = this.eCache.length - 1; i >= 0; i--) {
        var evt = this.eCache[i];
        evt.target.removeEventListener(evt.type, evt.listener);
      }
      // free up references to the elements
      this.eCache = [];
    }
  },
};

export default EventCache;
