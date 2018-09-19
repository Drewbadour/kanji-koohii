/**
 * SharedStoriesComponent
 * 
 * @author  Fabrice Denis
 */
/*global YAHOO, window, alert, console, document, Core, App, Koohii */

(function(){

  App.Ui.SharedStoriesComponent = Core.make();

  var Y = YAHOO,
      Dom = Y.util.Dom,
      Event = Y.util.Event,
      SharedStoriesComponent = App.Ui.SharedStoriesComponent;

  // css class names
  var SHAREDSTORY_CLASS    = "sharedstory",
      FAVOURITE_STORIES_ID = "sharedstories-top",
      SHARED_STORIES_ID    = "sharedstories-fav",
      HIDE_CLASS           = 'is-moderated';


  SharedStoriesComponent.prototype =
  {
    /**
     *
     * @param  {Object}  oStudyPage   StudyPage
     * @param  {HTMLElement}  elContainer   Main div
     */
    init: function(oStudyPage, elContainer)
    {
      this.oStudyPage = oStudyPage;

      // handling of votes, etc
      this.evtDel = new Core.Ui.EventDelegator(elContainer, "click");
      this.evtDel.on('JsNewest', this.onNewestClick, this);
      this.evtDel.on('JsCopy',   this.onCopy, this );
      this.evtDel.on('JsReport', this.onReport, this );
      this.evtDel.on('JsStar',   this.onStar, this );

      // link that unhide most reported stories
      this.evtDel.on('JsUnhide', this.onUnhide, this);

      // handling of the stories paging
      var shaddapJSHint = new Core.Widgets.AjaxTable('SharedStoriesListComponent', { errorDiv: 'SharedStoriesError' });
    },

    onUnhide: function(ev, el)
    {
      if (ev.type === "click")
      {
        var parentDiv = Dom.getAncestorByClassName(el, 'sharedstory');
        if (parentDiv)
        {
          Dom.removeClass(parentDiv, HIDE_CLASS);
          Dom.setStyle(el, 'display', 'none');
          
          //var divs = parentDiv.getElementsByTagName('div');
          //divs[0].style.display = 'block';
          //divs[1].style.display = 'none';
        }
      }

      return false;
    },

    onNewestClick: function(ev, el)
    {
      if (ev.type === "click")
      {
        var div = Dom.get('sharedstories-new');

        this.hideStories = !this.hideStories;
        Dom.setClass(div, 'JsHide', this.hideStories);

        return false;
      }
      else
      {
        var ofs = (ev.type === "mouseover") ? -33 : 0;
        Dom.setStyle(el, "backgroundPosition", '0 '+ ofs+'px');
      }
    },

    onCopy: function(ev, el)   { ev.preventDefault(); this.onClickStory('copy', el); },
    onReport: function(ev, el) { ev.preventDefault(); this.onClickStory('report', el); },
    onStar: function(ev, el)   { ev.preventDefault(); this.onClickStory('star', el); },

    getElMsg: function(el) {
      el = Dom.getAncestorByClassName(el, "JsAction");
      el = Dom.down(el, "JsMsg");
      return el;
    },

    // returns "star" "report" or "copy" from the element class name
    getFirstClassName: function(el)
    {
      if (/(\w+)/.test(el.className))
      {
        return RegExp.$1;
      }
      return '';
    },

    // refactor this with throttle or debounce() ..
    throttleClick: function(span)
    {
      var nowclick, nowsecs;
      
      nowclick = (new Date()).getTime();
      nowsecs = this.lastclick ? (nowclick - this.lastclick) : 1000;
      
      this.lastclick = nowclick;

      if (nowsecs < 300 || (this.ajaxRequest && this.ajaxRequest.isCallInProgress()))
      {
        // span.className = 'err';
        // span.innerHTML = 'Not too fast please!';
        
        return true;
      }

      return false;
    },

    /**
     *  which      action from the element's class name ('star', 'report', 'copy')
     */
    onClickStory: function(which, el)
    {
      var span = this.getElMsg(el);

      if (this.throttleClick(span))
      {
        return;
      }

      // eg. "story-14266-22679"
      var ids = Dom.getDataset(span.parentNode);
      
      // userid, ucs_id
      var params = {
        // use the class name (star/report/copy) as "request"
        request:  which,
        uid:      ids.uid,
        sid:      ids.cid
      };

      if (params.request)
      {
        // NOTE! refactoring legacy AjaxRequest to the lib/front/vue/ api
        var elClickedStory = this.getStoryParentDiv(span);
        var that = this;
        Koohii.API.ajaxSharedStory(params, { then: function(t) {
          that.onAjaxResponse(t, elClickedStory);
        }});
      }

      return;
    },

    // refactoring! is now a KoohiiRequest handler! 
    onAjaxResponse: function(tron, elClickedStory)
    {
      var data = tron.getProps();

// console.log('onAjaxResponse tron %o    el %o', tron, elClickedStory);

      if (data)
      {

if (data.__debug_log) { 
  var dbg_div = document.getElementById("__debug_log");
  if (dbg_div) { dbg_div.innerHTML = data.__debug_log; }
  Core.log(data.__debug_log);
}

        // copy & edit story
        if (data.storyText) 
        {
          Koohii.Refs.vueEditStory.onCopySharedStory(data.storyText);

          return;
        }

        var storyId = 'story-'+data.uid+'-'+data.sid;
        var div  = Dom.get(storyId);
        var span = Dom.down(div, "JsMsg");
        var s;

        if (data.vote >= 0)
        {
          // sigh... NEED VUEJS  maintaining this code ... >_>
          var anchors = [];

          anchors[0] = Dom.down(div, "JsStar").getElementsByTagName("span")[0];
          anchors[1] = Dom.down(div, "JsReport").getElementsByTagName("span")[0];

          if (!data.vote && data.lastvote) {
            s = 'Vote cancelled';
          }
          else if (data.vote === 1) {
            s = 'Starred!';
          }
          else if (data.vote === 2) {
            s = 'Reported';
          }

          // update counts
          var stars = div.getAttribute('appv1') || '0';
          var kicks = div.getAttribute('appv2') || '0';
          stars = parseInt(stars, 10) + parseInt(data.stars, 10);
          kicks = parseInt(kicks, 10) + parseInt(data.kicks, 10);
          div.setAttribute('appv1',stars);
          div.setAttribute('appv2',kicks);
          anchors[0].innerHTML = stars ? stars+'&nbsp;' : '&nbsp;';
          anchors[1].innerHTML = kicks ? kicks+'&nbsp;' : '&nbsp;';

          // move story to favourite(s)
          if (data.vote === 1) {
            this.moveStoryToFavourites(this.getStoryParentDiv(div), storyId);
          }
          else if (data.vote === 0 && data.lastvote === 1) {
            this.moveStoryBack(elClickedStory, storyId);
          }

          span.innerHTML = '';

        }
        else {
          s = 'No self vote!';
          span.innerHTML = s;
        }
      }
    },

    // helper that returns the main div (parent element) of a Shared Story
    getStoryParentDiv: function(el)
    {
      return Dom.getAncestorByClassName(el, SHAREDSTORY_CLASS);
    },

    moveStoryToFavourites: function(elSharedStory, storyId)
    {
      var elFavourites = Dom.get(FAVOURITE_STORIES_ID);

      if (!this.movedStory)
      {
        this.movedStory = {};
      }

      if (!this.movedStory[storyId])
      {
        // insert a new empty div as a kind of bookmark to where the story was
        var div = document.createElement('div');
        div.id = this.moveStoryId(storyId);

        // insert our "remember this story position" div before the Shared Story div
        Dom.insertBefore(div, elSharedStory);

        this.movedStory[storyId] = true;
      }

      // then move the Shared Story div to the favourites section
      Dom.setStyles(elSharedStory, { opacity: 0.1});
      var anim = new Y.util.Anim(elSharedStory, { opacity: { /*from:0.1,*/ to: 1.0 }}, /* duration */ 1);
      
      elFavourites.appendChild(elSharedStory);

      anim.animate();
    },

    moveStoryId: function(storyId)
    {
      return storyId.replace('story-', 'moved-');
    },

    moveStoryBack: function(elSharedStory, storyId)
    {
      var elMoveTo = Dom.get(this.moveStoryId(storyId));

      if (elMoveTo)
      {
        Core.log('moveStoryBack(): move story back to %o', elMoveTo);

        // if no page refresh or stories paging happened, the div we created can be used
        // to move the story back in the list where it was
        Dom.insertBefore(elSharedStory, elMoveTo);        
      }
      else
      {
        // otherwise, avoid unnecessary complexity, just remove the div from the Favourites section
        elSharedStory.parentNode.removeChild(elSharedStory);
      }
    }
  };

}());
