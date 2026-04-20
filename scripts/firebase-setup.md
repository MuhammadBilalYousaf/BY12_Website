# Firebase Setup Instructions

## 1. Create a Firebase Project
- Go to [Firebase Console](https://console.firebase.google.com/)
- Click "Create a new project"
- Name it "perfume-luxe"
- Enable Google Analytics (optional)

## 2. Set Up Authentication
- In Firebase Console, go to Authentication
- Click "Get started"
- Enable Email/Password provider
- (Optional) Enable Google Sign-in

## 3. Create Firestore Database
- Go to Firestore Database
- Click "Create database"
- Choose "Start in production mode"
- Select your preferred region (closest to your users)

## 4. Create Storage Bucket
- Go to Storage
- Click "Get started"
- Use default settings
- Click "Done"

## 5. Set Up Security Rules

### Firestore Security Rules
\`\`\`
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for products
    match /products/{document=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // User data - own read/write
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Orders - anyone can create (for guest checkout), users can read their own
    match /orders/{orderId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }

    // Cart - user can read/write own cart
    match /carts/{userId} {
      allow read, write: if request.auth.uid == userId;
    }

    // Reviews
    match /reviews/{reviewId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Coupons - public read for validation
    match /coupons/{couponId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Testimonials - public read for approved ones, anyone can create (for reviews)
    match /testimonials/{testimonialId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Product Reviews - public read, anyone can submit reviews
    match /productReviews/{reviewId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if request.auth != null;
    }
    
    // Blogs - public read
    match /blogs/{blogId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Deals - public read for active offers, admin write
    match /deals/{dealId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
\`\`\`

### Storage Security Rules
\`\`\`
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read images
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.uid != null && 
                      get(/databases/(default)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
    
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth.uid == userId;
    }
  }
}
\`\`\`

## 6. Get Your Firebase Config
- In Firebase Console, go to Project Settings (gear icon)
- Scroll to "Your apps" section
- Click on the web app (or create one)
- Copy the config object

## 7. Add Environment Variables to Vercel
In your Vercel project settings, add these environment variables:

\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

## 8. Initialize Collections
- Go to Firestore Database
- Create a collection named "products"
- Create a collection named "users"
- Create a collection named "orders"
- Create a collection named "carts"
- Create a collection named "reviews"
- Create a collection named "deals"

Collections will be auto-created when you write documents, but creating them first helps organize your database.
