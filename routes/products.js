const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { uploadMaterial, uploadContract } = require('../middleware/upload');
const path = require('path');
const fs = require('fs-extra');

// Get all products
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all lifecycle history - MOVED BEFORE /:id ROUTE
router.get('/lifecycle-history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT lh.*, p.name as product_name, p.segment, p.category FROM lifecycle_history lh ' +
      'JOIN products p ON lh.product_id = p.id ' +
      'ORDER BY lh.change_date DESC'
    );
    
    // Pastikan format tanggal konsisten
    const formattedData = result.rows.map(row => ({
      ...row,
      change_date: new Date(row.change_date).toISOString()
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching lifecycle history:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Get product by ID - MOVED AFTER MORE SPECIFIC ROUTES
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new product
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, category, segment, lifecycle_stage, price, launch_date } = req.body;
    const created_by = req.user.id;
    
    const result = await pool.query(
      `INSERT INTO products (name, description, category, segment, lifecycle_stage, price, launch_date, created_by, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *`,
      [name, description, category, segment, lifecycle_stage, price, launch_date, created_by]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, segment, lifecycle_stage, price, launch_date } = req.body;
    const changed_by = req.user.id;
    
    // Get current product to track lifecycle changes
    const currentProduct = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (currentProduct.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    const result = await pool.query(
      `UPDATE products SET name = $1, description = $2, category = $3, segment = $4, lifecycle_stage = $5, 
       price = $6, launch_date = $7, updated_at = CURRENT_TIMESTAMP WHERE id = $8 RETURNING *`,
      [name, description, category, segment, lifecycle_stage, price, launch_date, id]
    );
    
    // Track lifecycle stage changes
    if (currentProduct.rows[0].lifecycle_stage !== lifecycle_stage) {
      await pool.query(
        'INSERT INTO lifecycle_history (product_id, previous_stage, new_stage) VALUES ($1, $2, $3)',
        [id, currentProduct.rows[0].lifecycle_stage, lifecycle_stage]
      );
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get lifecycle history for a product
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM lifecycle_history WHERE product_id = $1 ORDER BY change_date DESC',
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all lifecycle history
router.get('/lifecycle-history', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT lh.*, p.name as product_name, p.segment, p.category FROM lifecycle_history lh ' +
      'JOIN products p ON lh.product_id = p.id ' +
      'ORDER BY lh.change_date DESC'
    );
    
    // Pastikan format tanggal konsisten
    const formattedData = result.rows.map(row => ({
      ...row,
      change_date: new Date(row.change_date).toISOString()
    }));
    
    res.json(formattedData);
  } catch (err) {
    console.error('Error fetching lifecycle history:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Pastikan route /search berada SEBELUM route /:id
// Hapus atau komentari route search yang lama

// Search products - PINDAHKAN ROUTE INI SEBELUM ROUTE /:id
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const { term, lifecycle, segment } = req.query;
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];
    let paramIndex = 1;
    if (term) {
      params.push(`%${term}%`);
      params.push(`%${term}%`);
      params.push(`%${term}%`);
      params.push(`%${term}%`);
      query += ` AND (name LIKE $${paramIndex} OR description LIKE $${paramIndex+1} OR category LIKE $${paramIndex+2} OR segment LIKE $${paramIndex+3})`;
      paramIndex += 4;
    }
    if (lifecycle) {
      params.push(lifecycle);
      query += ` AND lifecycle_stage = $${paramIndex}`;
      paramIndex++;
    }
    if (segment) {
      params.push(segment);
      query += ` AND segment = $${paramIndex}`;
      paramIndex++;
    }
    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});

// Get product by ID - PINDAHKAN ROUTE INI SETELAH ROUTE /search
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload material attachment
router.post('/:id/material', authenticateToken, uploadMaterial.single('material'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Jika tidak ada file yang diupload
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Dapatkan produk saat ini untuk menghapus file lama jika ada
        const currentProduct = await pool.query('SELECT material_attachment FROM products WHERE id = $1', [id]);
        
        if (currentProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Hapus file lama jika ada
        const oldAttachment = currentProduct.rows[0].material_attachment;
        if (oldAttachment) {
            const oldFilePath = path.join(__dirname, '../public', oldAttachment);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
        
        // Path relatif untuk disimpan di database
        const relativePath = `/uploads/materials/${req.file.filename}`;
        
        // Update database dengan path file baru
        const result = await pool.query(
            'UPDATE products SET material_attachment = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [relativePath, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error uploading material:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Upload contract attachment
router.post('/:id/contract', authenticateToken, uploadContract.single('contract'), async (req, res) => {
    try {
        const { id } = req.params;
        
        // Jika tidak ada file yang diupload
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        
        // Dapatkan produk saat ini untuk menghapus file lama jika ada
        const currentProduct = await pool.query('SELECT contract_attachment FROM products WHERE id = $1', [id]);
        
        if (currentProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Hapus file lama jika ada
        const oldAttachment = currentProduct.rows[0].contract_attachment;
        if (oldAttachment) {
            const oldFilePath = path.join(__dirname, '../public', oldAttachment);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
        
        // Path relatif untuk disimpan di database
        const relativePath = `/uploads/contracts/${req.file.filename}`;
        
        // Update database dengan path file baru
        const result = await pool.query(
            'UPDATE products SET contract_attachment = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [relativePath, id]
        );
        
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error uploading contract:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Delete material attachment
router.delete('/:id/material', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Dapatkan produk saat ini
        const currentProduct = await pool.query('SELECT material_attachment FROM products WHERE id = $1', [id]);
        
        if (currentProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Hapus file jika ada
        const attachment = currentProduct.rows[0].material_attachment;
        if (attachment) {
            const filePath = path.join(__dirname, '../public', attachment);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Update database
        await pool.query(
            'UPDATE products SET material_attachment = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        
        res.json({ message: 'Material attachment deleted successfully' });
    } catch (err) {
        console.error('Error deleting material attachment:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

// Delete contract attachment
router.delete('/:id/contract', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Dapatkan produk saat ini
        const currentProduct = await pool.query('SELECT contract_attachment FROM products WHERE id = $1', [id]);
        
        if (currentProduct.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        // Hapus file jika ada
        const attachment = currentProduct.rows[0].contract_attachment;
        if (attachment) {
            const filePath = path.join(__dirname, '../public', attachment);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
        
        // Update database
        await pool.query(
            'UPDATE products SET contract_attachment = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [id]
        );
        
        res.json({ message: 'Contract attachment deleted successfully' });
    } catch (err) {
        console.error('Error deleting contract attachment:', err);
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;