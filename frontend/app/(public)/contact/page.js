'use client'

import React, { useState, useEffect } from 'react';
import { Button, Icon } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';
import { getAllFAQs } from '@/utils/faqApi';
import { sendContactMessage } from '@/utils/contactApi';
import { showToast } from '@/utils/toast';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [faqs, setFaqs] = useState([]);
    const [loadingFaqs, setLoadingFaqs] = useState(true);
    const [openFaqId, setOpenFaqId] = useState(null);

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoadingFaqs(true);
            const data = await getAllFAQs();
            setFaqs(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch FAQs:', error);
        } finally {
            setLoadingFaqs(false);
        }
    };

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setSubmitting(true);
            const response = await sendContactMessage(formData);
            showToast.success(response.message || 'Message sent successfully!');
            setSubmitted(true);
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            showToast.error(error.response?.data?.message || 'Failed to send message. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const contactInfo = [
        { title: 'Email Us', content: 'goorganic.co.pk@gmail.com', description: 'For general inquiries and support', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { title: 'Call Us', content: (<>+92 324 2452454<br />+92 310 2260995</>), description: 'Mon-Sat, 9:00 AM - 6:00 PM', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
        { title: 'Visit Us', content: 'Karachi, Sindh', description: 'Corporate Office', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }
    ];

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12"><h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1><p className="mt-4 text-lg text-gray-600">Have a question or feedback? We'd love to hear from you.</p></div>
                <div className="grid md:grid-cols-3 gap-8 mb-16">{contactInfo.map((info, index) => (<div key={index} className="bg-white p-6 rounded-lg shadow-md text-center"><div className="inline-block p-3 rounded-full bg-secondary bg-opacity-10 mb-4"><Icon path={info.icon} className="w-6 h-6" color={COLORS.secondary} /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3><p className="text-secondary font-medium mb-1">{info.content}</p><p className="text-sm text-gray-600">{info.description}</p></div>))}</div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
                        {submitted ? (<div className="text-center py-8"><div className="inline-block p-3 rounded-full bg-green-100 mb-4"><Icon path="M5 13l4 4L19 7" className="w-6 h-6" color={COLORS.secondary} /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for your message!</h3><p className="text-gray-600">We'll get back to you within 24-48 hours.</p><Button onClick={() => setSubmitted(false)} className="mt-6">Send Another Message</Button></div>) : (<form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div><div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div><div><label className="block text-sm font-medium text-gray-700">Subject</label><input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out" /></div><div><label className="block text-sm font-medium text-gray-700">Message</label><textarea name="message" value={formData.message} onChange={handleInputChange} required rows="4" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm transition duration-150 ease-in-out"></textarea></div><Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Sending...' : 'Send Message'}</Button></form>)}
                    </div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
                        {loadingFaqs ? (
                            <div className="text-center py-8 text-gray-500">Loading FAQs...</div>
                        ) : faqs.length === 0 ? (
                            <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">No FAQs available at the moment.</div>
                        ) : (
                            <div className="space-y-4">
                                {faqs.map((faq) => (
                                    <div key={faq._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                        <button
                                            onClick={() => setOpenFaqId(openFaqId === faq._id ? null : faq._id)}
                                            className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                                        >
                                            <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                                            <Icon
                                                path={openFaqId === faq._id ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"}
                                                className="w-5 h-5 flex-shrink-0 transition-transform"
                                                color={COLORS.secondary}
                                            />
                                        </button>
                                        {openFaqId === faq._id && (
                                            <div className="px-6 pb-4 pt-2 border-t border-gray-100">
                                                <p className="text-gray-600">{faq.answer}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;

