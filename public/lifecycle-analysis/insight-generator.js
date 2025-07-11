/**
 * Insight Generator Module
 * Bertanggung jawab untuk menghasilkan insights berdasarkan data produk
 */
class InsightGenerator {
    constructor(productManager) {
        this.productManager = productManager;
        this.insightContainer = document.getElementById('insightsContainer');
    }

    /**
     * Inisialisasi modul
     */
    async init() {
        console.log('Insight Generator initialized');
        // Inisialisasi container insights jika belum ada
        if (this.insightContainer) {
            this.insightContainer.innerHTML = '<div class="loading-placeholder">Memuat insights...</div>';
        }
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Generate insights berdasarkan data yang difilter
        this.generateInsights(filteredProducts, filteredHistory);
    }

    /**
     * Generate insights berdasarkan data produk dan histori lifecycle
     */
    generateInsights(products, history) {
        if (!this.insightContainer) return;
        // Normalisasi data produk dummy agar selalu punya field yang dibutuhkan
        const normalizedProducts = (products || []).map(p => ({
            id: p.id,
            name: p.name,
            segment: p.segment || '-',
            lifecycle_stage: p.lifecycle_stage || (p.stage || '-'),
            launch_date: p.launch_date || p.date || '-',
            category: p.category || '-'
        }));
        // Standar durasi rata-rata tiap stage (dalam bulan)
        const stageDurations = {
            'Introduction': 12,
            'Growth': 24,
            'Maturity': 36,
            'Decline': 18
        };
        const insights = [];
        const alerts = [];
        const now = new Date();
        normalizedProducts.forEach(product => {
            // Temukan histori lifecycle produk ini
            const productHistory = (history || []).filter(h => h.product_id === product.id);
            productHistory.sort((a, b) => new Date(a.date) - new Date(b.date));
            const lastStage = product.lifecycle_stage || (productHistory.length > 0 ? productHistory[productHistory.length-1].stage : null);
            const lastStageDate = productHistory.length > 0 ? new Date(productHistory[productHistory.length-1].date) : (product.launch_date && product.launch_date !== '-' ? new Date(product.launch_date) : null);
            if (!lastStage || !lastStageDate) return;
            const monthsInStage = Math.floor((now - lastStageDate) / (1000*60*60*24*30));
            const avgDuration = stageDurations[lastStage] || 12;
            const monthsToShift = avgDuration - monthsInStage;
            if (monthsToShift <= 3 && monthsToShift > 0) {
                alerts.push(`<b>${product.name}</b> diprediksi akan shifting dari <b>${lastStage}</b> ke stage berikutnya dalam ${monthsToShift} bulan lagi.`);
            } else if (monthsToShift <= 0) {
                alerts.push(`<b>${product.name}</b> seharusnya sudah shifting dari <b>${lastStage}</b>. Perlu evaluasi strategi!`);
            }
            let rekomendasi = '';
            switch(lastStage) {
                case 'Introduction':
                    rekomendasi = 'Fokus pada edukasi pasar dan promosi produk.';
                    break;
                case 'Growth':
                    rekomendasi = 'Perkuat distribusi dan tingkatkan kapasitas produksi.';
                    break;
                case 'Maturity':
                    rekomendasi = 'Inovasi fitur dan efisiensi biaya untuk mempertahankan pasar.';
                    break;
                case 'Decline':
                    rekomendasi = 'Evaluasi kemungkinan diversifikasi atau penghentian produk.';
                    break;
                default:
                    rekomendasi = 'Pantau perkembangan produk secara berkala.';
            }
            insights.push(`<b>${product.name}</b> (${lastStage}): ${rekomendasi}`);
        });
        this.insightContainer.innerHTML = `
            <div class="insight-card">
                <div class="insight-header">
                    <i class="fas fa-lightbulb"></i>
                    <h3>Insights & Recommendations</h3>
                </div>
                <div class="insight-body">
                    <h4>Strategic Recommendations</h4>
                    <ul>${insights.length ? insights.map(i => `<li>${i}</li>`).join('') : '<li>Tidak ada rekomendasi strategis saat ini.</li>'}</ul>
                    <h4>Lifecycle Shift Alerts</h4>
                    <ul>${alerts.length ? alerts.map(a => `<li>${a}</li>`).join('') : '<li>Tidak ada alert shifting lifecycle saat ini.</li>'}</ul>
                    <p>Total produk: ${normalizedProducts.length}</p>
                </div>
            </div>
        `;
    }
}

export { InsightGenerator };