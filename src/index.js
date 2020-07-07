import * as React from 'react'
import cpuIdleShim from './cpuIdleCallBackShim'
import { isBrowser, event, setUpNewObserver } from './utils'

// making sure cpu idle shim keeps everything ready before running.
cpuIdleShim()

const AsyncHydrate = (props) => {
  const childRef = React.useRef(null)
  const [hydrated, setHydrated] = React.useState(!isBrowser)
  const {
    skipHydration,
    hydrateWhenIdle,
    hydrateWhenVisible,
    children,
    ...otherProps
  } = props

  React.useEffect(() => {
    const queuedOps = []
    const cleanup = () => {
      while (queuedOps.length) {
        queuedOps.pop()()
      }
    }
    const hydrate = () => {
      setHydrated(true)
    }

    if (skipHydration || hydrated) return

    if (hydrateWhenIdle) {
      const timeoutFator = props.hydrateWhenIdle.timeout || 1000
      if (isBrowser && window.requestIdleCallback) {
        const idleCallbackId = requestIdleCallback(hydrate, {
          timeout: timeoutFator
        })
        queuedOps.push(() => {
          cancelIdleCallback(idleCallbackId)
        })
      } else {
        console.log(
          `You are using on a browser that does not support requestIdleCallback
           Hydration would be trigerred in a synchronous manner`
        )
        return hydrate()
      }
    }

    if (hydrateWhenVisible) {
      const threshold = props.hydrateWhenVisible.threshold || 0
      const rootMargin = props.hydrateWhenVisible.rootMargin || '0px'
      const observer = setUpNewObserver(rootMargin, threshold, hydrate)
      if (observer && childRef.current.childElementCount) {
        observer.observe(childRef.current.children[0])
        queuedOps.push(() => {
          observer.unobserve(childRef.current.children[0])
        })
      } else {
        return hydrate()
      }
    }
    return cleanup
  }, [hydrated, skipHydration, hydrateWhenIdle, hydrateWhenVisible])

  if (hydrated) {
    return (
      <div ref={childRef} {...otherProps}>
        {children}
      </div>
    )
  } else {
    return (
      <div
        ref={childRef}
        suppressHydrationWarning
        {...otherProps}
        dangerouslySetInnerHTML={{ __html: '' }}
      />
    )
  }
}

export default AsyncHydrate
