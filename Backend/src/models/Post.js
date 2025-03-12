import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        fileUrl: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        },
        contentType: {
            type: String,
            required: true
        }
    },
    tags: {
        type: [String],
        default: []
    },
    assetType: {
        type: String,
        required: true
    },
    aiGenerated: {
        type: Boolean,
        default: false
    },
    color: {
        type: String,
        default: ''
    },
    people: {
        type: Boolean,
        default: false
    },
    fileType: {
        type: String,
        default: ''
    },
    style: {
        type: String,
        default: ''
    },
    orientation: {
        type: String,
        default: ''
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const Post = mongoose.model('Post', PostSchema);

export default Post;
