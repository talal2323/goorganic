'use client'

import React from 'react';

const TermsPage = () => {
    return (
        <div className="bg-gray-50">
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms and Conditions</h1>
                    <div className="prose prose-green max-w-none">
                        <p className="text-gray-600 mb-6">Last updated: {new Date().toLocaleDateString()}</p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 mb-4">
                            By accessing and using the GOorganic website and services, you agree to be bound by these Terms and Conditions,
                            all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Use License</h2>
                        <p className="text-gray-600 mb-4">
                            Permission is granted to temporarily access the materials on GOorganic's website for personal, non-commercial viewing only.
                            This is the grant of a license, not a transfer of title, and under this license you may not:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Modify or copy the materials</li>
                            <li>Use the materials for any commercial purpose or public display</li>
                            <li>Attempt to reverse engineer any software on GOorganic's website</li>
                            <li>Remove any copyright or proprietary notations from the materials</li>
                            <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
                        <p className="text-gray-600 mb-4">
                            When you create an account with us, you must provide accurate, complete, and current information.
                            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
                        </p>
                        <p className="text-gray-600 mb-4">
                            You are responsible for maintaining the confidentiality of your account and password, and for restricting access to your computer.
                            You agree to accept responsibility for all activities that occur under your account or password.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Orders and Payments</h2>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>All orders are subject to product availability</li>
                            <li>We reserve the right to refuse any order you place with us</li>
                            <li>Prices and availability are subject to change without notice</li>
                            <li>Payment must be completed at the time of order placement</li>
                            <li>We accept Cash on Delivery (COD) and online payments through PayFast</li>
                            <li>All prices are listed in Pakistani Rupees (PKR) and include applicable taxes</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Product Descriptions</h2>
                        <p className="text-gray-600 mb-4">
                            We attempt to be as accurate as possible with product descriptions and images. However, we do not warrant that product descriptions,
                            pricing, or other content on this site is accurate, complete, reliable, current, or error-free.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Vendor Responsibilities</h2>
                        <p className="text-gray-600 mb-4">
                            GOorganic operates as a marketplace platform connecting buyers with verified organic vendors. While we verify vendor credentials:
                        </p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>Vendors are responsible for the accuracy of their product listings</li>
                            <li>Vendors must fulfill orders within the agreed timeframe</li>
                            <li>Vendors must maintain product quality and organic certifications</li>
                            <li>GOorganic reserves the right to remove vendors who violate platform policies</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Prohibited Uses</h2>
                        <p className="text-gray-600 mb-4">You may not use our website:</p>
                        <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                            <li>For any unlawful purpose or to solicit others to perform unlawful acts</li>
                            <li>To violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                            <li>To infringe upon or violate our intellectual property rights or the rights of others</li>
                            <li>To harass, abuse, insult, harm, defame, slander, disparage, intimidate, or discriminate</li>
                            <li>To submit false or misleading information</li>
                            <li>To upload viruses or malicious code that will affect the functionality of the service</li>
                            <li>To collect or track personal information of others without consent</li>
                            <li>To spam, phish, or engage in any automated use of the system</li>
                        </ul>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Intellectual Property</h2>
                        <p className="text-gray-600 mb-4">
                            The service and its original content, features, and functionality are and will remain the exclusive property of GOorganic and its licensors.
                            The service is protected by copyright, trademark, and other laws of both Pakistan and foreign countries.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. User-Generated Content</h2>
                        <p className="text-gray-600 mb-4">
                            Our website may allow you to post, link, store, share and otherwise make available certain information, text, graphics, or other material.
                            You are responsible for the content that you post on or through the service, including its legality, reliability, and appropriateness.
                        </p>
                        <p className="text-gray-600 mb-4">
                            By posting content, you grant us the right to use, modify, publicly perform, publicly display, reproduce, and distribute such content
                            on and through the service.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
                        <p className="text-gray-600 mb-4">
                            In no event shall GOorganic, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect,
                            incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill,
                            or other intangible losses, resulting from your access to or use of or inability to access or use the service.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Disclaimer</h2>
                        <p className="text-gray-600 mb-4">
                            Your use of the service is at your sole risk. The service is provided on an "AS IS" and "AS AVAILABLE" basis.
                            The service is provided without warranties of any kind, whether express or implied, including, but not limited to,
                            implied warranties of merchantability, fitness for a particular purpose, non-infringement or course of performance.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Governing Law</h2>
                        <p className="text-gray-600 mb-4">
                            These Terms shall be governed and construed in accordance with the laws of Pakistan, without regard to its conflict of law provisions.
                            Any disputes arising from these terms will be subject to the exclusive jurisdiction of the courts in Karachi, Pakistan.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Changes to Terms</h2>
                        <p className="text-gray-600 mb-4">
                            We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
                            If a revision is material, we will provide at least 30 days' notice prior to any new terms taking effect.
                            What constitutes a material change will be determined at our sole discretion.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. Termination</h2>
                        <p className="text-gray-600 mb-4">
                            We may terminate or suspend your account and bar access to the service immediately, without prior notice or liability,
                            under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
                        </p>
                        <p className="text-gray-600 mb-4">
                            If you wish to terminate your account, you may simply discontinue using the service or contact us to request account deletion.
                        </p>

                        <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">15. Contact Us</h2>
                        <p className="text-gray-600 mb-4">
                            If you have any questions about these Terms and Conditions, please contact us:
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

export default TermsPage;
