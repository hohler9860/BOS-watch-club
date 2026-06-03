// Centered BWC moonphase loading screen — pure CSS, no image.
// Transparent by nature (no box), animates flawlessly in every browser
// (no GIF/APNG format quirks, no caching), scales crisp at any size.
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
      <div className="bwcMoon" aria-label="Loading" role="img">
        <div className="bwcMoon__sky">
          <span className="bwcMoon__orb" />
          <i className="bwcMoon__star bwcMoon__star--1" />
          <i className="bwcMoon__star bwcMoon__star--2" />
          <i className="bwcMoon__star bwcMoon__star--3" />
          <i className="bwcMoon__star bwcMoon__star--4" />
          <i className="bwcMoon__star bwcMoon__star--5" />
        </div>
      </div>
      <style>{`
        .bwcMoon{position:relative;width:120px;height:120px;}
        .bwcMoon__sky{position:absolute;inset:0;animation:bwcSpin 5.5s linear infinite;}
        .bwcMoon__orb{position:absolute;left:50%;top:50%;width:38px;height:38px;margin:-19px 0 0 -19px;
          transform:translateY(-30px);border-radius:50%;
          background:radial-gradient(circle at 36% 32%, #f4f7fa, #c7d2de 56%, #8c9aac 100%);
          box-shadow:0 0 20px rgba(184,196,212,.55), inset -6px -5px 10px rgba(0,0,0,.30);}
        .bwcMoon__star{position:absolute;background:#E8ECF0;border-radius:50%;
          box-shadow:0 0 4px rgba(232,236,240,.8);animation:bwcTwinkle 2.6s ease-in-out infinite;}
        .bwcMoon__star--1{width:3px;height:3px;left:24%;top:30%;animation-delay:0s;}
        .bwcMoon__star--2{width:2px;height:2px;left:72%;top:34%;animation-delay:.5s;}
        .bwcMoon__star--3{width:2.5px;height:2.5px;left:64%;top:66%;animation-delay:1s;}
        .bwcMoon__star--4{width:2px;height:2px;left:30%;top:64%;animation-delay:1.5s;}
        .bwcMoon__star--5{width:2.5px;height:2.5px;left:50%;top:20%;animation-delay:2s;}
        @keyframes bwcSpin{to{transform:rotate(360deg);}}
        @keyframes bwcTwinkle{0%,100%{opacity:.3;}50%{opacity:1;}}
      `}</style>
    </div>
  )
}
