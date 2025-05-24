const { uploadImage } = require('../services/ipfs');

const uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        const file = req.file.buffer;
        const imageUrl = await uploadImage(file);
        res.json({ imageUrl });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { uploadFile };