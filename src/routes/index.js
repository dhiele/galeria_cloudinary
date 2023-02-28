const { Router } = require('express');
const router = Router();

const Photo = require('../models/foto');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const fs = require('fs-extra');

router.get('/', async (req, res) => {
    const photos = await Photo.find().lean();
    res.render('image', {photos});
});

router.get('/images/add', async (req, res) => {
    const photos = await Photo.find().lean();
    res.render('imageForm', {photos});
});

router.post('/images/add', async (req, res) => {
    const { title, description } = req.body;
    const result = await cloudinary.uploader.upload(req.file.path);
    const newPhoto = new Photo({
        title,
        description,
        imageURL: result.url,
        public_id: result.public_id
    });
    await newPhoto.save();
    await fs.unlink(req.file.path);

    res.redirect('/');
});

router.get('/images/delete/:photo_id', async (req, res) => {
    const { photo_id } = req.params;
    const photo = await Photo.findByIdAndDelete(photo_id);
    const result = await cloudinary.uploader.destroy(photo.public_id);
    console.log(result);
    res.redirect('/images/add');
});

module.exports = router;