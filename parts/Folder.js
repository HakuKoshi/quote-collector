const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
    name: { type: String, unique: true, required: true },
    quotes: { type: Array },
    images: { type: Array },
    credits: { type: Array },
    avatars: { type: Array }
})

const Folder = mongoose.model('Folder', folderSchema);

module.exports = Folder;