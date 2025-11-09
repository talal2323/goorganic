# GOorganic - Next.js 15 Migration

This is the Next.js 15 version of the GOorganic e-commerce platform, migrated from Create React App while preserving all design and functionality.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
frontend-nextjs/
├── app/                    # Next.js 15 App Router
│   ├── layout.js          # Root layout with AppContext provider
│   └── page.js            # Main page with routing logic
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── auth/         # Authentication components
│   │   ├── chat/         # Chat functionality
│   │   ├── common/       # Shared components (Header, Footer, etc.)
│   │   ├── dashboard/    # Dashboard components
│   │   ├── layouts/      # Layout components
│   │   └── ui/           # UI components
│   ├── config/           # Configuration files
│   ├── context/          # React Context (AppContext)
│   ├── pages/            # Page components
│   │   ├── admin/        # Admin dashboard pages
│   │   ├── auth/         # Authentication pages
│   │   ├── public/       # Public-facing pages
│   │   └── vendor/       # Vendor dashboard pages
│   ├── styles/           # Global styles
│   └── utils/            # Utility functions and API client
├── public/               # Static assets
└── tailwind.config.js    # Tailwind CSS configuration
```

## 🎨 Design System

The application maintains the original green-themed design with:
- **Primary Color**: `#164A26` (Deep Green)
- **Secondary Color**: `#175017` (Dark Green)
- **Background**: `#F8F9FA` (Light Gray)

All Tailwind CSS styles have been preserved from the original React application.

## 🔑 Key Features

- ✅ **Role-based Access**: Admin, Vendor, Customer, and Guest roles
- ✅ **State Management**: React Context for global state
- ✅ **Shopping Cart**: Full cart functionality with persistence
- ✅ **Authentication**: Login, Register, OTP verification, Password reset
- ✅ **Vendor Management**: Complete vendor dashboard with products, orders, subscriptions
- ✅ **Admin Panel**: Comprehensive admin controls for users, vendors, products, and analytics
- ✅ **Responsive Design**: Mobile-first design with Tailwind CSS

## 📦 Technology Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: JavaScript (with TypeScript config for future migration)
- **Styling**: Tailwind CSS 3.3+
- **Icons**: Heroicons 2.2+
- **HTTP Client**: Axios
- **State Management**: React Context API

## 🔄 API Configuration

The app is configured to proxy API requests to `http://localhost:5000`. Update `next.config.js` if your backend runs on a different port.

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel deploy
```

### Other Platforms
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## 📝 Migration Notes

This Next.js version maintains 100% feature parity with the original React application:
- All components and pages have been migrated
- The same state management system (AppContext) is used
- Tailwind CSS configuration is identical
- All routing logic has been adapted to work with Next.js App Router

## 🤝 Contributing

When adding new features:
1. Add 'use client' directive to components that use React hooks
2. Use `@/` path alias for imports
3. Follow the existing folder structure
4. Maintain the design system colors and spacing

## 📄 License

Private - All rights reserved
