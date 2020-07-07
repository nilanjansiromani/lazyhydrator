// Targeted for browsers like safari which does not have a native implementation of CPI IDLE callback
import { isBrowser } from './utils'
const cpuIdleShim = () => {
  if (isBrowser && !window.requestIdleCallback && !window.cancelIdleCallback) {
    window.requestIdleCallback =
      window.requestIdleCallback ||
      function (cb) {
        var start = Date.now()
        return setTimeout(function () {
          // eslint-disable-next-line standard/no-callback-literal
          cb({
            didTimeout: false,
            timeRemaining: function () {
              return Math.max(0, 500 - (Date.now() - start))
            }
          })
        }, 1)
      }

    window.cancelIdleCallback =
      window.cancelIdleCallback ||
      function (id) {
        clearTimeout(id)
      }
  }
}

export default cpuIdleShim
