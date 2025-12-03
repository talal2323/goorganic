'use client'

import ErrorBoundary from '@/components/common/ErrorBoundary'

export default function ClientErrorBoundary({ children }) {
    return <ErrorBoundary>{children}</ErrorBoundary>
}
