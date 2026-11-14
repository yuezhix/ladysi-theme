import { BACKDROP_H, BACKDROP_PATHS, BACKDROP_W } from './backdrop-vector'

// The backdrop: the person's autumn hill behind the whole window, sidebar included.
// The desktop app scrubs raster images (and inline styles) out of a backdrop scene, so
// the picture is traced into flat-colour paths (hooks/backdrop-vector.ts) and softened
// with a small blur into a painted look. Only shapes the app keeps: rect, path, filter.
const W = BACKDROP_W
const H = BACKDROP_H

export const BACKDROP_SCENE = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice">
<defs><filter id="soft" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="0.7"/></filter></defs>
<rect width="${W}" height="${H}" fill="#efe6d2"/>
<g filter="url(#soft)" transform="translate(${W / 2} ${H / 2}) scale(1.03) translate(${-W / 2} ${-H / 2})" shape-rendering="crispEdges">${BACKDROP_PATHS}</g>
</svg>`
