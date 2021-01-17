const path = require('path')
const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const server = express()
const port = 3333
const MAX_FILE_SIZE = 1024 * 1024 * 10
const diskStorage = multer.diskStorage({
    destination(_request, _file, callback) {
        callback(null, path.resolve(__dirname, '..', 'tmp'))
    },
    filename(_request, file, callback) {
        const now = new Date()
        callback(null, `${now.getTime()}-${file.originalname}`);
    }
})
const uploader = multer({
    storage: {
        _handleFile(request, file, callback) {
            const MAX_WIDTH_IMAGE = 1000;
            const transform = sharp().resize({
              width: MAX_WIDTH_IMAGE,
              withoutEnlargement: true,
            });
            const transformed = { ...file, stream: file.stream.pipe(transform) };
            diskStorage._handleFile(request, transformed, callback);
        },
        _removeFile: diskStorage._removeFile
    },
    fileFilter(_request, file, callback) {
        const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png'];
        const isAllowed = allowedMimes.includes(file.mimetype);
        if (!isAllowed) {
            callback(new Error('Ivalid file type. Allowed: JPEG and PNG'), false);
        } else {
            callback(null, true);
        }
    },
    limits: {
        fileSize: MAX_FILE_SIZE
    }
})

server.post('/upload', uploader.single('imageName'), (request, response) => {
    response.json(request.file)
})

server.listen(port, () => console.log('Server is running'))