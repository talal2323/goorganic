import React from 'react';
import { Logo } from '@/components/common/UIComponents';
import { Header } from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children, title }) => (
    <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow bg-gray-50 flex items-center justify-center py-10 px-4">
            <div className="max-w-5xl w-full bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
                {/* Auth Form Area */}
                <div className="w-full md:w-1/2 p-6 sm:p-10 flex flex-col justify-center relative">
                    <Logo className="text-3xl mb-8" />
                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
                    {children}
                </div>
                {/* Decorative Image Area (Figma Match) */}
                <div className="w-full md:w-1/2 p-6 md:p-10 hidden md:flex items-center justify-center bg-gray-100">
                    <img
                        src="https://placehold.co/400x500/E9F5E9/164A26?text=Organic+Marketplace+Image"
                        alt="Organic products background"
                        className="object-cover w-full h-full rounded-xl shadow-inner"
                    />
                </div>
            </div>
        </div>
        <Footer />
    </div>
);

export default AuthLayout;
