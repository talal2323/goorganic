import FAQ from '../models/faqModel.js';

//    Create a new FAQ
export const createFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ message: 'Both question and answer are required.' });
        }
        const faq = await FAQ.create({ question, answer });
        res.status(201).json(faq);
    } catch (error) {
        res.status(400).json({ message: 'Error creating FAQ. Question may already exist.' });
    }
};

//   Get all FAQs
export const getAllFaqs = async (req, res) => {
    try {
        const faqs = await FAQ.find({}).sort({ createdAt: 1 });
        res.status(200).json(faqs);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

//   Update an FAQ
export const updateFaq = async (req, res) => {
    try {
        const { question, answer } = req.body;
        const faq = await FAQ.findByIdAndUpdate(req.params.id, { question, answer }, {
            new: true,
            runValidators: true
        });

        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found.' });
        }
        res.status(200).json(faq);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//   Delete an FAQ
export const deleteFaq = async (req, res) => {
    try {
        const faq = await FAQ.findById(req.params.id);
        if (!faq) {
            return res.status(404).json({ message: 'FAQ not found.' });
        }
        
        await faq.deleteOne();
        res.status(200).json({ message: 'FAQ deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};