'use client'

import toast from 'react-hot-toast';

// Centralized toast notification utilities
export const showToast = {
    success: (message) => toast.success(message, {
        duration: 3000,
        position: 'top-right',
        style: {
            background: '#10B981',
            color: '#fff',
        },
    }),

    error: (message) => toast.error(message, {
        duration: 4000,
        position: 'top-right',
        style: {
            background: '#EF4444',
            color: '#fff',
        },
    }),

    loading: (message) => toast.loading(message, {
        position: 'top-right',
    }),

    dismiss: (toastId) => toast.dismiss(toastId),

    promise: (promise, messages) => toast.promise(
        promise,
        {
            loading: messages.loading || 'Loading...',
            success: messages.success || 'Success!',
            error: messages.error || 'Something went wrong',
        },
        {
            position: 'top-right',
        }
    ),
};

export default showToast;
