import React from 'react';
import DashboardLayout from '@/components/layouts/DashboardLayout';
import { DashboardCard, Button, Icon } from '@/components/common/UIComponents';

const ChatPage = ({ userRole }) => {
    const messages = [
        { id: 1, sender: 'Support', text: 'Hi there! I see you have a question about certification renewal. How can I assist you today?', time: '10:00 AM' },
        { id: 2, sender: 'Me', text: 'Yes, my 2024 certificate is expiring. Where can I upload the new 2025 PDF?', time: '10:02 AM' },
        { id: 3, sender: 'Support', text: 'You can upload it directly under the "Business Info" tab in the Certifications section. I\'m happy to guide you through it if you need help!', time: '10:05 AM' },
    ];

    return (
        <DashboardLayout title="Live Chat Support" userRole={userRole}>
            <DashboardCard title="Live Chat Support" className="h-[75vh] flex flex-col">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 border-b border-gray-200">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-xl shadow-md ${msg.sender === 'Me' ? 'bg-secondary text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-tl-none'}`}>
                                <p className="font-bold text-xs mb-1">{msg.sender}</p>
                                <p className="text-sm">{msg.text}</p>
                                <p className={`text-xs mt-1 ${msg.sender === 'Me' ? 'text-gray-200' : 'text-gray-500'} text-right`}>{msg.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="p-4 flex space-x-3">
                    <input 
                        type="text" 
                        placeholder="Type your message..." 
                        className="flex-1 border border-gray-300 rounded-full p-3 focus:ring-secondary focus:border-secondary" 
                    />
                    <Button onClick={() => console.log('Message sent!')} className="px-4 py-2">
                        <Icon path="M14 5l7 7m0 0l-7 7m7-7H3" className="w-5 h-5" color="white" />
                    </Button>
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default ChatPage;