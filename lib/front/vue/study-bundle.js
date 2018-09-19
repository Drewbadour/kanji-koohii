// bundle used on the Study pages
// 
// requires the root bundle!

// Koohii
import LeitnerChart    from 'components/LeitnerChart.vue'
import KoohiiDictList  from 'components/KoohiiDictList.vue'
import KoohiiEditStory from 'components/KoohiiEditStory.vue'

// for legacy code upgrade path
import { KoohiiAPI }   from 'lib/KoohiiAPI.js'


if (window.Koohii && window.Koohii.UX) {

  // we're not using Babel polyfill for Object.assign()
  let UX = window.Koohii.UX

  UX.LeitnerChart    = LeitnerChart
  UX.KoohiiDictList  = KoohiiDictList
  UX.KoohiiEditStory = KoohiiEditStory

  // for legacy code upgrade path
  Koohii.API = KoohiiAPI

}
else {
  console.warn('Koohii.UX not defined.')
}


