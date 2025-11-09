'use client'

import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/Icon';
import { COLORS, posts as POSTS } from '@/config/theme';

const BlogCard = ({ post }) => {
    return (
        <article className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="h-48 bg-gray-100 overflow-hidden">
                <img src={post.cover} alt={post.title} className="w-full h-full object-cover" />
            </div>
            <div className="p-5">
                <h3 className="text-xl font-semibold mb-2" style={{ color: COLORS.text }}>{post.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{post.excerpt}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-1"><Icon name="author" className="h-4 w-4 text-gray-400" stroke="#6b7280" /><span>{post.author}</span></div>
                        <div className="flex items-center space-x-1"><Icon name="calendar" className="h-4 w-4 text-gray-400" stroke="#6b7280" /><span>{new Date(post.date).toLocaleDateString()}</span></div>
                    </div>
                    <div className="flex space-x-2">{post.tags.map((t) => (<span key={t} className="text-xs bg-[#e6efe6] text-[#175017] px-2 py-1 rounded-full">{t}</span>))}</div>
                </div>
            </div>
        </article>
    );
};

const BlogPage = () => {
    const [query, setQuery] = useState('');
    const [tagFilter, setTagFilter] = useState('All');

    const allTags = useMemo(() => { const s = new Set(); POSTS.forEach((p) => p.tags.forEach((t) => s.add(t))); return ['All', ...Array.from(s)]; }, []);

    const filtered = useMemo(() => { return POSTS.filter((p) => { const matchesQuery = !query || p.title.toLowerCase().includes(query.toLowerCase()) || p.excerpt.toLowerCase().includes(query.toLowerCase()); const matchesTag = tagFilter === 'All' || p.tags.includes(tagFilter); return matchesQuery && matchesTag; }); }, [query, tagFilter]);

    return (
        <div className="container mx-auto px-4 py-10">
            <div className="max-w-4xl mx-auto text-center mb-10"><h1 className="text-3xl font-bold" style={{ color: COLORS.primary }}>Go Organic Blog</h1><p className="text-gray-600 mt-2">Insights, guides and stories about sustainable living and organic food.</p></div>
            <div className="max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row md:items:center md:justify-between gap-4 mb-6">
                    <div className="flex items-center bg-white rounded shadow-sm px-3 py-2 w-full md:w-2/3"><Icon name="search" className="h-5 w-5 text-gray-400 mr-3" stroke="#6b7280" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search posts, keywords..." className="w-full outline-none text-sm" /></div>
                    <div className="flex items-center space-x-3"><select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} className="px-3 py-2 border rounded bg-white text-sm" style={{ borderColor: '#e6efe6' }}>{allTags.map((t) => <option key={t} value={t}>{t}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{filtered.map((post) => <BlogCard key={post.id} post={post} />)}</div>
            </div>
        </div>
    );
};

export default BlogPage;
