// vue-bundle.js - the main vue bundle including vue (standalone) and common components used across the app
/**
 * IMPORTANT
 *
 *   Components should be designed in a way that they are *instanced* by Javascript into the page.
 *
 *   For example, the mobile nav is not generated unless user click/tap the hamburger icon, only then
 *   the mobile nav component is instanced and generated into the page.
 *
 *   Why?
 *   
 *   - Speed:          components are pre-compiled.
 *       
 *   - Optimization:   eventually, we will want to switch to the runtime-only build of Vue, to
 *                     further reduce page load. The run-time-only can not parse templates found
 *                     in the html pages.
 *
 *   - Future:         in the future, if we want to switch some parts of the site to a SPA
 *                     like functionality, this will be much easier.
 *
 *
 * NOTES
 *
 *   For vue-loader
 *
 *   $ npm install vue@2.1.6 --save
 *   
 */

// Vue : bundle "standalone" build with the components
import Vue from 'vue'

// coreJS : adds '$' to window !
import $   from './lib/coreJS.js'

// npm wovue-off-canvas
// import OffCanvas     from 'wovue-off-canvas'
// Vue.use(OffCanvas)


// vue-strap
import KoohiiAside     from './components/Aside.js'
import KoohiiNavMenu   from './components/KoohiiNavMenu.js'

// MintUI CSS
// import Badge        from './components/Badge.vue'
// import Spinner      from './components/mint-spinner.vue'

// MintUI JS
// import Indicator    from './components/mint-indicator.js'

// Koohii
import LeitnerChart from './components/LeitnerChart.vue'

// make available to the Vue instance used in the web app's pages (non-SPA)
window.Vue = Vue

// export our DOM library for inline Javascript code
window.$ = $

window.Koohii = {
  UX: {
    KoohiiAside,
    KoohiiNavMenu,
    // Aside,

    LeitnerChart
  }
}
