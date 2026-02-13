'use client'

import React from 'react';

const ReturnPolicyPage = () => {
    return (
        <div className="bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Return Policy</h1>
                    <div className="prose prose-green max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Return Eligibility</h2>
                        <p className="text-gray-600 mb-4">
                            At GOorganic, we want you to be completely satisfied with your purchase. You may return items within
                            <strong> 7 days</strong> of receiving your order if:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>The product is damaged, defective, or not as described</li>
                            <li>You received the wrong item</li>
                            <li>The product is unopened and in its original packaging (for perishable items)</li>
                            <li>Items are unused and in resalable condition</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Non-Returnable Items</h2>
                        <p className="text-gray-600 mb-4">The following items cannot be returned:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Fresh produce and perishable items that have been opened or used</li>
                            <li>Items purchased on final sale or clearance</li>
                            <li>Gift cards and vouchers</li>
                            <li>Personal care items that have been opened</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How to Initiate a Return</h2>
                        <p className="text-gray-600 mb-4">To initiate a return, please follow these steps:</p>
                        <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Contact our customer service team at <a href="mailto:goorganic.co.pk@gmail.com" className="text-green-600 hover:text-green-700">goorganic.co.pk@gmail.com</a> or call us at +92 324 2452454</li>
                            <li>Provide your order number and reason for return</li>
                            <li>Our team will review your request and provide return instructions within 24-48 hours</li>
                            <li>Pack the item securely in its original packaging</li>
                            <li>Ship the item to the address provided by our customer service team</li>
                        </ol>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Return Shipping Costs</h2>
                        <p className="text-gray-600 mb-4">
                            If the return is due to our error (wrong item, damaged, or defective product), we will cover the return shipping costs.
                            For all other returns, return shipping costs are the responsibility of the customer.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Processing Time</h2>
                        <p className="text-gray-600 mb-4">
                            Once we receive your returned item, we will inspect it and process your refund within 5-7 business days.
                            You will receive an email confirmation once your return has been processed.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Damaged or Defective Items</h2>
                        <p className="text-gray-600 mb-4">
                            If you receive a damaged or defective item, please contact us immediately with photos of the product and packaging.
                            We will arrange for a replacement or full refund at no additional cost to you.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Contact Information</h2>
                        <p className="text-gray-600 mb-4">
                            For any questions about our return policy or to initiate a return, please contact us:
                        </p>
                        <ul className="list-none pl-0 text-gray-600 space-y-2 mb-4">
                            <li><strong>Email:</strong> <a href="mailto:goorganic.co.pk@gmail.com" className="text-green-600 hover:text-green-700">goorganic.co.pk@gmail.com</a></li>
                            <li><strong>Phone:</strong> +92 324 2452454 or +92 310 2260995</li>
                            <li><strong>Hours:</strong> Monday to Saturday, 9:00 AM - 6:00 PM</li>
                            <li><strong>Address:</strong> Karachi, Sindh, Pakistan</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReturnPolicyPage;
