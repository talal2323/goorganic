// Lightweight history mapping between app state and URL paths

// (removed unused slugify helper)

// Map app state to pathname
export const pathForState = (state) => {
  const page = state?.page || 'Home';
  const vendorId = state?.selectedVendor?.id;
  const productId = state?.selectedProduct?.id;

  switch (page) {
    case 'Home':
      return '/';
    case 'Shop':
      return '/shop';
    case 'VendorList':
      return '/vendors';
    case 'VendorDetail':
      return vendorId ? `/vendor/${encodeURIComponent(vendorId)}` : '/vendors';
    case 'ProductDetail':
      return productId ? `/product/${encodeURIComponent(productId)}` : '/shop';
    case 'Contact':
      return '/contact';
    case 'About':
      return '/about';
    case 'Blog':
      return '/blog';
    case 'Notifications':
      return '/notifications';
    case 'Checkout':
      return '/checkout';
    case 'OrderConfirmation':
      return '/order-confirmation';
    case 'Profile':
      return '/profile';
    case 'OrderHistory':
      return '/orders';
    default:
      return '/';
  }
};

// Parse a location.pathname back to app page and optional params
export const pageFromPath = (pathname) => {
  const path = (pathname || '/').replace(/\/+/g, '/');
  const parts = path.split('/').filter(Boolean);

  if (parts.length === 0) return { page: 'Home' };
  const [head, sub] = parts;

  switch (head) {
    case 'shop':
      return { page: 'Shop' };
    case 'vendors':
      return { page: 'VendorList' };
    case 'vendor':
      return sub ? { page: 'VendorDetail', vendorId: decodeURIComponent(sub) } : { page: 'VendorList' };
    case 'product':
      return sub ? { page: 'ProductDetail', productId: decodeURIComponent(sub) } : { page: 'Shop' };
    case 'contact':
      return { page: 'Contact' };
    case 'about':
      return { page: 'About' };
    case 'blog':
      return { page: 'Blog' };
    case 'notifications':
      return { page: 'Notifications' };
    case 'checkout':
      return { page: 'Checkout' };
    case 'order-confirmation':
      return { page: 'OrderConfirmation' };
    case 'profile':
      return { page: 'Profile' };
    case 'orders':
      return { page: 'OrderHistory' };
    default:
      return { page: 'Home' };
  }
};
