# Next.js App Router Migration Guide

## ✅ Completed Steps

### 1. Route Structure Created
- ✅ Public routes in `app/(public)/`
- ✅ Auth routes in `app/auth/`
- ✅ Vendor routes in `app/vendor/`
- ✅ Admin routes in `app/admin/`
- ✅ Middleware for route protection

### 2. AppContext Refactored
- ✅ Removed `page` state
- ✅ Removed `SET_PAGE` action
- ✅ Removed URL syncing logic
- ✅ Kept auth state, cart state, and user management

### 3. Navigation Utility Created
- ✅ Created `useNavigation()` hook in `src/utils/navigation.js`

## 🔄 Migration Required

### How to Update Navigation in Components

**OLD WAY:**
```javascript
import { useAppContext } from '@/context/AppContext';

const { dispatch } = useAppContext();

// Navigate to a page
dispatch({ type: 'SET_PAGE', payload: 'Shop' });
dispatch({ type: 'SET_PAGE', payload: 'AdminDashboard' });
```

**NEW WAY Option 1 - Use Navigation Hook:**
```javascript
import { useNavigation } from '@/utils/navigation';

const { navigate } = useNavigation();

// Navigate to a page
navigate('Shop'); // Goes to /shop
navigate('AdminDashboard'); // Goes to /admin
```

**NEW WAY Option 2 - Use Next.js Link:**
```javascript
import Link from 'next/link';

<Link href="/shop">Go to Shop</Link>
<Link href="/admin">Admin Dashboard</Link>
<Link href="/vendor/products">My Products</Link>
```

**NEW WAY Option 3 - Use Next.js Router:**
```javascript
import { useRouter } from 'next/navigation';

const router = useRouter();

router.push('/shop');
router.push('/admin');
router.back(); // Go back
router.replace('/login'); // Replace without history
```

### Files That Need Updates

Search for these patterns and replace them:

1. **`dispatch({ type: 'SET_PAGE'` - ~100+ occurrences**
   - In all components that navigate
   - Headers, Sidebars, Buttons, Forms

2. **Common locations:**
   - `src/components/layouts/Header.js`
   - `src/components/layouts/DashboardHeader.js`
   - `src/components/layouts/Sidebar.js`
   - `src/components/common/UIComponents.js` (Button components)
   - All page components that have navigation buttons
   - All forms that redirect after submission

### Example Updates

#### Header Navigation
```javascript
// OLD
<button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'Shop' })}>
    Shop
</button>

// NEW
<Link href="/shop" className="...">
    Shop
</Link>
```

#### Dashboard Sidebar
```javascript
// OLD
<button onClick={() => dispatch({ type: 'SET_PAGE', payload: 'VendorProducts' })}>
    Products
</button>

// NEW
<Link href="/vendor/products" className="...">
    Products
</Link>
```

#### Login Redirect
```javascript
// OLD
const handleLogin = async () => {
    const response = await api.post('/auth/login', credentials);
    dispatch({ type: 'LOGIN', payload: response.data });
    // Page change handled by LOGIN action
};

// NEW
const handleLogin = async () => {
    const response = await api.post('/auth/login', credentials);
    dispatch({ type: 'LOGIN', payload: response.data });
    
    // Manually redirect based on role
    const user = response.data;
    const roles = user.roles || [];
    if (roles.includes('admin')) {
        router.push('/admin');
    } else if (roles.includes('vendor')) {
        router.push('/vendor');
    } else {
        router.push('/shop');
    }
};
```

#### Logout Redirect
```javascript
// OLD
const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    // Automatically goes to Home
};

// NEW
const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    router.push('/');
};
```

## Route Mapping Reference

| Old Page Name | New Route |
|--------------|-----------|
| Home | / |
| Shop | /shop |
| About | /about |
| Contact | /contact |
| Profile | /profile |
| OrderHistory | /orders |
| Checkout | /checkout |
| Vendors/VendorList | /vendors |
| VendorDetail | /vendors/[id] |
| ProductDetail | /products/[id] |
| Login | /auth/login |
| Register | /auth/register |
| VendorRegister | /auth/vendor-register |
| VendorDashboard | /vendor |
| VendorOrders | /vendor/orders |
| VendorProducts | /vendor/products |
| VendorBusinessInfo | /vendor/business-info |
| VendorSubscriptions | /vendor/subscriptions |
| AdminDashboard | /admin |
| AdminUsersVendors | /admin/users-vendors |
| AdminOrders | /admin/orders |
| AdminProductsCategories | /admin/products-categories |
| AdminSubscriptionsControl | /admin/subscriptions |

## Testing Checklist

- [ ] All navigation links work
- [ ] Back button works properly
- [ ] Auth redirects work (login -> dashboard)
- [ ] Protected routes redirect to login
- [ ] Vendor approval status check works
- [ ] Admin routes only accessible to admins
- [ ] Cart add-to-cart auth check works
- [ ] Logout redirects to home
- [ ] Dynamic routes work (vendor/[id], product/[id])
- [ ] URL changes reflect in browser address bar
- [ ] Direct URL access works
- [ ] Refresh on any page works

## Benefits of Migration

✅ **Browser back/forward buttons work**  
✅ **URLs are shareable**  
✅ **Better SEO potential**  
✅ **Cleaner separation of concerns**  
✅ **Standard Next.js patterns**  
✅ **Better performance with route prefetching**

## Next Steps

1. **Update all `dispatch({ type: 'SET_PAGE' })` calls** - Use find/replace in your editor
2. **Convert button onClick to Link components** - For better performance
3. **Test each section** - Public, Auth, Vendor, Admin
4. **Fix any broken navigation**
5. **Remove old app/page.js once confirmed working**
