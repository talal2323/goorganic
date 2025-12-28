import React from 'react';
import Image from 'next/image';
import { Logo } from '@/components/common/UIComponents';
import { Header } from '@/components/layouts/Header';
import Footer from '@/components/layouts/Footer';

const AuthLayout = ({ children, title }) => (
    <div className="min-h-screen flex flex-col">
        <Header />

        <div className="flex-grow bg-gray-50 flex items-center justify-center py-10 px-4">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex md:flex-row flex-col w-full max-w-[750px] h-auto md:h-[650px]">

                {/* Form Section */}
                <div className="w-full md:w-[500px] p-10 flex flex-col justify-center">
                    <Logo className="text-3xl mb-4 text-green-700" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>
                    {children}
                </div>

                {/* Image Section */}
                <div className="hidden md:block w-[400px] relative min-h-[620px]">
                    <Image
                        src="/images/login-reg.png"
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
