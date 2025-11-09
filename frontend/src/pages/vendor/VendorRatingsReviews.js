import React from 'react';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import { DashboardCard, StarRating, Icon } from '../../components/common/UIComponents';

const VendorRatingsReviews = () => {
    const reviews = [
        { id: 1, user: 'Ahmed Ali', date: '3 days ago', text: 'Great quality spinach, very fresh and promptly delivered. Highly recommended vendor!', rating: 5 },
        { id: 2, user: 'Maria Khan', date: '1 week ago', text: 'The almond oil is pure, but the delivery took a bit longer than expected.', rating: 4 },
        { id: 3, user: 'Usman Sharif', date: '1 month ago', text: 'Fantastic customer support and excellent cow milk quality. Will order again.', rating: 5 },
    ];

    const averageRating = (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1);

    return (
        <DashboardLayout title="Ratings & Reviews" userRole="vendor">
            <DashboardCard title="Customer Ratings & Reviews">
                <div className="flex items-center space-x-4 mb-6 pb-4 border-b">
                    <p className="text-5xl font-extrabold text-primary">{averageRating}</p>
                    <div>
                        <StarRating rating={Math.round(averageRating)} />
                        <p className="text-sm text-gray-500 mt-1">Based on {reviews.length} reviews</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {reviews.map(review => (
                        <div key={review.id} className="p-4 border border-gray-100 rounded-lg bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                    <Icon path="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" className="w-5 h-5 mr-2 text-gray-400" />
                                    <span className="font-semibold text-gray-800">{review.user}</span>
                                </div>
                                <StarRating rating={review.rating} />
                            </div>
                            <p className="text-sm text-gray-700">{review.text}</p>
                            <p className="text-xs text-gray-500 mt-2 text-right">{review.date}</p>
                            <div className="mt-3 pt-2 border-t text-right">
                                <button type="button" className="text-xs text-secondary hover:underline" onClick={(e) => { e.preventDefault(); console.log(`Replying to review ${review.id}`); }}>Reply</button>
                            </div>
                        </div>
                    ))}
                </div>
            </DashboardCard>
        </DashboardLayout>
    );
};

export default VendorRatingsReviews;
