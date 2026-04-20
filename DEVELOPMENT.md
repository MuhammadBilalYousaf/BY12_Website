# Development Guide

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Code editor (VS Code recommended)

### Installation
\`\`\`bash
git clone <repo>
cd perfume-luxe
npm install
npm run dev
\`\`\`

## Project Commands

\`\`\`bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check

# Database
npm run db:push      # Push schema to Firestore
npm run db:seed      # Seed sample data
\`\`\`

## File Structure Best Practices

### Components
- Place reusable components in `/components`
- Use `[ComponentName].tsx` naming convention
- Keep components focused and single-responsibility

### Pages
- Route files go in `/app` following Next.js app router
- Use folders for route grouping
- Create `page.tsx` for actual pages

### Libraries
- Put utility functions in `/lib`
- Create `/lib/contexts` for React Context providers
- Create `/lib/api` for API clients

### Styles
- Use Tailwind CSS classes
- Maintain consistent spacing scale
- Use design tokens from globals.css

## Git Workflow

\`\`\`bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "Add your feature"

# Push to remote
git push origin feature/your-feature

# Create Pull Request on GitHub
\`\`\`

## Testing

\`\`\`bash
# Run tests
npm run test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
\`\`\`

## Performance Tips

1. **Images**: Use next/image for automatic optimization
2. **Code Splitting**: Use dynamic imports for heavy components
3. **API Calls**: Use SWR for client-side data fetching
4. **CSS**: Leverage Tailwind's JIT mode for unused class removal

## Debugging

### Browser DevTools
- Inspect elements with Chrome DevTools
- Use React DevTools browser extension
- Check Network tab for API calls

### VS Code Debugging
\`\`\`json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js",
      "type": "node",
      "request": "launch",
      "program": "\${workspaceFolder}/node_modules/.bin/next",
      "args": ["dev"],
      "console": "integratedTerminal"
    }
  ]
}
\`\`\`

## Common Issues

### Port Already in Use
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
\`\`\`

### Clear Cache
\`\`\`bash
rm -rf .next
npm run dev
\`\`\`

### Dependencies Issues
\`\`\`bash
rm -rf node_modules package-lock.json
npm install
\`\`\`

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
