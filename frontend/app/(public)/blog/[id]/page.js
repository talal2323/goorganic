'use client'

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/Icon';
import { COLORS, posts as POSTS } from '@/config/theme';
import { Button } from '@/components/common/UIComponents';

const BlogPostPage = ({ params }) => {
    const router = useRouter();
    const { id } = use(params);
    const post = POSTS.find(p => p.id === id);

    if (!post) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Blog Post Not Found</h1>
                <p className="text-gray-600 mb-6">The blog post you're looking for doesn't exist.</p>
                <Button onClick={() => router.push('/blog')}>Back to Blog</Button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen py-10">
            <article className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <Button
                        onClick={() => router.push('/blog')}
                        primary={false}
                        className="mb-4 flex items-center gap-2"
                    >
                        <Icon name="chevronLeft" className="w-4 h-4" />
                        Back to Blog
                    </Button>
                </div>

                {/* Featured Image */}
                <div className="w-full h-96 bg-gray-200 rounded-lg overflow-hidden mb-8">
                    <img
                        src={post.cover}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Post Content */}
                <div className="bg-white rounded-lg shadow-md p-8 md:p-12">
                    {/* Title */}
                    <h1 className="text-4xl font-bold mb-4" style={{ color: COLORS.primary }}>
                        {post.title}
                    </h1>

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6 pb-6 border-b">
                        <div className="flex items-center gap-2">
                            <Icon name="author" className="h-4 w-4 text-gray-400" stroke="#6b7280" />
                            <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Icon name="calendar" className="h-4 w-4 text-gray-400" stroke="#6b7280" />
                            <span>{new Date(post.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="text-xs bg-[#e6efe6] text-[#175017] px-2.5 py-0.5 rounded-full font-medium"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div className="bg-[#e6efe6] border-l-4 border-[#175017] p-4 mb-8 rounded">
                        <p className="text-gray-700 italic">{post.excerpt}</p>
                    </div>

                    {/* Content */}
                    <div className="prose prose-lg max-w-none">
                        {post.content ? (
                            <div className="text-gray-700 leading-relaxed space-y-4">
                                {post.content.split('\n\n').map((paragraph, index) => {
                                    // Check if it's a heading (starts with **)
                                    if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                        const headingText = paragraph.replace(/\*\*/g, '');
                                        return (
                                            <h2
                                                key={index}
                                                className="text-2xl font-bold mt-8 mb-4"
                                                style={{ color: COLORS.primary }}
                                            >
                                                {headingText}
                                            </h2>
                                        );
                                    }
                                    // Regular paragraph
                                    return (
                                        <p key={index} className="text-base leading-relaxed">
                                            {paragraph}
                                        </p>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-600">No content available for this post.</p>
                        )}
                    </div>

                    {/* Back Button */}
                    <div className="mt-12 pt-8 border-t">
                        <Button
                            onClick={() => router.push('/blog')}
                            className="w-full md:w-auto"
                        >
                            ← Back to All Posts
                        </Button>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default BlogPostPage;
