import React from 'react';
import { Logo } from '@/components/common/UIComponents';
import { Header } from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children, title }) => (
    <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow bg-gray-50 flex items-center justify-center py-10 px-4">
            <div className="w-full max-w-fit bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                {/* Auth Form Area - Fixed Width */}
                <div className="w-full md:w-[450px] p-6 sm:p-8 flex flex-col justify-center">
                    <Logo className="text-2xl mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
                    {children}
                </div>
                {/* Decorative Image Area - Dynamic Width */}
                <div className="hidden md:block relative overflow-hidden">
                    <img
                        src="/images/login-reg.png"
                        alt="Organic products background"
                        className="h-full w-full object-cover min-h-[500px]"
                    />
                </div>
            </div>
        </div>
        <Footer />
    </div>
);

export default AuthLayout;
