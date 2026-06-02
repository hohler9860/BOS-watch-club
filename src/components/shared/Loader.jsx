// Centered BWC moonphase loading screen.
// Used as the route-transition Suspense fallback (and mirrored as the
// pre-React boot splash inside index.html's #root).
export default function Loader() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'grid',
        placeItems: 'center',
        background: '#07090F',
        zIndex: 9999,
      }}
    >
      <img
        src="/assets/bwc-loader.png"
        alt=""
        aria-label="Loading"
        style={{ width: 80, height: 'auto' }}
      />
    </div>
  )
}
