'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';
import { Button, Icon } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const AboutPage = () => {
    const router = useRouter();
    const { dispatch } = useAppContext();
    const [isClient, setIsClient] = useState(false);
    const [showVendorButton, setShowVendorButton] = useState(false);

    useEffect(() => {
        setIsClient(true);
        setShowVendorButton(!localStorage.getItem('authToken'));
    }, []);

    const stats = [
        { number: '10,000+', label: 'Happy Customers' },
        { number: '500+', label: 'Verified Vendors' },
        { number: '1,000+', label: 'Products' },
        { number: '50+', label: 'Cities' },
    ];

    const values = [
        {
            title: 'Authenticity',
            description: 'We ensure every product on our platform is genuinely organic and certified.',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z'
        },
        {
            title: 'Sustainability',
            description: 'We promote sustainable farming practices and eco-friendly packaging.',
            icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
        },
        {
            title: 'Community',
            description: 'We support local farmers and create a sustainable ecosystem for organic farming.',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
        },
        {
            title: 'Quality',
            description: 'We maintain strict quality standards for all products on our platform.',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
        }
    ];

    return (
        <div className="bg-gray-50">
            <main>
                {/* Hero Section */}
                <section className="bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                                    Making Organic Food
                                    <br />
                                    <span style={{ color: COLORS.secondary }}>Accessible to All</span>
                                </h1>
                                <p className="text-lg text-gray-600 mb-8">
                                    GOorganic is Pakistan's leading marketplace for certified organic products.
                                    We connect conscious consumers with verified organic vendors to create
                                    a sustainable ecosystem for healthy living.
                                </p>
                                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                                    <Link href="/shop"><Button>Start Shopping</Button></Link>
                                    {isClient && showVendorButton && (
                                        <Link href="/auth/vendor-register">
                                            <Button className="bg-transparent border border-secondary text-secondary hover:bg-secondary hover:text-white" primary={false}>Become a Vendor</Button>
                                        </Link>
                                    )}
                                </div>
                            </div>
                            <div className="relative h-96">
                                <Image src="/images/about_us.png" alt="About GOorganic" fill unoptimized className="rounded-lg shadow-xl object-cover" />
                                <div className="absolute inset-0 bg-secondary opacity-10 rounded-lg" style={{ mixBlendMode: 'multiply' }}></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <p className="text-3xl font-bold" style={{ color: COLORS.secondary }}>{stat.number}</p>
                                    <p className="text-gray-600 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">Our Values</h2>
                            <p className="text-gray-600 mt-4">The principles that guide everything we do at GOorganic</p>
                        </div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {values.map((value, index) => (
                                <div key={index} className="text-center p-6 bg-gray-50 rounded-lg">
                                    <div className="inline-block p-3 rounded-full bg-secondary bg-opacity-10 mb-4">
                                        <Icon path={value.icon} className="w-6 h-6" color={COLORS.secondary} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{value.title}</h3>
                                    <p className="text-gray-600">{value.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;

