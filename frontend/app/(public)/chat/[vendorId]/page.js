'use client'

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import ChatBox from '@/components/chat/ChatBox';
import { getVendorByIdUser } from '@/utils/userApi';

export default function CustomerVendorChatPage() {
    const params = useParams();
    const [vendorName, setVendorName] = useState('Vendor');

    const vendorId = useMemo(() => {
        const value = params?.vendorId;
        return Array.isArray(value) ? value[0] : value;
    }, [params]);

    useEffect(() => {
        if (!vendorId) return;

        const fetchVendorName = async () => {
            try {
                const vendor = await getVendorByIdUser(vendorId);
                setVendorName(vendor?.shopName || vendor?.name || 'Vendor');
            } catch (err) {
                console.error('Failed to fetch vendor details:', err);
                setVendorName('Vendor');
            }
        };

        fetchVendorName();
    }, [vendorId]);

    return (
        <section className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <ChatBox vendorId={vendorId} vendorName={vendorName} />
        </section>
    );
}
