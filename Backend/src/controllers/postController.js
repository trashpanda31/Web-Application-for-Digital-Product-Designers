import multer from 'multer';
import AWS from 'aws-sdk';
import Post from '../models/Post.js';
import crypto from 'crypto';

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

const upload = multer({ storage: multer.memoryStorage() }).single('image');

const uploadFileToS3 = async (file) => {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `uploads/${file.originalname}`,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    const s3Response = await s3.upload(params).promise();
    return s3Response.Location;  // URL файла на S3
};

export const createPost = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: 'Error uploading file', error: err });
        }

        const file = req.file;

        try {
            const fileUrl = await uploadFileToS3(file);  // Загружаем файл на S3

            const newPost = new Post({
                title: req.body.title,
                description: req.body.description,
                image: {
                    fileUrl: fileUrl,  // Ссылка на файл на S3
                    filename: file.originalname,
                    contentType: file.mimetype,
                },
                tags: req.body.tags,
                assetType: req.body.assetType,
                aiGenerated: req.body.aiGenerated,
                color: req.body.color,
                people: req.body.people,
                fileType: req.body.fileType,
                style: req.body.style,
                orientation: req.body.orientation,
            });

            await newPost.save();
            res.status(201).json({ message: 'Post created successfully', post: newPost });
        } catch (error) {
            res.status(500).json({ message: 'Error uploading to S3', error: error.message });
        }
    });
};

// Поиск по названию
export const searchPostsByTitle = async (req, res) => {
    try {
        const { query } = req.query;
        const posts = await Post.find({ title: { $regex: query, $options: 'i' } });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Фильтрация постов
export const filterPosts = async (req, res) => {
    const { tags, assetType, aiGenerated, color, people, fileType, style, orientation } = req.query;

    const filter = {};
    if (tags) filter.tags = { $in: tags };
    if (assetType) filter.assetType = assetType;
    if (aiGenerated) filter.aiGenerated = aiGenerated;
    if (color) filter.color = color;
    if (people) filter.people = people;
    if (fileType) filter.fileType = fileType;
    if (style) filter.style = style;
    if (orientation) filter.orientation = orientation;

    try {
        const posts = await Post.find(filter);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Сортировка постов
export const sortPosts = async (req, res) => {
    const { sortBy } = req.query;

    let sortCriteria = {};
    if (sortBy === 'recent') {
        sortCriteria = { createdAt: -1 };
    } else if (sortBy === 'popular') {
        sortCriteria = { likes: -1 };
    }

    try {
        const posts = await Post.find().sort(sortCriteria);
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Поиск постов по изображению
export const searchPostsByImage = async (req, res) => {
    const { image } = req.files;
    const imageHash = generateImageHash(image);

    try {
        const posts = await Post.find({ imageHash });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Перенаправление на Google для поиска по изображению
export const redirectToGoogleImageSearch = (req, res) => {
    const { image } = req.files;
    const base64Image = image.buffer.toString('base64');
    const googleSearchUrl = `https://www.google.com/searchbyimage?image_url=data:image/jpeg;base64,${base64Image}`;

    res.redirect(googleSearchUrl);
};

// Генерация хеша изображения
const generateImageHash = (image) => {
    const hash = crypto.createHash('sha256');
    hash.update(image.buffer);
    return hash.digest('hex');
};
