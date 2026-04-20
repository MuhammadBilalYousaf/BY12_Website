# Perfume Luxe E-commerce Deployment Guide

## Prerequisites
- Node.js 18+ and npm
- Vercel Account (for hosting)
- Firebase Project (for backend)
- GitHub Account (for version control)

## Step 1: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project named "perfume-luxe"
3. Follow the setup guide in `scripts/firebase-setup.md`
4. Copy your Firebase config and set environment variables

## Step 2: Configure Environment Variables

Create a `.env.local` file with:
\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/auth/callback
\`\`\`

## Step 3: Install Dependencies

\`\`\`bash
npm install
\`\`\`

## Step 4: Test Locally

\`\`\`bash
npm run dev
\`\`\`

Visit http://localhost:3000 to test the app.

## Step 5: Deploy to Vercel

### Option A: Using Vercel CLI
\`\`\`bash
npm i -g vercel
vercel login
vercel
\`\`\`

### Option B: Using GitHub
1. Push your code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New" → "Project"
4. Select your GitHub repository
5. Add environment variables
6. Click "Deploy"

## Step 6: Post-Deployment Setup

### Set Vercel Environment Variables
In your Vercel Project Settings → Environment Variables, add all Firebase credentials.

### Update Firebase URLs
Update your Firebase authentication redirect URLs:
- Add your Vercel production URL
- Update domain settings

### Test Production
1. Visit your production URL
2. Test authentication flow
3. Test shopping cart functionality
4. Test checkout process

## Step 7: Performance Optimization

### Enable Image Optimization
- Add high-quality product images to `/public` folder
- Use Next.js Image component for automatic optimization

### Monitor Performance
- Use Vercel Analytics: Dashboard → Analytics
- Monitor Core Web Vitals
- Check page load times

### SEO Setup
- Verify Google Search Console
- Submit sitemap at `/public/sitemap.xml`
- Monitor search rankings

## Step 8: Domain Configuration (Optional)

1. Purchase domain from registrar
2. In Vercel project, go to Settings → Domains
3. Add your domain
4. Update DNS records as instructed

## Troubleshooting

### Firebase Connection Issues
- Verify environment variables are set correctly
- Check Firebase security rules
- Ensure authentication is enabled

### Deployment Fails
- Check Node.js version compatibility
- Review build logs in Vercel Dashboard
- Ensure all dependencies are installed

### Auth Not Working
- Verify Firebase configuration
- Check redirect URLs
- Clear browser cache and try again

## Maintenance

### Regular Backups
- Enable Firestore backup in Firebase Console
- Export data regularly

### Monitor Costs
- Firebase: Check usage in Console
- Vercel: Monitor bandwidth and compute time
- Set up billing alerts

### Update Dependencies
\`\`\`bash
npm update
npm audit fix
\`\`\`

## Support & Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vercel Docs](https://vercel.com/docs)
