/**
 * FlashcardReview is a reusable flashcard review component. It handles communication
 * with the server (ajax), caching and prefetching of flashcard data, and the state of
 * the review session (forward, backward (undo), end). Also handles shortcut keys.
 * 
 * Presentation logic is handled by the "child" class, through events that are notified
 * by FlashcardReview's event dispatcher.
 * 
 * 
 * Public methods:
 * 
 *   initialize(oOptions)   Constructor, pass an options object:
 *
 *       items            An array of flashcard ids (REQUIRED)
 *       ajax_url         Url of ajax action to get/post flashcard data (REQUIRED)
 *       back_url         Http location to go to when review ends with no reviews
 *
 *       params           An associative array of parameters sent with every request
 *                        (maintains state of review options, OPTIONAL).
 *
 *       max_undo         Maximum undo/backward level
 *       num_prefetch     How many flashcards to fetch ahead
 *       events           An object with events to register (see notifications below)
 *         scope            Scope to use for the events (property, optional)
 *       put_request      Set to false if not posting any answers to the server. "onEndReview" will be
 *                        notified automatically after forward() has moved past the last item.
 *
 *   connect(sName, fnEvent [,scope])   Add a listener
 *   disconnect(sName)                  Remove a listener
 *   notify(sName[, args...])           Notify listeners
 *   
 *   addShortcutKey(sKey, sActionId)
 *                        Add a keyboard shortcut for an action, the action id is passed to 'onAction' notification
 *   
 * Methods to control the review session:
 *   
 *   beginReview()        Called automatically when FlashcardReview is instanced.
 *   endReview()          Ends review: flushes postCache to server, then notifies "onEndReview".
 *   forward()            Advance to next flashcard
 *   backward()           Go back one card (undo), notifies "onFlashcardUndo" event, with the last flashcard answer.
 *   
 * Methods to get/put information:
 *   
 *   getOption()          Returns one of the options as passed to initialize(), TODO: DEPRECATED (bad)
 *   getPosition()        Returns current index into the flashcard items array
 *   getFlashcard()       Returns current uiFlashcard, or null
 *   getFlashcardData()   Returns json data for current flashcard
 *   getItems()           Returns array of flashcard ids, length of array = number of flashcards in session
 *   getPostCount()       Returns count of flashcard answers that need to be posted to server
 *   getNumUndos()        Returns number of undo levels currently available
 *   getFlashcardState()  Returns the current state (0 = default), or false if no current card is set
 *   setFlashcardState(n) Sets state for current flashcard, this changes the "uiFcState" class name on the flashcard
 *   answerCard(oData)    Set data to post back to server as answer for current card.
 *                        This is not required if option "put_request" is false.
 * 
 * Notifications:
 * 
 *   onBeginReview        When review begins, during FlashcardReview initialization
 *   onEndReview          Notified when the last flashcard is answered and the post cache has been successfully handled by server
 *   onFlashcardCreate    A new flashcard is created, before json content is inserted into the card and it is shown.
 *                        Flashcard data is available and can be changed with getFlashcardData()
 *   onFlashcardState(n)  Called just after 'onFlashcardCreate' for default state 0, and then everytime the state
 *                         is set with setFlashcardState(). Argument n is the state number.
 *   onFlashcardDestroy   Before the current flashcard is destroyed
 *   onFlashcardUndo(o)   Called when user undo'es flashcard answer. Argument o is the answer data as it was passed
 *                        to answerCard(). Notified only if "put_request" is true (default).
 *   onAction(id, ev)     Called for clicks on elements with "uiFcAction-XYZ" class; where id is "XYZ"; as well as
 *                        keyboard shortcuts set with addShortcutKey(). This listener must explicitly return false
 *                        to stop event from propagating (ev is the event object).
 * 
 * Ajax RESPONSE format (in Json):
 * 
 *   get                  Array of flashcard data, one object for each id that came in request.
 *                        Properties that match elements of class "fcData-xxx" where xxx is the property name,
 *                        are automatically loaded into the element (innerHTML, html allowed), other properties
 *                        may be used by the peer class.
 *                        Returned objects must have the property "id" set to the corresponding flashcard id's.
 *   put                  Integer, should return the same number as flashcard answers that were posted to the server.
 *                        The same number of items are cleared from the postCache. If not cleared, these items will
 *                        be posted again during the next prefetchs.
 * 
 * Flashcard markup:
 *
 *   <span class="fcData fcData-xxx">...</span>
 *
 *   Elements with fcData class have their inner html content set with the xxx property of
 *   the flashcard data in the Ajax responses.
 *
 * Usage:
 * 
 *   #uiFcAjaxLoading
 *     => div with "Loading..." message shown during Ajax request.
 *   #uiFcAjaxError  
 *     => div that shows for ajax errors, or server errors, span.msg is set to error message.
 *   DIV.uiFcCard
 *     => the flashcard container
 *   .uiFcState-N
 *     => the flashcard state, where N is a number, 0 is the default state, use with css rules to set
 *        visibility of various information on the card depending on state (eg. 0 = question, 1 = answer)
 *     
 *   a.uiFcAction-XXXX
 *     Links that trigger an action (answer buttons), calls event "onAction" with "XXXX" as second argument
 * 
 * 
 * REFACT0R:
 * - initializeActionEvents: use event delegation! use yui code.
 * - refactor the whole bloody thing to YUI or other and remove the old Prototype code
 * - create a simple ajax queueing class (only when refactored to yui 2), solves
 *
 *
 * @author   Fabrice Denis
 */

/*global YAHOO, window, alert, console, document, Core, App */

/**
 * 
 * 
 */

(function(){
  
  App.Ui.FlashcardReview = Core.make();

  var Y = YAHOO,
      Dom = Y.util.Dom,
      Event = Y.util.Event;

  App.Ui.FlashcardReview.prototype =
  {
    // flashcard selection as an array of flashcard ids
    items: null,

    // review position, from 0 to items.length-1
    position: null,
    
    // Cache of flashcard data.
    // Associative array using flashcard ids for retrieval.
    // Flashcard data is maintained for prefetched items and max_undo items,
    // other cards are deleted when they are beyond the undo range.
    //
    // cacheStart and cacheEnd indicate the range of valid flashcard data
    // in the cache array.
    cache: null,
    cacheStart: null,
    cacheEnd: null,

    // the next position at which to prefetch new flashcard data
    // is recalculated on server reply, based on number of items server returned
    prefetchPos: null,

    // max items to cache for undo
    max_undo: null,
    // current undo level (number of steps backward)
    undoLevel: null,
    
    // how many items to preload
    num_prefetch: null,
    
    // event dispatcher for notifications
    eventDispatcher: null,
    
    // array of answer data for flashcards that is not posted yet
    // the data is freeform, the property id corresponds to a flashcard id
    postCache: null,
    
    // uiAjaxQueue instance
    ajaxQueue: null,

    /**
     * Initialize the front end Flashcard Review component.
     * 
     * @param {Object} options
     */  
    init: function(oOptions)
    {
      Core.log('FlashcardReview::init()');

      // set options and fix defaults
      this.options = oOptions;
      this.options.max_undo = oOptions.max_undo || 3;
      this.options.num_prefetch = oOptions.num_prefetch || 10;
      this.options.put_request = oOptions.put_request===false ? false : true;

      // set options and make proxies
      this.items        = this.options.items;
      this.max_undo     = this.options.max_undo;
      this.num_prefetch = this.options.num_prefetch;
      
      // 
      if (!this.items || !this.items.length) {
        alert("No flashcard items in this selection.");
        return;
      }

      // register listeners
      this.eventDispatcher = new Core.Ui.EventDispatcher();
      var scope = oOptions.events.scope;
      for (var sEvent in oOptions.events) {
        this.eventDispatcher.connect(sEvent, oOptions.events[sEvent], scope);
      }

      // init ajax
      this.ajaxQueue = new Core.Ui.AjaxQueue({
        elError:    'uiFcAjaxError', 
        elLoading:  'uiFcAjaxLoading',
        events:     {
          onSuccess: Core.bind(this.onAjaxSuccess, this)
        }
      });

      // buttons and other custom actions
      var ed = App.getBodyED();
      ed.on('uiFcAction', this.onActionEvent, this);

      // initialize shortcuts and keyboard handler
      this.oKeyboard = new Core.Ui.Keyboard();

      // 
      this.postCache = [];
      this.undoLevel = 0;
      
      
      this.curCard  = null;
  //    this.ofs_prefetch = Math.floor(this.num_prefetch);
      
      this.beginReview();
    },

    /**
     * Add or remove onbeforeunload event to warn user of loosing
     * flashcard answers.
     * 
     */
    updateUnloadEvent: function()
    {
      
      if (this.getPostCount()) {
        window.onbeforeunload = function()
        {
          return "WAIT! You may lose a few flashcard answers if you leave the page now.\r\n" +
                 "Select CANCEL to stay on this page, and then click the END button to\r\n" +
                 "complete this review session.";
        };
      }
      else {
        window.onbeforeunload = null;
      }
      
    },
    
    /**
     * The event listener bound to html elements that use "uiFcAction-XXX" class names. 
     * 
     * Makes sure to stop the mouse click event, to prevent page from jumping.
     * 
     * @param  {Object}      ev   Event object
     * @param  {HTMLElement} el   Matched element
     */
    onActionEvent: function(ev, el)
    {
      var data   = Dom.getDataset(el),
          action = data.action;
      Core.assert(!!data.action, 'onActionEvent() bad "action" attribute, element %o', el);

      return (false !== this.notify('onAction', action, ev));
    },

    /**
     * Core.Ui.EventDispatcher proxy.
     * 
     * @see Core.Ui.EventDispatcher, scope is optional.
     */
    connect: function(sName, fnEvent, scope)
    {
      this.eventDispatcher.connect(sName, fnEvent, scope);
    },

    disconnect: function(sName, fnEvent)
    {
      this.eventDispatcher.disconnect(sName, fnEvent);
    },

    notify: function()
    {
      return this.eventDispatcher.notify.apply(this.eventDispatcher, arguments);
    },

    beginReview: function()
    {
      this.notify('onBeginReview');
      
      this.position    = -1;
      this.cache       = {};
      this.cacheStart  = 0;
      this.cacheEnd    = -1;
      this.cacheNext   = -1;
      this.prefetchPos = 0;    // when to prefetch new cards, updated by each ajax response
      
      this.forward();
    },

    /**
     * Go back to previous page if no cards were answered yet,
     * otherwise flush post cache and notify review end.
     * 
     */
    endReview: function()
    {
      if (this.position <= 0)
      {
        // redirect to back_url
        if (this.options.back_url)
        {
          window.location.href = this.options.back_url;
          return;
        }
        else
        {
          return;
        }
      }

      // clear last card from display
      this.destroyCurCard();
     
      if (this.options.put_request)
      {
        // flush post cache and will notify end of review on ajax response
        this.sendReceive(true);
      }
      else
      {
        // notify end of review here because there is nothing to post
        this.notify('onEndReview');
      }
    },

    forward: function()
    {
      this.position++;

      if (this.undoLevel > 0) {
        this.undoLevel--;
      }

      // destroy previous card, so it doesn't show while loading next card (if not prefetched)
      this.destroyCurCard();

      // all cards done?
      if (this.position >= this.items.length)
      {
        this.endReview();
        return;
      }

      // wait for card data
      this.connect('onWaitCache', this.cardReady, this);

      this.sendReceive();

      // clear backwards cache
      this.cleanCache();

      // if card is already prefetched, handle it!
      if (this.cacheEnd >= this.position)
      {
        this.cardReady();
      }
    },
    
    /**
     * Undo (go backwards)
     * 
     * To allow undo we always keep a number of answers in the postCache (max_undo).
     * When sendReceive() does a prefetch, only the answers that are before max_undo items
     * backwards are posted. Only at the end of the review are the last answers in the
     * "ungo range" flushed out to the server.
     * 
     */
    backward: function()
    {
      // assertion
      if (this.undoLevel >= this.max_undo) {
        throw new Error("FlashcardReview::backward() undoLevel >= max_undo");
      }

      if (this.position <= 0) {
        return;
      }

      // assertion
      if (this.cacheStart >= this.position) {
        throw new Error("FlashcardReview::backward() on empty cache");
      }

      this.destroyCurCard();
      this.undoLevel++;

      // go back one step and clear postCache at that position
      this.position--;

      // clear the last flashcard answer from the postCache
      if (this.options.put_request) {
        this.notify('onFlashcardUndo', this.unanswerCard());
      }
   
      this.cardReady();
    },

    /**
     * This function is called only when the current flashcard
     * data is available in the cache.
     */
    cardReady: function()
    {
      // clear event
      this.disconnect('onWaitCache');

      // we have a cached item for current position
      var oItem = this.getFlashcardData();

      this.curCard = new App.Ui.Flashcard(this);
      this.notify('onFlashcardCreate');
      this.curCard.setContent(oItem);
      this.setFlashcardState(0);
      this.curCard.display(true);
    },

    /**
     * Clears current flashcard, so that it disappears
     * until the next one is ready.
     */
    destroyCurCard: function()
    {
      if (this.curCard) {
        this.notify('onFlashcardDestroy');
        this.curCard.destroy();
        this.curCard = null;
      }
    },

    /**
     * Check if there are cards to prefetch, and/or answers to post.
     * 
     * @param boolean  bFlushData  At end of review, force flush all remaining items in postCache.
     */
    sendReceive: function(bFlushData)
    {
      var oJsonData = {};

      // any cards to fetch ?
      if ((this.cacheEnd < this.items.length - 1) && (this.position >= this.prefetchPos))
      {
        //
        if (this.cacheNext <= this.cacheEnd)
        {
          var from = this.cacheEnd + 1;
          var to   = Math.min(from + this.num_prefetch, this.items.length) - 1;
          oJsonData.get = this.items.slice(from, to + 1);
          this.cacheNext = from;
        }
      }

      // post answers along with cards prefetching, or do it immediately if flushing
      // the postCache
      if (this.options.put_request && (oJsonData.get || bFlushData))
      {
        // if flush, post all, otherwise don't post all, leave some cards behind to allow client ot re-answer (undo)
        var aPostData, i, numToPost = 0; 

        if (bFlushData)
        {
          aPostData = this.postCache;
        }
        else
        {
          numToPost = this.getPostCount() > this.max_undo ? this.getPostCount() - this.max_undo : 0;
          aPostData = [];
          for (i = 0; i < numToPost; i++)
          {
            aPostData.push(this.postCache[i]);
          }
        }
        
        if (aPostData.length > 0) 
        {
          //Core.log('POSTING %d (%o)', numToPost, aPostData);
          oJsonData.put = aPostData;
        }
        
        //simulate a timeout
        //if (bFlushData && !this.foo ) { this.foo=true; oJsonData.flush = 1; console.log('doing it'); }
      }

      Core.log('FlashcardReview::sendReceive(%o)...', oJsonData);

      if (oJsonData.get || oJsonData.put)
      {
        if (oJsonData.get && this.options.params)
        {
          // pass the flashcard options, if provided
          oJsonData.opt = this.options.params;
        }

        this.ajaxQueue.add(this.options.ajax_url,
        {
          method:     "post",
          json:       oJsonData,
          argument:   bFlushData ? 'end' : this.cacheNext
        });
        this.ajaxQueue.start();

        return true;
      }
      
      return false;
    },

    /**
     * AjaxQueue success callback (HTTP 200 only).
     *
     * Cache items returned by the server,
     * determine next position to start prefetch based on how many items were received.
     * 
     * @param {Object} o    The YUI Connect object (extended by AjaxRequest)
     * @param {Number} argument        Index value if prefetching, 'end' if completing review
     */
    onAjaxSuccess: function(o, argument)
    {
      var i, oJson = o.responseJSON;

      Core.log('FlashcardReview::onAjaxSuccess(%o)', o);

      if (oJson)
      {
        // cache cards if any
        if (oJson.get && oJson.get.length > 0)
        {
          // assertion
          if (argument !== this.cacheNext)
          {
            Core.halt("onAjaxSuccess(): this.cacheNext inconsistency");
          }

          // add cards to cache
          this.cacheEnd = this.cacheNext + oJson.get.length - 1;
          
          // next prefetch at based on number of items received
          this.prefetchPos = this.cacheNext + Math.floor(oJson.get.length/2) + 1;
      
          // cache items
          for (i = 0; i < oJson.get.length; i++)
          {
            this.cacheItem(oJson.get[i]);
          }
          
          this.notify('onWaitCache');
        }
        
        // clear answers from cache, that were handled succesfully by the server
        if (oJson.put && oJson.put.length > 0)
        {
          // clear items from the postCache that were succesfully handled
          //Core.log("RESPONSE PUT, CLEAR %o", oJson.put);

          for (i = 0; i < oJson.put.length; i++)
          {
            var id = oJson.put[i];
            this.removePostData(id);
          }
          
          this.updateUnloadEvent();          
        }

        // completing review
        if (argument === 'end')
        {
          this.notify('onEndReview');
        }
      }
    },

    cacheItem: function(oItem)
    {
      this.cache[oItem.id] = oItem;
    },

    /**
     * Clear flashcard display data for items behind, to free some
     * resources, we only need as much flashcard data behind as needed
     * for undo.
     * 
     */
    cleanCache: function()
    {
      while (this.cacheStart < this.position - this.max_undo)
      {
        var id = this.items[this.cacheStart];
        delete this.cache[id];
        this.cacheStart++;
      }
    },

    /**
     * Getters
     */
    getOption: function(sName)
    {
      return this.options[sName];
    },

    getPosition: function()
    {
      return this.position;
    },

    getFlashcard: function()
    {
      return this.curCard;
    },

    getFlashcardData: function()
    {
      var id = this.items[this.position];
      return id ? this.cache[id] : null;
    },

    /**
     * Count numner of items in postCache.
     */
    getPostCount: function()
    {
      return this.postCache.length;
    },
    
    getNumUndos: function()
    {
      return Math.min(this.position, this.max_undo - this.undoLevel);
    },
    
    getItems: function()
    {
      return this.items;
    },

    setFlashcardState: function(iState)
    {
      if (this.curCard) {
        this.curCard.setState(iState);
      }
    },
    
    getFlashcardState: function()
    {
      return this.curCard ? this.curCard.getState() : false;
    },

    /**
     * Register a shortcut key for an action id. Pressing the given key
     * will notify 'onAction' with the given action id. Lowercase letters will match
     * the uppercase letter.
     * 
     * @param {String} sKey  Shortcut key, should be lowercase, or ' ' for spacebar
     * @param {String} sActionId  Id passed to the 'onAction' event when key is pressed
     */
    addShortcutKey: function(sKey, sActionId)
    {
      if (!this.eventDispatcher.hasListeners('onAction'))
      {
        Core.warn('FlashcardReview::addShortcutKey() Adding shortcut key without "onAction" listener');
      }

      this.oKeyboard.addListener(sKey, Core.bind(this.shortcutKeyListener, this, sActionId));
    },

    shortcutKeyListener: function(oEvent, sActionId)
    {
      Core.log('FlashcardReview::shortcutKeyListener("%s")', sActionId);
      this.notify('onAction', sActionId, oEvent);
    },

    /**
     * Store answer and any other custom data for the current card,
     * to be posted on subsequent ajax requests.
     * 
     */
    answerCard: function(oData)
    {
      Core.log('FlashcardReview::answerCard(%o)', oData);
      this.postCache.push(oData);

      this.updateUnloadEvent();
    },

    /**
     * Cleans up the answer of current flashcard (when going backwards).
     *
     * Must remove item from postCache otherwise when flushing at end of review,
     * the last undo'ed item(s) would be posted whereas the user did not want to.
     * 
     * @return  {Object}   Returns flashcard answer data (cf. answerCard()) that is being cleared
     */
    unanswerCard: function()
    {
      Core.log('FlashcardReview::unanswerCard()');
      var id, oData;

      if (this.getPostCount()<=0)
      {
        throw new Error();
      }
      
      // pop data from the postcache, don't assume order
      id = this.items[this.position];
      oData = this.removePostData(id);

      this.updateUnloadEvent();
      
      return oData;
    },

    /**
     * Remove one element of the postCache array, by id.
     *
     * @return {Object}  Returns the spliced element (flashcard answer data).
     */
    removePostData: function(id)
    {
      var i;
      for (i = 0; i < this.postCache.length; i++)
      {
        // watchout with === because returned json can have strings for numbers
        if (this.postCache[i].id === id)
        {
          var popped = this.postCache.splice(i, 1);

          // return the 'popped' element
          return popped[0];
        }
      }
    }
    
  };


  /**
   * uiFlashcard handles display of a flashcard and its contents.
   * 
   */
  App.Ui.Flashcard = Core.make();

  App.Ui.Flashcard.prototype =
  {
    init: function(oReview)
    {
      Core.log('uiFlashcard::initialize()');

      // FlashcardReview parent object
      this.oFR = oReview;
      this.elFlashcard = Dom.down(document.body, 'uiFcCard', 'div');
    },

    setContent: function(cardData)
    {
      Core.log('uiFlashcard::setContent(%o)', cardData);
      
      var i, elems = Dom.getElementsByClassName('fcData', null, this.elFlashcard);
      
      for (i = 0; i < elems.length; i++)
      {
        if (/fcData-(\w+)/.test(elems[i].className))
        {
          var sProp = RegExp.$1;
          elems[i].innerHTML = cardData[sProp] || '';
        }
      }      
    },

    /**
     * Sets the current flashcard state with a class applied to the
     * flashcard container element. This class can be used by css rules
     * to set visible or hidden status of flashcard information.
     * 
     * @param {Number} iState
     */
    setState: function(iState)
    {
      var aClassNames = this.elFlashcard.className.replace(/uiFcState-\w+/, '').split(/\s+/);
      var sClass = 'uiFcState-' + iState;
      aClassNames.push(sClass);
      this.elFlashcard.className = aClassNames.join(' ');

      this.iState = iState;
      
      this.oFR.notify('onFlashcardState', iState);
    },

    getState: function()
    {
      return this.iState;
    },

    display: function(bDisplay)
    {

      // mobile view support
      if (window.innerWidth <= 700)
      {
        if (!App.Ui.resizedCard)
        {
          App.Ui.resizedCard = 0;
        }

        if (bDisplay)
        {
    //alert(App.Ui.resizedCard);
          var wh = window.innerHeight; //document.documentElement.
          if (parseInt(wh))
          {
            var cardh = wh - (43+37+67);
            if (/*App.Ui.resizedCard === 0 &&*/ cardh > 150)
            {
              App.Ui.resizedCard = cardh;
              Dom.setStyle(this.elFlashcard, 'height', cardh+'px');
  Core.log("@@@ resized card to "+cardh);
            }
          }
        }
      }

      //Core.log('uiFlashcard::display(%o)', bDisplay);
      Dom.toggle(this.elFlashcard, bDisplay);

      // CSS3 animation
      // var that = this;
      // window.setTimeout(function(){ Dom.addClass(that.elFlashcard, 'JsPlayCardIn'); }, 10);

    },
    
    /**
     * Cleanup events, hide the flashcard, reset html template
     * 
     */
    destroy: function()
    {
    //  Core.log('uiFlashcard::destroy()');
      Dom.removeClass(this.elFlashcard, 'JsPlayCardIn');
      this.display(false);
    }
  };

}());

