import { useEffect, useRef } from 'react'

export function useInterval(callback, delay)
{
  // https://overreacted.io/making-setinterval-declarative-with-react-hooks/
  const savedCallback = useRef()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}
