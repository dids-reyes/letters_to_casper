import React, { useEffect } from "react"

const SideAd = () => {
  useEffect(() => {
    const pushAd = () => {
      try {
        const adsbygoogle = window.adsbygoogle
        console.log({ adsbygoogle })
        adsbygoogle.push({})
      } catch (e) {
        console.error(e)
      }
    }

    let interval = setInterval(() => {
      // Check if Adsense script is loaded every 300ms
      if (window.adsbygoogle) {
        pushAd()
        // clear the interval once the ad is pushed so that function isn't called indefinitely
        clearInterval(interval)
      }
    }, 300)

    return () => {
      clearInterval(interval)
    }
  }, [])
  return (
    <ins className="adsbygoogle"
      style={{ display: "block" }}
         data-ad-format="fluid"
         data-ad-layout-key="-gw-7+1w-2e-b"
         data-ad-client="ca-pub-8952526995046987"
         data-ad-slot="1167091798"></ins>
  )
}

export default SideAd
