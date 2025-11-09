'use client'

import React from 'react';

const PrivacyPage = () => {
    return (
        <div className="bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <section className="mb-12">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
                        <div className="prose prose-green max-w-none">
                            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
                            <p className="text-gray-600 mb-4">We collect information that you provide directly to us, including:</p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4"><li>Name and contact information</li><li>Delivery address and billing information</li><li>Account credentials</li><li>Order history and preferences</li><li>Communication records</li></ul>
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
                            <p className="text-gray-600 mb-4">We use the information we collect to:</p>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4"><li>Process your orders and payments</li><li>Communicate with you about orders and services</li><li>Send marketing communications (with your consent)</li><li>Improve our services and user experience</li><li>Prevent fraud and enhance security</li></ul>
                        </div>
                    </section>
                    <section className="mt-12 pt-12 border-t">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
                        <div className="prose prose-green max-w-none">
                            <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                            <p className="text-gray-600 mb-4">By accessing and using GOorganic, you agree to be bound by these Terms of Service and all applicable laws and regulations.</p>
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. User Accounts</h2>
                            <p className="text-gray-600 mb-4">You must provide accurate and complete information when creating an account. You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.</p>
                            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Orders and Payments</h2>
                            <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4"><li>All orders are subject to availability</li><li>Prices are subject to change without notice</li><li>Payment must be made at the time of order</li><li>We reserve the right to refuse any order</li></ul>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default PrivacyPage;
