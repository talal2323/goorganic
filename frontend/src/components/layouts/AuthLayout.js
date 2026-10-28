import React from 'react';
import Image from 'next/image';
import { Logo } from '@/components/common/UIComponents';
import { Header } from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children, title }) => (
    <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex-grow bg-gray-50 flex items-center justify-center py-10 px-4">
            <div className="flex w-full max-w-[750px] flex-col overflow-hidden rounded-2xl bg-white shadow-xl md:h-[650px] md:flex-row">

                {/* Form Section */}
                <div className="flex min-w-0 w-full flex-col justify-center overflow-y-auto p-6 sm:p-10 md:w-1/2">
                    <Logo className="text-3xl mb-4 text-green-700" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
                    {children}
                </div>

                {/* Image Section */}
                <div className="relative hidden min-h-[620px] md:block md:w-1/2">
                    <Image
                        src="https://res.cloudinary.com/dzldaebmd/image/upload/v1793106752/login-reg_jlni5n.png"
                        alt="Organic products background"
                        fill
                        className="object-cover"
                    />
                </div>

            </div>
        </div>

        <Footer />
    </div>
);

export default AuthLayout;
