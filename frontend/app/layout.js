import { AppContextProvider } from '@/context/AppContext'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import ClientErrorBoundary from '@/components/common/ClientErrorBoundary'
import TokenRefreshIndicator from '@/components/common/TokenRefreshIndicator'

export const metadata = {
    title: 'GOorganic - 100% Organic Products',
    description: 'Your trusted source for 100% organic products from verified vendors',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&display=swap" rel="stylesheet" />
            </head>
            <body className="overflow-x-hidden">
                <ClientErrorBoundary>
                    <AppContextProvider>
                        <TokenRefreshIndicator />
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                duration: 3000,
                                style: {
                                    background: '#363636',
                                    color: '#fff',
                                },
                                success: {
                                    duration: 3000,
                                    iconTheme: {
                                        primary: '#10B981',
                                        secondary: '#fff',
                                    },
                                },
                                error: {
                                    duration: 4000,
                                    iconTheme: {
                                        primary: '#EF4444',
                                        secondary: '#fff',
                                    },
                                },
                            }}
                        />
                    </AppContextProvider>
                </ClientErrorBoundary>
            </body>
        </html>
    )
}
