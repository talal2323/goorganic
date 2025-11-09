Frontend folder organization

This project uses an organized `src/` structure to separate pages (route entry points) from reusable UI components and domain-specific widgets.

Key folders created during reorganization:

- src/pages/
  - public/       -> Public-facing page components (Home, Shop, ProductDetail, About, Contact, Blog, etc.)
  - auth/         -> Authentication-related pages (Login, Register, OTP, Forgot Password)
  - vendor/       -> Vendor dashboard pages (VendorDashboard, VendorOrders, etc.)
  - admin/        -> Admin dashboard pages and management pages

- src/components/
  - common/       -> Reusable UI atoms and small components (Logo, Icon, Button)
  - layouts/      -> Layout components like Header, Footer, Layout wrappers
  - ui/           -> Small UI widgets (ShoppingCartSidebar, NotificationsPopover)
  - vendor/       -> Vendor-specific widgets
  - admin/        -> Admin-specific widgets
  - auth/         -> Auth form components (if needed)

- src/context/    -> AppContext and state management
- src/routing/    -> RouteSync and helpers
- src/api/        -> (recommended) centralized API client and services
- src/utils/      -> Utils and constants
- public/         -> Static assets (logo.png)

Notes:
- Pages in `src/pages/*` are now lightweight re-exports that point to the existing components under `src/components/*`. This preserves history while creating a clear, discoverable canonical location for route entry components.
- To fully move implementations into `src/pages/`, you can replace the re-export files with the real page source files; current approach is low-risk and keeps imports stable.

Recommended next steps:
- Convert routing to use react-router paths directly (instead of `state.page`) for better deep-linking and SEO.
- Add lazy-loading (React.lazy + Suspense) for large pages.
- Persist cart/auth state to localStorage.
- Remove temporary files like `ContactPage.js.tmp`.

If you want, I can now:
- Finish moving implementations into `src/pages/` (replace re-exports) so the `components/pages/` folder can be cleaned up, or
- Apply lazy-loading and cart persistence as follow-ups.
