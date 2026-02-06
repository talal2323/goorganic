'use client'

import React from 'react';

const RefundPolicyPage = () => {
    return (
        <div className="bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Refund Policy</h1>
                    <div className="prose prose-green max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Refund Eligibility</h2>
                        <p className="text-gray-600 mb-4">
                            We offer refunds for items that meet our return policy criteria. Refunds are processed in the following situations:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Damaged, defective, or incorrect items received</li>
                            <li>Items that do not match the product description</li>
                            <li>Cancelled orders before shipment</li>
                            <li>Failed delivery attempts after multiple tries</li>
                            <li>Approved returns within the 7-day return window</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Refund Process</h2>
                        <p className="text-gray-600 mb-4">Once your return is approved and received:</p>
                        <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Our team will inspect the returned item within 2-3 business days</li>
                            <li>If approved, your refund will be processed within 5-7 business days</li>
                            <li>You will receive an email confirmation with refund details</li>
                            <li>The refund will be credited to your original payment method</li>
                        </ol>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Refund Methods</h2>
                        <p className="text-gray-600 mb-4">
                            Refunds will be issued using the same payment method used for the original purchase:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li><strong>Cash on Delivery (COD):</strong> Refunds will be processed via bank transfer. Please provide your bank account details to our customer service team.</li>
                            <li><strong>PayFast/Online Payment:</strong> Refunds will be credited to the same bank account or payment method used for the transaction within 7-10 business days.</li>
                            <li><strong>Bank Transfer:</strong> Refunds typically appear in your account within 7-10 business days depending on your bank's processing time.</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Partial Refunds</h2>
                        <p className="text-gray-600 mb-4">
                            In certain situations, only partial refunds may be granted:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Items with obvious signs of use or damage not caused by GOorganic</li>
                            <li>Items returned more than 7 days after delivery</li>
                            <li>Items not in their original packaging</li>
                            <li>Perishable items that have been opened or partially consumed</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Non-Refundable Items</h2>
                        <p className="text-gray-600 mb-4">The following are non-refundable:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Gift cards and vouchers</li>
                            <li>Delivery charges (unless the return is due to our error)</li>
                            <li>Items marked as final sale or clearance</li>
                            <li>Custom or personalized products</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Order Cancellations</h2>
                        <p className="text-gray-600 mb-4">
                            <strong>Before Shipment:</strong> You can cancel your order at any time before it has been shipped.
                            A full refund will be processed within 5-7 business days.
                        </p>
                        <p className="text-gray-600 mb-4">
                            <strong>After Shipment:</strong> Once an order has been shipped, you must follow our standard return process
                            to receive a refund. Return shipping costs may apply unless the return is due to our error.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Exchanges</h2>
                        <p className="text-gray-600 mb-4">
                            We currently do not offer direct exchanges. If you need a different size, color, or product,
                            please return the original item for a refund and place a new order for the desired item.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Late or Missing Refunds</h2>
                        <p className="text-gray-600 mb-4">
                            If you haven't received your refund within the stated timeframe:
                        </p>
                        <ol className="list-decimal pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Check your bank account or payment method statement</li>
                            <li>Contact your bank or payment provider - processing times may vary</li>
                            <li>If you've done all of this and still have not received your refund, contact us at <a href="mailto:goorganic.co.pk@gmail.com" className="text-green-600 hover:text-green-700">goorganic.co.pk@gmail.com</a></li>
                        </ol>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Currency</h2>
                        <p className="text-gray-600 mb-4">
                            All prices and refunds are processed in Pakistani Rupees (PKR). If you paid in a different currency
                            through your payment provider, the refund amount may vary slightly due to exchange rate fluctuations.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            For questions about refunds or to check the status of your refund:
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

export default RefundPolicyPage;
