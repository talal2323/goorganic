export const uploadFile = (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Please upload a file.' });
    }
    
    res.status(200).json({
        message: 'File uploaded successfully',
        public_id: req.file.filename,
        url: req.file.path,
    });
};