'use client'

import React from 'react';

const ShippingPolicyPage = () => {
    return (
        <div className="bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Shipping Policy</h1>
                    <div className="prose prose-green max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Shipping Areas</h2>
                        <p className="text-gray-600 mb-4">
                            GOorganic currently delivers to the following areas in Pakistan:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Karachi and surrounding areas</li>
                            <li>Major cities across Pakistan (Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, etc.)</li>
                            <li>Selected cities and towns - availability can be verified at checkout</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            If your area is not listed at checkout, please contact our customer service team to check if we can arrange delivery.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Shipping Costs</h2>
                        <p className="text-gray-600 mb-4">We offer competitive and transparent shipping rates:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li><strong>Free Shipping:</strong> Orders of Rs. 3,000 or above qualify for FREE shipping</li>
                            <li><strong>Standard Shipping:</strong> Rs. 200 flat rate for orders below Rs. 3,000</li>
                            <li><strong>Express Delivery:</strong> Additional charges may apply for same-day or express delivery (where available)</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            Shipping costs are calculated automatically at checkout based on your delivery address and order total.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Processing Time</h2>
                        <p className="text-gray-600 mb-4">
                            Orders are processed within 1-2 business days after confirmation. Please note:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Orders placed on weekends or public holidays will be processed on the next business day</li>
                            <li>Orders placed after 2:00 PM may be processed the following business day</li>
                            <li>Processing time may be longer during peak seasons or promotional periods</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Delivery Timeframes</h2>
                        <p className="text-gray-600 mb-4">Estimated delivery times from order confirmation:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li><strong>Karachi:</strong> 2-3 business days</li>
                            <li><strong>Major Cities:</strong> 3-5 business days</li>
                            <li><strong>Other Areas:</strong> 5-7 business days</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            <em>Note: These are estimated timeframes and may vary due to courier operations, weather conditions, or other unforeseen circumstances.</em>
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Order Tracking</h2>
                        <p className="text-gray-600 mb-4">
                            Once your order is shipped, you will receive:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>A shipment confirmation email with tracking information</li>
                            <li>Access to track your order through your account dashboard</li>
                            <li>SMS updates on delivery status (where available)</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Delivery Requirements</h2>
                        <p className="text-gray-600 mb-4">To ensure smooth delivery:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Provide a complete and accurate delivery address including landmarks</li>
                            <li>Ensure someone is available to receive the order during business hours (9 AM - 6 PM)</li>
                            <li>Provide a valid contact number for delivery coordination</li>
                            <li>Verify your address at checkout to avoid delays</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Failed Delivery Attempts</h2>
                        <p className="text-gray-600 mb-4">
                            If delivery cannot be completed on the first attempt:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Our courier partner will make up to 3 delivery attempts</li>
                            <li>You will be contacted before each attempt</li>
                            <li>After 3 failed attempts, the order will be returned to our facility</li>
                            <li>Return shipping charges may apply if the delivery failure is not due to our error</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Perishable Items</h2>
                        <p className="text-gray-600 mb-4">
                            Special care is taken with fresh and perishable items:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Packed with care to maintain freshness during transit</li>
                            <li>Temperature-controlled packaging for sensitive products where necessary</li>
                            <li>Priority processing and shipping for fresh produce</li>
                            <li>Inspect items immediately upon delivery and contact us within 24 hours if there are any issues</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Damaged or Lost Shipments</h2>
                        <p className="text-gray-600 mb-4">
                            If your order arrives damaged or goes missing:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Contact us immediately at <a href="mailto:goorganic.co.pk@gmail.com" className="text-green-600 hover:text-green-700">goorganic.co.pk@gmail.com</a> or +92 324 2452454</li>
                            <li>Provide photos of damaged items and packaging</li>
                            <li>We will arrange a replacement or full refund at no additional cost</li>
                            <li>Claims must be filed within 48 hours of delivery</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. International Shipping</h2>
                        <p className="text-gray-600 mb-4">
                            Currently, GOorganic only ships within Pakistan. We are working on expanding our services internationally.
                            Subscribe to our newsletter to stay updated on new shipping destinations.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Shipping Address Changes</h2>
                        <p className="text-gray-600 mb-4">
                            <strong>Before Shipment:</strong> You can update your shipping address by contacting us immediately after placing your order.
                        </p>
                        <p className="text-gray-600 mb-4">
                            <strong>After Shipment:</strong> Once the order is shipped, address changes may not be possible. Please contact our customer service team to check available options.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Public Holidays and Peak Seasons</h2>
                        <p className="text-gray-600 mb-4">
                            Delivery times may be extended during:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>National and religious holidays (Eid, Ramadan, etc.)</li>
                            <li>Peak shopping seasons and promotional events</li>
                            <li>Extreme weather conditions affecting courier operations</li>
                        </ul>
                        <p className="text-gray-600 mb-4">
                            We will notify you of any potential delays via email or SMS.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Contact Information</h2>
                        <p className="text-gray-600 mb-4">
                            For shipping inquiries or assistance:
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

export default ShippingPolicyPage;
