# Optional GLB model links

In Admin > Products > Add/Edit, paste a direct public GLB URL into **GLB Model Link (optional)**. Choose the size represented by the model, press **Preview model**, then save the product.

Firebase Firestore stores only the modelUrl string and optional modelSize number. The GLB stays on your chosen external host. There are no upload APIs, storage buckets, provider API keys or paid-plan requirements in this feature.

The host must serve the actual GLB file over HTTPS and allow cross-origin requests. A Google Drive or other sharing-page URL is not a direct model file. Same-site model paths are also supported; the included Coffeeno file can be previewed at /models/coffeeno-50ml.glb.

An embedded Assembly animation follows the existing scroll story, including reverse scrolling. A model without an assembly animation displays as supplied. The storefront does not include the separate studio controls.

An empty or invalid link, a different selected size, or a failed model load produces the normal product page without a pinned 3D section. There is no hardcoded product fallback. Reduced-motion users receive the assembled model without extended pinned scrolling.

Existing product images, prices, cart, checkout and reviews are unchanged. Saving the product uses the existing Firestore catalog.

Checks: node --experimental-strip-types --test scripts/product-model.test.mts
