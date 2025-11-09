import { AppContextProvider } from '@/context/AppContext'
import '@/styles/globals.css'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/common/ErrorBoundary'
import TokenRefreshIndicator from '@/components/common/TokenRefreshIndicator'

export const metadata = {
    title: 'GOorganic - 100% Organic Products',
    description: 'Your trusted source for 100% organic products from verified vendors',
}

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>
                <ErrorBoundary>
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
                </ErrorBoundary>
            </body>
        </html>
    )
}
