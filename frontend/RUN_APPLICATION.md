# 🚀 Quick Start - GOorganic Platform

## ✅ Migration Complete!

All navigation has been migrated to Next.js App Router. Follow these steps to run the application.

---

## 📋 Prerequisites

- Node.js 18+ installed
- Backend server running on port 5000
- MongoDB connected

---

## 🏃 Running the Application

### 1. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

Backend should be running on: `http://localhost:5000`

### 2. Start Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Frontend should be running on: `http://localhost:3000`

---

## 🌐 Access the Application

### Public Access
- **Home**: http://localhost:3000
- **Shop**: http://localhost:3000/shop
- **Vendors**: http://localhost:3000/vendors
- **About**: http://localhost:3000/about
- **Contact**: http://localhost:3000/contact

### Authentication
- **Login**: http://localhost:3000/auth/login
- **Register**: http://localhost:3000/auth/register
- **Vendor Register**: http://localhost:3000/auth/vendor-register

### Customer Dashboard
- **Profile**: http://localhost:3000/profile
- **Orders**: http://localhost:3000/orders
- **Checkout**: http://localhost:3000/checkout

### Vendor Dashboard (Login as vendor first)
- **Dashboard**: http://localhost:3000/vendor
- **Orders**: http://localhost:3000/vendor/orders
- **Products**: http://localhost:3000/vendor/products
- **Business Info**: http://localhost:3000/vendor/business-info

### Admin Dashboard (Login as admin first)
- **Dashboard**: http://localhost:3000/admin
- **Users & Vendors**: http://localhost:3000/admin/users-vendors
- **Orders**: http://localhost:3000/admin/orders
- **Analytics**: http://localhost:3000/admin/analytics

---

## 🧪 Testing the Migration

### Test Basic Navigation
1. **Click logo** → Should go to home page
2. **Click Shop** → Should navigate to /shop
3. **Click product** → Should navigate to /products/[id]
4. **Browser back button** → Should work properly ✅
5. **Browser forward button** → Should work properly ✅

### Test Authentication Flow
1. **Register new customer** → Should verify email → Redirect to /shop
2. **Login** → Should redirect based on role:
   - Customer → /shop
   - Vendor → /vendor
   - Admin → /admin
3. **Logout** → Should redirect to home (/)

### Test Protected Routes
1. **Try accessing /vendor** without login → Should redirect to /auth/login
2. **Try accessing /admin** without admin role → Should redirect to /auth/login
3. **Login as vendor** → Should access /vendor routes
4. **Login as admin** → Should access /admin routes

### Test Cart & Checkout
1. **Add product to cart** → Cart sidebar should open
2. **Click checkout** → Should navigate to /checkout
3. **Continue shopping** → Should navigate to /shop

---

## 🐛 Troubleshooting

### Issue: "Page not found"
**Solution**: Make sure you're accessing the correct route. Check `MIGRATION_COMPLETE.md` for route list.

### Issue: "Unauthorized" or redirecting to login
**Solution**: 
- Check if you're logged in
- Verify auth token in browser cookies
- Check user role matches route requirements

### Issue: Navigation doesn't work
**Solution**:
- Open browser console (F12)
- Look for JavaScript errors
- Verify Next.js dev server is running
- Try hard refresh (Ctrl+Shift+R)

### Issue: Back button doesn't work
**Solution**: This was the old SPA problem. With App Router, back button should now work! If not:
- Clear browser cache
- Hard refresh the page
- Restart Next.js dev server

### Issue: Styles not loading
**Solution**:
- Verify Tailwind is configured in `tailwind.config.js`
- Check `globals.css` has `@tailwind` directives
- Restart dev server

---

## 📊 Development Commands

### Frontend Commands
```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Backend Commands
```bash
# Development server with nodemon
npm run dev

# Production server
npm start

# Seed database
npm run seed
```

---

## 🔍 Monitoring

### Check Dev Server Logs
- **Frontend logs**: Terminal running `npm run dev` (port 3000)
- **Backend logs**: Terminal running backend server (port 5000)
- **Browser console**: F12 → Console tab

### Important Log Messages
- ✅ "Ready in [time]ms" - Next.js ready
- ✅ "Compiled successfully" - No errors
- ⚠️ "Failed to compile" - Fix errors shown
- ⚠️ "404" - Page route not found

---

## 📁 Key Files Reference

### Routes Configuration
- **All routes**: `frontend/app/` directory
- **Middleware**: `frontend/middleware.js`
- **Route protection**: Check middleware patterns

### Context & State
- **AppContext**: `frontend/src/context/AppContext.js`
- **Auth state**: Managed in AppContext
- **Cart state**: Managed in AppContext

### API Configuration
- **API client**: `frontend/src/utils/api.js`
- **Backend URL**: Configure in `api.js` (default: localhost:5000)

---

## ✅ Verification Checklist

Before considering migration complete, verify:

- [ ] All pages load without errors
- [ ] Navigation links work correctly
- [ ] Browser back/forward buttons work
- [ ] Auth flow (login/register/logout) works
- [ ] Protected routes redirect properly
- [ ] Role-based access works (vendor/admin)
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Product/vendor detail pages load
- [ ] Mobile responsive menu works
- [ ] No console errors in browser

---

## 🎯 Next Steps

1. ✅ **Test thoroughly** - Try all user flows
2. ✅ **Fix any issues** - Check console for errors
3. ✅ **Add real data** - Connect to backend API
4. ✅ **Implement remaining features** - Chat, notifications, etc.
5. ✅ **Optimize performance** - Add loading states, error boundaries
6. ✅ **Deploy** - When ready for production

---

## 📞 Need Help?

- Check `MIGRATION_COMPLETE.md` for detailed documentation
- Review `NAVIGATION_UPDATE_GUIDE.md` for navigation patterns
- See `MIGRATION_TO_APP_ROUTER.md` for architecture overview

---

**Happy coding! 🎉**

The migration to Next.js App Router is complete. Your application now has:
- ✅ Proper file-based routing
- ✅ Working back button
- ✅ SEO-friendly URLs
- ✅ Middleware protection
- ✅ Server-side rendering capability
- ✅ Better performance and user experience
