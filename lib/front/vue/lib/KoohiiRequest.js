/**
 * KoohiiRequest handles client/server ajax for the Vue build
 *
 * - decouple the ajax library from the ux code
 * - help to globally handle errors on the ux side with a custom wrapper around json
 * - helps debugging
 *
 * 
 * TODO
 *
 *    - use a smaller library?
 * 
 *    axios       +12.6 kb   webpack minified (non gzipped)
 *    request     ???        too many dependencies
 *    superagent  +17.2 kb   ...
 */

// use axios for now
import axios from 'axios'

import TRON  from '../lib/koohii/tron.js'

export default {

  /**
   * Put together a request to koohii server.
   * 
   * - abstracts the underlying library (currently, axios)
   * - wraps JSON responses in a custom format
   *
   * @param {String} uri
   * @param {Object} config    'params' (url parameters) and/or 'data' (post body for POST/PUT/PATCH)
   * @param {Object} fn        Handlers that will receive TRON message
   *
   */
  request(uri, config, {then, error}) {

    const defaultError = (error) => {
      console.log('api :: request :: defaultError() %o', error)
    }

    const defaultThen = (res) => {
      // data; status, statusText, headers, config
      console.log('api :: request :: defaultThen() %o', res)
    }

    // default handlers to debug the json response as is
    then  = then  || defaultThen
    error = error || defaultError

    let requestConfig = {
      method: config.method || 'get',
      url: uri,
      params: config.params || null,      // url parameters
      data:   config.data   || null       // PUT/POST/PATCH data
    }

    // console.log('api :: request() %o', requestConfig)

    axios(requestConfig)
      .then(function(res) {
        const t = TRON(res.data)

        // see the response in console (convenience)
        console.log("KoohiiRequest / props received: %o", t.getProps())

        // help debug
        if (t.hasErrors()) { console.warn("KoohiiRequest / errors: \n" + t.getErrors().join("\n")); }

        then(t)
      })
      .catch(function (error) {
        if (error.response) {
          // The request was made and the server responded with a status code that falls out of the range of 2xx
          let t = TRON({
            status: 0,   // STATUS_FAILED
            errors: [ `Oops! Server responded with error ${error.response.status}` ]
          })
          then(t)
        }
        else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.warn(error.request);
        }
        else {
          // Something happened in setting up the request that triggered an Error
          console.warn('Error', error.message);
        }
      })
  }
}
