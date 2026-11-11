// Rebuild the checked-in share image with `node scripts/generate-og.mjs`.
// No remote fonts or images are requested. This is not needed during deployment.
import sharp from "sharp";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
<rect width="1200" height="630" fill="#fafaf7"/>
<path d="M80 110H1120M80 520H1120" stroke="#dfe4df" stroke-width="2"/>
<text x="80" y="82" font-family="sans-serif" font-size="18" letter-spacing="4" fill="#626c66">A LITTLE SPACE FOR IDEAS</text>
<text x="76" y="300" font-family="sans-serif" font-size="100" font-weight="600" fill="#252b2a">HeliumBoom<tspan fill="#276c5a">.</tspan></text>
<text x="82" y="370" font-family="sans-serif" font-size="29" fill="#626c66">Notes on technology, building, and thinking.</text>
<text x="82" y="568" font-family="sans-serif" font-size="22" fill="#276c5a">heliumboom.github.io</text>
<rect x="955" y="200" width="160" height="190" rx="3" fill="none" stroke="#276c5a" stroke-width="2"/>
<text x="975" y="235" font-family="sans-serif" font-size="20" fill="#276c5a">02</text>
<text x="973" y="325" font-family="sans-serif" font-size="82" fill="#276c5a">He</text>
<text x="978" y="364" font-family="sans-serif" font-size="15" letter-spacing="4" fill="#276c5a">HELIUM</text>
</svg>`;
await sharp(Buffer.from(svg)).png().toFile("public/og.png");
console.log("Generated public/og.png (1200 × 630)");
