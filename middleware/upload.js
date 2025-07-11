const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Pastikan direktori upload ada
fs.ensureDirSync(path.join(__dirname, '../public/uploads/materials'));
fs.ensureDirSync(path.join(__dirname, '../public/uploads/contracts'));

// Konfigurasi storage untuk materi product
const materialStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/materials'));
    },
    filename: function(req, file, cb) {
        // Gunakan timestamp untuk menghindari nama file yang sama
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'material-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Konfigurasi storage untuk kontrak product
const contractStorage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, path.join(__dirname, '../public/uploads/contracts'));
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'contract-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filter untuk hanya menerima file PDF
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed'), false);
    }
};

// Middleware untuk upload materi
const uploadMaterial = multer({ 
    storage: materialStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max size
});

// Middleware untuk upload kontrak
const uploadContract = multer({ 
    storage: contractStorage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB max size
});

module.exports = {
    uploadMaterial,
    uploadContract
};