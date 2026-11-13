# 🎁 How to Add Fragrance Testers - Admin Guide

## Step-by-Step Instructions

### 1. **Create a New Tester Product**
   - Go to `/admin/dashboard` → Click on **Products** in the sidebar
   - Click the **+ Add Product** button
   - Fill in the product details:
     - **Name**: e.g., "Rose Elegance Tester"
     - **Brand**: e.g., "BY12"
     - **Category**: Choose Men/Women/Unisex
     - **Description**: Details about the fragrance
     - **Upload Images**: Add product images

### 2. **Add Size Variants**
   - In the "Size Variants" section:
     - **Size**: Set to `5` (for 5ml samples)
     - **Price**: Set to `0` for free testers, or set a price if desired
     - **Stock**: Set available quantity (e.g., 100)

### 3. **Mark as Tester Product**
   - Scroll down to find the **"Tester/Sample Product"** toggle
   - **Toggle it ON** (switch should turn purple)
   - Configure:
     - **Available Tester Quantity**: e.g., 100 (number of samples)
     - **Tester Size**: e.g., 5 (ml)

### 4. **Save the Product**
   - Click **"Add Product"** button
   - The product will be saved to Firebase with `isTester: true`

### 5. **Verify in Testers Management**
   - Go to `/admin/testers`
   - You should see your newly created tester listed
   - You can edit the quantity or delete it from here

---

## 📊 Firebase Data Structure

Testers are stored in the **`products`** collection with the following structure:

```json
{
  "id": "product-id",
  "name": "Rose Elegance Tester",
  "brand": "BY12",
  "category": "Women",
  "price": 0,
  "stock": 100,
  "isTester": true,
  "testerQuantity": 100,
  "testerSize": 5,
  "sizeVariants": [
    {
      "size": 5,
      "price": 0,
      "stock": 100
    }
  ],
  "imageUrl": "https://...",
  "images": ["https://..."],
  "description": "Beautiful fragrance sample...",
  "createdAt": "2024-05-20T10:00:00Z",
  "updatedAt": "2024-05-20T10:00:00Z"
}
```

---

## 🔄 Customer Journey

1. **Browse**: Customer visits `/testers` or clicks "Free Testers" in navbar
2. **Select**: Customer adds testers to cart (same as regular products)
3. **Checkout**: Customer goes to checkout with tester items
4. **Payment**: Customer pays only delivery charges (product cost is $0)
5. **Order**: Order is created with tester items
6. **Delivery**: Customer receives tester samples

---

## ✅ Checklist

- [ ] Created a new product with `isTester: true`
- [ ] Set price to `0` or custom amount
- [ ] Added available quantity (e.g., 100)
- [ ] Set tester size to `5ml`
- [ ] Uploaded product images
- [ ] Verified in `/admin/testers` that it appears
- [ ] Visited `/testers` page to see it in the shop
- [ ] Added to cart and tested checkout flow

---

## 🐛 Troubleshooting

**Q: Tester not showing in `/admin/testers`?**
- A: Go back to `/admin/products`, find the product, and make sure the "Tester/Sample Product" toggle is ON

**Q: Tester not showing on `/testers` page?**
- A: Wait a moment for data to sync. If still not visible, check:
  - Is `isTester: true` saved in Firebase?
  - Is the product marked as "Active" status?

**Q: Can't find the Tester toggle in product form?**
- A: Scroll down in the form. It's below the "Featured Product" section

**Q: Tester showing in shop but can't add to cart?**
- A: Ensure:
  - Stock quantity is greater than 0
  - Status is "Active"
  - Product has valid images and price

---

## 📝 Notes

- All testers use the **products** collection in Firestore (no separate collection)
- The `isTester` flag distinguishes testers from regular products
- Customers only see testers on the `/testers` page, not in the main shop
- Admin can manage all testers from `/admin/testers`
- Checkout logic automatically handles $0 product prices with shipping only
