'use client'

import { useAppContext } from '@/context/AppContext'
import Layout from '@/components/layouts/Layout'
import HomePage from '@/pages/public/HomePage'
import ShopPage from '@/pages/public/ShopPage'
import AboutPage from '@/pages/public/AboutPage'
import ContactPage from '@/pages/public/ContactPage'
import PrivacyPage from '@/pages/public/PrivacyPage'
import CheckoutPage from '@/pages/public/CheckoutPage'
import OrderConfirmationPage from '@/pages/public/OrderConfirmationPage'
import VendorPage from '@/pages/public/VendorPage'
import VendorListPage from '@/pages/public/VendorListPage'
import VendorDetailPage from '@/pages/public/VendorDetailPage'
import BlogPage from '@/pages/public/BlogPage'
import ProfilePage from '@/pages/public/ProfilePage'
import OrderHistoryPage from '@/pages/public/OrderHistoryPage'
import ProductDetailPage from '@/pages/public/ProductDetailPage'
import NotificationsPage from '@/pages/public/NotificationsPage'

// Auth Pages
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import VendorRegisterPage from '@/pages/auth/VendorRegisterPage'
import OTPVerification from '@/pages/auth/OTPVerification'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'

// Vendor Pages
import VendorDashboard from '@/pages/vendor/VendorDashboard'
import VendorOrders from '@/pages/vendor/VendorOrders'
import VendorProducts from '@/pages/vendor/VendorProducts'
import VendorBusinessInfo from '@/pages/vendor/VendorBusinessInfo'
import VendorRatingsReviews from '@/pages/vendor/VendorRatingsReviews'
import VendorSubscriptions from '@/pages/vendor/VendorSubscriptions'
import VendorNotificationsPage from '@/pages/vendor/VendorNotificationsPage'

// Admin Pages
import AdminDashboard from '@/pages/admin/AdminDashboard'
import AdminUsersVendors from '@/pages/admin/AdminUsersVendors'
import AdminOrders from '@/pages/admin/AdminOrders'
import AdminProductsCategories from '@/pages/admin/AdminProductsCategories'
import AdminSubscriptionsControl from '@/pages/admin/AdminSubscriptionsControl'
import AdminAnalytics from '@/pages/admin/AdminAnalytics'
import DashboardPage from '@/pages/admin/DashboardPage'
import VendorsPage from '@/pages/admin/VendorsPage'
import OrdersPage from '@/pages/admin/OrdersPage'
import ProductsPage from '@/pages/admin/ProductsPage'
import CustomersPage from '@/pages/admin/CustomersPage'
import CategoriesPage from '@/pages/admin/CategoriesPage'
import ReviewsPage from '@/pages/admin/ReviewsPage'
import DisputesPage from '@/pages/admin/DisputesPage'
import FAQsPage from '@/pages/admin/FAQsPage'
import AnalyticsPage from '@/pages/admin/AnalyticsPage'
import SubscriptionPlansPage from '@/pages/admin/SubscriptionPlansPage'

// Chat Component
import ChatPage from '@/components/common/ChatPage'

// Public Layout for public-facing pages
const PublicLayout = () => {
    const { state } = useAppContext();
    let content;
    switch (state.page) {
        case 'Shop': content = <ShopPage />; break;
        case 'Vendor': content = <VendorPage />; break;
        case 'VendorList': content = <VendorListPage />; break;
        case 'VendorDetail': content = <VendorDetailPage />; break;
        case 'ProductDetail': content = <ProductDetailPage />; break;
        case 'Notifications': content = <NotificationsPage />; break;
        case 'Blog': content = <BlogPage />; break;
        case 'About': content = <AboutPage />; break;
        case 'Contact': content = <ContactPage />; break;
        case 'PrivacyPolicy':
        case 'TermsConditions': content = <PrivacyPage />; break;
        case 'Checkout': content = <CheckoutPage />; break;
        case 'OrderConfirmation': content = <OrderConfirmationPage />; break;
        case 'Profile': content = <ProfilePage />; break;
        case 'OrderHistory': content = <OrderHistoryPage />; break;
        default: content = <HomePage />; break;
    }
    return <Layout>{content}</Layout>;
}

// Page Renderer based on state
const PageRenderer = () => {
    const { state } = useAppContext();
    const { page, userRole, isLoggedIn } = state;

    // 1. Handle Authentication Pages
    switch (page) {
        case 'Login': return isLoggedIn ? <PublicLayout /> : <LoginPage />;
        case 'Register': return isLoggedIn ? <PublicLayout /> : <RegisterPage />;
        case 'VendorRegister': return isLoggedIn ? <PublicLayout /> : <VendorRegisterPage />;
        case 'OTPVerification': return isLoggedIn ? <PublicLayout /> : <OTPVerification />;
        case 'ForgotPassword': return <ForgotPasswordPage />;
        case 'ResetPassword': return <ResetPasswordPage />;
        default:
            break;
    }

    // 2. Handle Vendor Dashboard Pages
    if (userRole === 'vendor') {
        switch (page) {
            case 'VendorDashboard': return <VendorDashboard />;
            case 'VendorOrders': return <VendorOrders />;
            case 'VendorProducts': return <VendorProducts />;
            case 'VendorBusinessInfo': return <VendorBusinessInfo />;
            case 'VendorRatingsReviews': return <VendorRatingsReviews />;
            case 'VendorSubscriptions': return <VendorSubscriptions />;
            case 'VendorNotifications': return <VendorNotificationsPage />;
            case 'Chat': return <ChatPage userRole="vendor" />;
            default: return <PublicLayout />;
        }
    }

    // 3. Handle Admin Dashboard Pages
    if (userRole === 'admin') {
        switch (page) {
            case 'AdminDashboard': return <AdminDashboard />;
            case 'AdminUsersVendors': return <AdminUsersVendors />;
            case 'AdminOrders': return <AdminOrders />;
            case 'AdminProductsCategories': return <AdminProductsCategories />;
            case 'AdminSubscriptionsControl': return <AdminSubscriptionsControl />;
            case 'AdminAnalytics': return <AdminAnalytics />;
            case 'Chat': return <ChatPage userRole="admin" />;
            case 'Dashboard': return <DashboardPage />;
            case 'Vendors': return <VendorsPage />;
            case 'Orders': return <OrdersPage />;
            case 'Products': return <ProductsPage />;
            case 'Customers': return <CustomersPage />;
            case 'Categories': return <CategoriesPage />;
            case 'Reviews': return <ReviewsPage />;
            case 'Disputes': return <DisputesPage />;
            case 'FAQs': return <FAQsPage />;
            case 'Analytics': return <AnalyticsPage />;
            case 'SubscriptionPlans': return <SubscriptionPlansPage />;
            case 'Notifications': return <NotificationsPage />;
            default: return <PublicLayout />;
        }
    }

    // 4. Fallback for 'guest' and 'customer' is always the Public Layout
    return <PublicLayout />;
};

export default function Home() {
    return (
        <div id="go-organic-app">
            <PageRenderer />
        </div>
    )
}
