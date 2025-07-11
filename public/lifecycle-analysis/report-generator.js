/**
 * Report Generator Module
 * Bertanggung jawab untuk menghasilkan laporan berdasarkan data produk
 */
class ReportGenerator {
    constructor(productManager) {
        this.productManager = productManager;
    }

    /**
     * Inisialisasi modul
     */
    async init() {
        console.log('Report Generator initialized');
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Tidak ada yang perlu diupdate untuk report generator
    }

    /**
     * Generate laporan berdasarkan data produk
     */
    generateReport() {
        console.log('Generating report...');
        
        // Dapatkan data produk
        const products = this.productManager.products;
        
        // Buat konten laporan sederhana
        let reportContent = `
            <h1>Product Lifecycle Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            <h2>Summary</h2>
            <p>Total Products: ${products.length}</p>
        `;
        
        // Hitung jumlah produk per tahap
        const stages = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0
        };
        
        products.forEach(product => {
            stages[product.lifecycle_stage]++;
        });
        
        reportContent += `
            <h2>Lifecycle Stage Distribution</h2>
            <ul>
                <li>Introduction: ${stages.Introduction} products</li>
                <li>Growth: ${stages.Growth} products</li>
                <li>Maturity: ${stages.Maturity} products</li>
                <li>Decline: ${stages.Decline} products</li>
            </ul>
        `;
        
        // Tampilkan laporan dalam jendela baru
        const reportWindow = window.open('', '_blank');
        reportWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Product Lifecycle Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    h1 { color: #333; }
                    h2 { color: #666; margin-top: 20px; }
                    ul { list-style-type: none; padding: 0; }
                    li { margin: 5px 0; }
                </style>
            </head>
            <body>
                ${reportContent}
            </body>
            </html>
        `);
        reportWindow.document.close();
    }
}

export { ReportGenerator };