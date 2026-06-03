// Centered BWC moonphase loading screen. Animated GIF (always plays in every
// browser, including Safari) baked on the exact #07090F page background so it
// reads as a seamless floating moonphase, no box, no ring, no blend tricks.
export default function Loader({ fading = false }) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#07090F',
        zIndex: 9999,
        opacity: fading ? 0 : 1,
        transition: 'opacity .45s ease',
      }}
    >
      <img src="/assets/bwc-loader-v3.gif" alt="" aria-label="Loading" style={{ width: 96, height: 'auto' }} />
    </div>
  )
}
