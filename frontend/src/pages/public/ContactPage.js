'use client'

import React from 'react';
import { Button, Icon } from '@/components/common/UIComponents';
import { COLORS } from '@/utils/config';

const ContactPage = () => {
    const [formData, setFormData] = React.useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = React.useState(false);

    const handleInputChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
    const handleSubmit = (e) => { e.preventDefault(); console.log('Message submitted:', formData); setSubmitted(true); };

    const contactInfo = [
        { title: 'Email Us', content: 'support@goorganic.com', description: 'For general inquiries and support', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { title: 'Call Us', content: '+92 300 1234567', description: 'Mon-Sat, 9:00 AM - 6:00 PM', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
        { title: 'Visit Us', content: 'Karachi, Sindh', description: 'Corporate Office', icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z' }
    ];

    const faqs = [
        { question: 'How do I know if a product is truly organic?', answer: 'All products on GOorganic are verified and certified organic. We work only with vendors who maintain proper organic certification and regularly audit their processes.' },
        { question: 'What are your delivery charges?', answer: 'Delivery charges vary based on your location and order value. Orders above Rs. 1000 qualify for free delivery in selected cities.' },
        { question: 'How can I become a vendor?', answer: "You can register as a vendor through our vendor registration page. We'll review your application and get back to you within 2-3 business days." },
        { question: "What is your return policy?", answer: "We have a hassle-free return policy. If you're not satisfied with the product quality, you can return it within 24 hours of delivery." }
    ];

    return (
        <div className="bg-gray-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12"><h1 className="text-4xl font-bold text-gray-900">Get in Touch</h1><p className="mt-4 text-lg text-gray-600">Have a question or feedback? We'd love to hear from you.</p></div>
                <div className="grid md:grid-cols-3 gap-8 mb-16">{contactInfo.map((info, index) => (<div key={index} className="bg-white p-6 rounded-lg shadow-md text-center"><div className="inline-block p-3 rounded-full bg-secondary bg-opacity-10 mb-4"><Icon path={info.icon} className="w-6 h-6" color={COLORS.secondary} /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">{info.title}</h3><p className="text-secondary font-medium mb-1">{info.content}</p><p className="text-sm text-gray-600">{info.description}</p></div>))}</div>

                <div className="grid lg:grid-cols-2 gap-12">
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
                        {submitted ? (<div className="text-center py-8"><div className="inline-block p-3 rounded-full bg-green-100 mb-4"><Icon path="M5 13l4 4L19 7" className="w-6 h-6" color={COLORS.secondary} /></div><h3 className="text-xl font-semibold text-gray-900 mb-2">Thank you for your message!</h3><p className="text-gray-600">We'll get back to you within 24-48 hours.</p><Button onClick={() => setSubmitted(false)} className="mt-6">Send Another Message</Button></div>) : (<form onSubmit={handleSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-gray-700">Name</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div><div><label className="block text-sm font-medium text-gray-700">Email</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div><div><label className="block text-sm font-medium text-gray-700">Subject</label><input type="text" name="subject" value={formData.subject} onChange={handleInputChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary" /></div><div><label className="block text-sm font-medium text-gray-700">Message</label><textarea name="message" value={formData.message} onChange={handleInputChange} required rows="4" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary"></textarea></div><Button type="submit" className="w-full">Send Message</Button></form>)}</div>

                    <div>
                        <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
                        <div className="space-y-6">{faqs.map((faq, index) => (<div key={index} className="bg-white p-6 rounded-lg shadow-md"><h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3><p className="text-gray-600">{faq.answer}</p></div>))}</div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactPage;
