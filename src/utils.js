export const event = 'hydrate'
export const isBrowser = typeof document !== 'undefined'

export const setUpNewObserver = (
  rootMargin = '0px',
  threshold = 0,
  callback
) => {
  if (isBrowser && window.IntersectionObserver) {
    // eslint-disable-next-line no-undef
    return new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            callback()
          }
        })
      },
      {
        rootMargin: rootMargin,
        threshold: threshold
      }
    )
  }
}
