import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true,
        unique: true,
    },
    answer: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const FAQ = mongoose.model('FAQ', faqSchema);

export default FAQ;