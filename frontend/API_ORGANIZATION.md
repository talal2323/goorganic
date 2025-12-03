# API Organization - Frontend

## Overview
All API calls are now centralized in dedicated utility files under `frontend/src/utils/`. This provides better code organization, maintainability, and consistency across the application.

## API Utility Files

### 1. **api.js** (Base API Configuration)
- Axios instance with base configuration
- Request interceptor for authentication tokens
- Response interceptor for token refresh and error handling
- Base URL: `/api/v1`
- Timeout: 5 minutes (for large file uploads)

### 2. **cartApi.js** (Cart Operations)
Functions:
- `getCart()` - Fetch user's cart
- `addToCart(productId, quantity)` - Add/update item in cart
- `removeFromCart(productId)` - Remove item from cart

### 3. **orderApi.js** (Order Operations)
Functions:
- `createOrder(orderData)` - Create order from cart (checkout)
- `getMyOrders()` - Fetch customer's order history
- `getAllOrders()` - Admin: fetch all platform orders
- `getVendorOrders()` - Vendor: fetch received orders

### 4. **productApi.js** (Product Operations)
Functions:
- `getProducts(params)` - Get all products with filters (page, keyword, category)
- `getFeaturedProducts()` - Get featured products for homepage
- `getProductById(productId)` - Get single product details
- `createProduct(productData)` - Vendor: create new product
- `updateProduct(productId, productData)` - Vendor: update product
- `deleteProduct(productId)` - Vendor: delete product
- `getMyProducts()` - Vendor: get own products
- `getAllProductsAdmin()` - Admin: get all products
- `updateProductStatus(productId, status)` - Admin: update product status

### 5. **categoryApi.js** (Category Operations)
Functions:
- `getCategories()` - Get all categories
- `getCategoryById(categoryId)` - Get single category
- `createCategory(categoryData)` - Admin: create category
- `updateCategory(categoryId, categoryData)` - Admin: update category
- `deleteCategory(categoryId)` - Admin: delete category

### 6. **vendorApi.js** (Vendor Operations)
Functions:
- `getVendors()` - Get all approved vendors
- `getVendorById(vendorId)` - Get single vendor details
- `getVendorStats()` - Vendor: get dashboard statistics
- `getSalesOverview()` - Vendor: get sales data
- `getRecentActivity()` - Vendor: get recent activity
- `registerVendor(vendorData)` - Register as vendor
- `getAllVendorsAdmin()` - Admin: get all vendors
- `approveVendor(vendorId)` - Admin: approve vendor
- `rejectVendor(vendorId, reason)` - Admin: reject vendor

### 7. **userApi.js** (User/Authentication Operations)
Functions:
- `register(userData)` - Register new user
- `login(credentials)` - Login user
- `logout()` - Logout user
- `getProfile()` - Get current user profile
- `updateProfile(userData)` - Update user profile
- `forgotPassword(email)` - Request password reset
- `resetPassword(token, password)` - Reset password with token
- `getAllCustomers()` - Admin: get all customers
- `requestAccountDeletion(reason)` - Request account deletion

## Benefits of This Approach

### 1. **Centralized API Logic**
- All API endpoints defined in one place per resource
- Easy to find and modify API calls
- Single source of truth for endpoint URLs

### 2. **Better Error Handling**
- Consistent error logging across all API calls
- Easier to implement global error handling
- Error messages logged to console for debugging

### 3. **Easier Maintenance**
- Change an endpoint once instead of across multiple components
- Add authentication logic in one place
- Update request/response formatting centrally

### 4. **Improved Testability**
- Easy to mock API functions for unit tests
- Can test API logic independently from components
- Clearer separation of concerns

### 5. **Code Reusability**
- Import and use the same function across multiple components
- No code duplication
- Consistent parameter handling

### 6. **Better Documentation**
- JSDoc comments explain parameters and return types
- Self-documenting code
- Easy for new developers to understand

### 7. **Type Safety (Future)**
- Easy to add TypeScript types
- Can define interfaces for request/response data
- Better IDE autocomplete

## Usage Examples

### Before (Direct API Calls)
```javascript
// In component
const { data } = await api.get('/products?page=1&keyword=organic');
const products = data.products;
```

### After (Using API Utilities)
```javascript
// In component
import { getProducts } from '@/utils/productApi';

const data = await getProducts({ page: 1, keyword: 'organic' });
const products = data.products;
```

## Component Updates

All components have been updated to use the new API utility files:

### Public Pages
- `app/(public)/page.js` - Uses `getFeaturedProducts()`
- `app/(public)/shop/page.js` - Uses `getProducts()`, `getCategories()`
- `app/(public)/products/[id]/page.js` - Uses `getProductById()`
- `app/(public)/checkout/page.js` - Uses cart and order APIs
- `app/(public)/orders/page.js` - Uses `getMyOrders()`

### Vendor Pages
- `app/vendor/products/page.js` - Uses product and category APIs
- `app/vendor/orders/page.js` - Uses `getVendorOrders()`

### Admin Pages
- `app/admin/orders/page.js` - Uses `getAllOrders()`
- `app/admin/products-categories/page.js` - Uses product and category APIs

## Best Practices

### 1. **Always Use API Utilities**
❌ Don't: `await api.get('/products')`
✅ Do: `await getProducts()`

### 2. **Handle Errors Consistently**
```javascript
try {
    const products = await getProducts();
    // Handle success
} catch (error) {
    console.error('Error:', error);
    showToast.error(error.response?.data?.message || 'Failed to fetch products');
}
```

### 3. **Pass Parameters as Objects**
```javascript
// Good - clear and maintainable
const products = await getProducts({ 
    page: 1, 
    keyword: 'organic',
    category: 'vegetables' 
});

// Avoid - unclear what parameters are
const products = await getProducts(1, 'organic', 'vegetables');
```

### 4. **Keep API Functions Pure**
- No component state management in API functions
- No side effects (toasts, navigation, etc.)
- Return raw data, let components handle presentation

### 5. **Add JSDoc Comments**
Always document API functions:
```javascript
/**
 * Get all products with optional filters
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number
 * @param {string} params.keyword - Search keyword
 * @returns {Promise} Products data with pagination
 */
export const getProducts = async (params = {}) => {
    // Implementation
};
```

## Future Improvements

1. **TypeScript Migration**: Add type definitions for all API functions
2. **Request Caching**: Implement caching layer for frequently accessed data
3. **Retry Logic**: Add automatic retry for failed requests
4. **Request Cancellation**: Cancel pending requests on component unmount
5. **Optimistic Updates**: Update UI before API response for better UX
6. **GraphQL**: Consider migrating to GraphQL for more flexible queries
7. **API Versioning**: Support multiple API versions if backend changes

## Testing

API utilities can be easily tested in isolation:

```javascript
// Example test
import { getProducts } from '@/utils/productApi';
import api from '@/utils/api';

jest.mock('@/utils/api');

describe('getProducts', () => {
    it('should fetch products with correct parameters', async () => {
        const mockData = { products: [], totalPages: 1 };
        api.get.mockResolvedValue({ data: mockData });
        
        const result = await getProducts({ page: 1 });
        
        expect(api.get).toHaveBeenCalledWith('/products?page=1');
        expect(result).toEqual(mockData);
    });
});
```

## Migration Notes

All existing direct `api.get()`, `api.post()`, `api.put()`, `api.delete()` calls have been replaced with their corresponding API utility functions. The functionality remains the same, but the code is now better organized and more maintainable.
