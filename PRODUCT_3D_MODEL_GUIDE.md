# Optional GLB model links

In Admin > Products > Add/Edit, each size (for example 50ml and 30ml) has its own GLB field. Upload a `.glb` file there — it is stored in the existing Firebase Storage bucket and the download link is saved on that size — or paste a direct public HTTPS GLB URL. Press **Preview**, then save the product.

Firebase Firestore stores a `modelUrl` on each size variant, plus the first model on the product for older pages. The file itself stays in Firebase Storage (the same free Spark bucket already used for product images) or on any host you pasted.

The host must serve the actual GLB file over HTTPS and allow cross-origin requests. A Google Drive or other sharing-page URL is not a direct model file. Same-site model paths are also supported; the included Coffeeno file can be previewed at /models/coffeeno-50ml.glb.

An embedded Assembly animation follows the existing scroll story, including reverse scrolling. A model without an assembly animation displays as supplied. The storefront does not include the separate studio controls.

An empty or invalid link, a different selected size, or a failed model load produces the normal product page without a pinned 3D section. There is no hardcoded product fallback. Reduced-motion users receive the assembled model without extended pinned scrolling.

Existing product images, prices, cart, checkout and reviews are unchanged. Saving the product uses the existing Firestore catalog.

Checks: node --experimental-strip-types --test scripts/product-model.test.mts
