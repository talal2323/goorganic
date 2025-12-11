import User from '../models/userModel.js';
import sendEmail from '../utils/sendEmail.js';

// @desc    Send contact form message to admins
// @route   POST /api/v1/contact
// @access  Public
export const sendContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validate required fields
        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                message: 'Please provide all required fields: name, email, subject, and message'
            });
        }

        // Get all admin emails
        const admins = await User.find({ roles: 'admin' }).select('email name');

        if (!admins || admins.length === 0) {
            return res.status(500).json({
                message: 'No administrators found. Please try again later.'
            });
        }

        // Send email to all admins
        const emailPromises = admins.map(admin =>
            sendEmail({
                email: admin.email,
                subject: `📩 New Contact Form Message: ${subject}`,
                message: `Dear ${admin.name},\n\nYou have received a new message from the GOorganic contact form.\n\nFrom: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}\n\n---\nPlease respond to the customer at: ${email}\n\nBest regards,\nGOorganic System`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
                        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <h2 style="color: #2d6a4f; margin-top: 0;">📩 New Contact Form Message</h2>
                            <p style="font-size: 16px; color: #374151;">Dear ${admin.name},</p>
                            <p style="font-size: 16px; color: #374151;">You have received a new message from the GOorganic contact form.</p>
                            
                            <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2d6a4f;">
                                <h4 style="color: #065f46; margin-top: 0;">Customer Details:</h4>
                                <p style="margin: 5px 0; color: #374151;"><strong>Name:</strong> ${name}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Email:</strong> ${email}</p>
                                <p style="margin: 5px 0; color: #374151;"><strong>Subject:</strong> ${subject}</p>
                            </div>
                            
                            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                                <h4 style="color: #374151; margin-top: 0;">Message:</h4>
                                <p style="margin: 0; color: #6b7280; white-space: pre-wrap;">${message}</p>
                            </div>
                            
                            <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                <p style="margin: 0; color: #92400e; font-size: 14px;">
                                    <strong>Action Required:</strong> Please respond to the customer at 
                                    <a href="mailto:${email}" style="color: #065f46;">${email}</a>
                                </p>
                            </div>
                            
                            <p style="font-size: 14px; color: #6b7280; margin-top: 30px; text-align: center;">
                                Best regards,<br/>GOorganic System
                            </p>
                        </div>
                    </div>
                `
            })
        );

        await Promise.all(emailPromises);

        res.status(200).json({
            message: 'Your message has been sent successfully! We will get back to you within 24-48 hours.'
        });

    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({
            message: 'Failed to send message. Please try again later or contact us directly via email.',
            error: error.message
        });
    }
};
