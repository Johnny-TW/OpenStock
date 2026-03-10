import { useState, useEffect } from "react"

const useWindowSize = (options = {}) => {
  const { smBreakpoint = 768 } = options

  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
    isSM: undefined,
    isMD: undefined,
    isLG: undefined,
  })

  useEffect(() => {
    // Handler to call on window resize
    function handleResize() {
      const width = window.innerWidth
      const height = window.innerHeight
      // Set window width/height to state
      setWindowSize({
        width,
        height,
        isSM: width < smBreakpoint,
        isMD: width >= smBreakpoint && width < 992,
        isLG: width >= 992,
      })
    }
    // Add event listener
    window.addEventListener("resize", handleResize)
    // Call handler right away so state gets updated with initial window size
    handleResize()
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [smBreakpoint])

  return windowSize
}

export default useWindowSize
