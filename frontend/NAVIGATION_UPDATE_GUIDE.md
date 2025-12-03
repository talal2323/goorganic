# Navigation Migration Script

## Quick Reference: Page Name to Route Mapping

```javascript
// Copy this object for quick reference
const routeMap = {
  'Home': '/',
  'Shop': '/shop',
  'About': '/about',
  'Contact': '/contact',
  'PrivacyPolicy': '/privacy',
  'Profile': '/profile',
  'OrderHistory': '/orders',
  'Checkout': '/checkout',
  'OrderConfirmation': '/order-confirmation',
  'Vendors': '/vendors',
  'VendorList': '/vendors',
  'VendorDetail': '/vendors', // + ID parameter
  'ProductDetail': '/products', // + ID parameter
  'Notifications': '/notifications',
  'Blog': '/blog',
  'Login': '/auth/login',
  'Register': '/auth/register',
  'VendorRegister': '/auth/vendor-register',
  'OTPVerification': '/auth/otp',
  'ForgotPassword': '/auth/forgot-password',
  'ResetPassword': '/auth/reset-password',
  'VendorDashboard': '/vendor',
  'VendorOrders': '/vendor/orders',
  'VendorProducts': '/vendor/products',
  'VendorBusinessInfo': '/vendor/business-info',
  'VendorRatingsReviews': '/vendor/reviews',
  'VendorSubscriptions': '/vendor/subscriptions',
  'VendorNotifications': '/vendor/notifications',
  'AdminDashboard': '/admin',
  'AdminUsersVendors': '/admin/users-vendors',
  'AdminOrders': '/admin/orders',
  'AdminProductsCategories': '/admin/products-categories',
  'AdminSubscriptionsControl': '/admin/subscriptions',
  'AdminAnalytics': '/admin/analytics',
  'DeletionRequests': '/admin/deletion-requests',
  'CustomersPage': '/admin/customers',
  'CategoriesPage': '/admin/categories',
  'ReviewsPage': '/admin/reviews',
  'DisputesPage': '/admin/disputes',
  'FAQsPage': '/admin/faqs',
};
```

## Step-by-Step Migration Instructions

### 1. ✅ DONE: LoginPage.js
Already updated with router.push()

### 2. Update Header.js

**File:** `src/components/layouts/Header.js`

**Add import at top:**
```javascript
import { useRouter } from 'next/navigation';
import Link from 'next/link';
```

**Inside component, add:**
```javascript
const router = useRouter();
```

**Replace all `dispatch({ type: 'SET_PAGE', payload: 'PageName' })` with:**
```javascript
router.push('/route-path')
```

**For logout function:**
```javascript
const handleLogout = async () => {
  try {
    await api.post('/users/logout');
  } catch (error) {
    console.error('Logout failed', error);
  } finally {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    router.push('/');
  }
};
```

**Replace navigation menu items with Link components:**
```javascript
// OLD:
<button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Shop' })}>
  Shop
</button>

// NEW:
<Link href="/shop" className="...">
  Shop
</Link>
```

### 3. Update DashboardHeader.js

**File:** `src/components/layouts/DashboardHeader.js`

Same pattern as Header.js:
- Add `import { useRouter } from 'next/navigation';`
- Replace `dispatch({ type: 'SET_PAGE' })` with `router.push()`
- Update logout to redirect to `/`

### 4. Update Sidebar.js

**File:** `src/components/layouts/Sidebar.js`

Replace the navigation function:
```javascript
// OLD:
const handleNavigation = (pageId) => {
  dispatch({ type: 'SET_PAGE', payload: pageId });
};

// NEW:
import { useRouter } from 'next/navigation';
const router = useRouter();

const handleNavigation = (pageId) => {
  const routes = {
    'VendorDashboard': '/vendor',
    'VendorOrders': '/vendor/orders',
    'VendorProducts': '/vendor/products',
    // ... add all routes
  };
  router.push(routes[pageId] || '/');
};
```

**OR better - convert to Link components:**
```javascript
<Link href="/vendor/orders" className="...">
  Orders
</Link>
```

### 5. Update Footer.js

**File:** `src/components/layouts/Footer.js`

Convert all navigation to Link components:
```javascript
import Link from 'next/link';

<Link href="/about">About</Link>
<Link href="/contact">Contact</Link>
<Link href="/privacy">Privacy Policy</Link>
```

### 6. Update ShoppingCartSidebar.js

**File:** `src/components/ui/ShoppingCartSidebar.js`

```javascript
import { useRouter } from 'next/navigation';
const router = useRouter();

// Replace:
dispatch({ type: 'SET_PAGE', payload: 'Checkout' });
// With:
router.push('/checkout');

dispatch({ type: 'SET_PAGE', payload: 'Shop' });
// With:
router.push('/shop');
```

### 7. Update Auth Pages

**Files to update:**
- `src/pages/auth/RegisterPage.js`
- `src/pages/auth/VendorRegisterPage.js`
- `src/pages/auth/OTPVerification.js`
- `src/pages/auth/ForgotPasswordPage.js`
- `src/pages/auth/ResetPasswordPage.js`

**Pattern:**
```javascript
// Add import
import { useRouter } from 'next/navigation';

// In component
const router = useRouter();

// Replace dispatch with router.push()
```

### 8. Update Public Pages

**Files:**
- `src/pages/public/HomePage.js`
- `src/pages/public/ShopPage.js`
- `src/pages/public/AboutPage.js`
- `src/pages/public/ProductDetailPage.js`
- `src/pages/public/VendorDetailPage.js`
- `src/pages/public/VendorListPage.js`
- `src/pages/public/CheckoutPage.js`
- `src/pages/public/ProfilePage.js`

**For product/vendor links, use Link with dynamic routes:**
```javascript
import Link from 'next/link';

<Link href={`/products/${product.id}`}>
  View Product
</Link>

<Link href={`/vendors/${vendor.id}`}>
  View Vendor
</Link>
```

### 9. Update Admin Dashboard

**File:** `src/pages/admin/AdminDashboard.js`

```javascript
import { useRouter } from 'next/navigation';
const router = useRouter();

// Replace:
dispatch({ type: 'SET_PAGE', payload: 'AdminUsersVendors' })
// With:
router.push('/admin/users-vendors')
```

### 10. Update NotificationsPopover.js

**File:** `src/components/ui/NotificationsPopover.js`

Same pattern - add router and replace dispatch calls.

## Find and Replace Patterns

Use your editor's find/replace (Ctrl+Shift+H in VS Code):

### Pattern 1: Simple navigation
**Find:** `dispatch\\(\\{ type: 'SET_PAGE', payload: '([^']+)' \\}\\)`  
**Manual replacement needed** - look up route in routeMap above

### Pattern 2: Common patterns

**Find:** `dispatch({ type: 'SET_PAGE', payload: 'Home' })`  
**Replace:** `router.push('/')`

**Find:** `dispatch({ type: 'SET_PAGE', payload: 'Shop' })`  
**Replace:** `router.push('/shop')`

**Find:** `dispatch({ type: 'SET_PAGE', payload: 'Login' })`  
**Replace:** `router.push('/auth/login')`

**Find:** `dispatch({ type: 'SET_PAGE', payload: 'VendorDashboard' })`  
**Replace:** `router.push('/vendor')`

**Find:** `dispatch({ type: 'SET_PAGE', payload: 'AdminDashboard' })`  
**Replace:** `router.push('/admin')`

## Priority Order

1. ✅ **DONE:** LoginPage.js
2. **HIGH PRIORITY:**
   - Header.js (used on every public page)
   - DashboardHeader.js (used on all dashboard pages)
   - Sidebar.js (vendor/admin navigation)
3. **MEDIUM PRIORITY:**
   - Other auth pages (Register, VendorRegister, etc.)
   - ShoppingCartSidebar.js
   - Footer.js
4. **LOW PRIORITY:**
   - Individual page components (they work but navigation buttons need updates)
   - NotificationsPopover.js

## Testing After Each Update

1. Save the file
2. Check browser console for errors
3. Test the navigation buttons/links
4. Verify the URL changes in address bar
5. Test back button works
6. Move to next file

## Common Issues and Fixes

### Issue 1: "router is not defined"
**Fix:** Make sure you added `const router = useRouter();` after imports

### Issue 2: "useRouter only works in Client Components"
**Fix:** Add `'use client'` at the top of the file

### Issue 3: Links don't work
**Fix:** Make sure you imported: `import Link from 'next/link';`

### Issue 4: Page not found
**Fix:** Check the route exists in `app/` directory structure

## Need Help?

If a file is too complex, share the file name and I'll help update it specifically!
