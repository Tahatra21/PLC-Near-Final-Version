/**
 * Advanced Metrics Module
 * Bertanggung jawab untuk menghitung dan menampilkan metrik-metrik lanjutan
 */
class AdvancedMetrics {
    constructor(productManager) {
        this.productManager = productManager;
        this.metricsContainer = document.getElementById('advancedMetricsContainer');
    }

    /**
     * Inisialisasi modul
     */
    async init() {
        console.log('Advanced Metrics module initialized');
        
        // Inisialisasi container metrik
        if (this.metricsContainer) {
            this.metricsContainer.innerHTML = '<div class="loading-placeholder">Memuat metrik lanjutan...</div>';
        }
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Hitung dan tampilkan metrik lanjutan
        this.calculateAdvancedMetrics(filteredProducts, filteredHistory);
    }

    /**
     * Hitung dan tampilkan metrik lanjutan
     */
    calculateAdvancedMetrics(filteredProducts, filteredHistory) {
        if (!this.metricsContainer) return;
        
        // Bersihkan container
        this.metricsContainer.innerHTML = '';
        
        // Hitung metrik-metrik lanjutan
        const metrics = {
            productLifecycleIndex: this.calculateProductLifecycleIndex(filteredProducts),
            innovationRate: this.calculateInnovationRate(filteredProducts, filteredHistory),
            marketPenetration: this.calculateMarketPenetration(filteredProducts),
            portfolioBalance: this.calculatePortfolioBalance(filteredProducts),
            transitionEfficiency: this.calculateTransitionEfficiency(filteredHistory)
        };
        
        // Buat kartu untuk setiap metrik
        const metricCards = `
            <div class="metrics-grid">
                ${this.createMetricCard('Product Lifecycle Index', metrics.productLifecycleIndex, 'Indeks yang menunjukkan kesehatan keseluruhan portfolio produk', 'fas fa-heartbeat')}
                ${this.createMetricCard('Innovation Rate', metrics.innovationRate, 'Tingkat inovasi berdasarkan produk baru dan transisi', 'fas fa-lightbulb')}
                ${this.createMetricCard('Market Penetration', metrics.marketPenetration, 'Estimasi penetrasi pasar berdasarkan tahap lifecycle', 'fas fa-chart-line')}
                ${this.createMetricCard('Portfolio Balance', metrics.portfolioBalance, 'Keseimbangan portfolio produk di berbagai tahap', 'fas fa-balance-scale')}
                ${this.createMetricCard('Transition Efficiency', metrics.transitionEfficiency, 'Efisiensi transisi produk antar tahap lifecycle', 'fas fa-exchange-alt')}
            </div>
        `;
        
        // Tampilkan metrik
        this.metricsContainer.innerHTML = metricCards;
    }

    /**
     * Buat kartu metrik
     */
    createMetricCard(title, value, description, icon) {
        // Tentukan kelas warna berdasarkan nilai
        let colorClass = 'neutral';
        if (value >= 80) colorClass = 'excellent';
        else if (value >= 60) colorClass = 'good';
        else if (value >= 40) colorClass = 'average';
        else if (value >= 20) colorClass = 'poor';
        else colorClass = 'critical';
        
        // Simpan template literal dalam variabel terlebih dahulu
        const cardHtml = `
            <div class="metric-card ${colorClass}">
                <div class="metric-icon">
                    <i class="${icon}"></i>
                </div>
                <div class="metric-content">
                    <h3>${title}</h3>
                    <div class="metric-value">${value.toFixed(1)}</div>
                    <div class="metric-description">${description}</div>
                </div>
            </div>
        `;
        
        return cardHtml;
    }

    /**
     * Hitung Product Lifecycle Index
     * Indeks yang menunjukkan kesehatan keseluruhan portfolio produk
     */
    calculateProductLifecycleIndex(products) {
        if (products.length === 0) return 50; // Nilai default
        
        // Hitung distribusi produk per tahap
        const introductionCount = products.filter(p => p.lifecycle_stage === 'Introduction').length;
        const growthCount = products.filter(p => p.lifecycle_stage === 'Growth').length;
        const maturityCount = products.filter(p => p.lifecycle_stage === 'Maturity').length;
        const declineCount = products.filter(p => p.lifecycle_stage === 'Decline').length;
        
        // Bobot untuk setiap tahap
        const weights = {
            Introduction: 0.3,
            Growth: 0.4,
            Maturity: 0.2,
            Decline: 0.1
        };
        
        // Hitung indeks berdasarkan distribusi dan bobot
        const totalProducts = products.length;
        const weightedSum = (
            (introductionCount / totalProducts) * weights.Introduction * 100 +
            (growthCount / totalProducts) * weights.Growth * 100 +
            (maturityCount / totalProducts) * weights.Maturity * 100 +
            (declineCount / totalProducts) * weights.Decline * 50 // Decline diberi nilai lebih rendah
        );
        
        // Normalisasi ke skala 0-100
        return Math.min(100, Math.max(0, weightedSum * 1.2));
    }

    /**
     * Hitung Innovation Rate
     * Tingkat inovasi berdasarkan produk baru dan transisi
     */
    calculateInnovationRate(products, history) {
        if (products.length === 0) return 50; // Nilai default
        
        // Hitung jumlah produk dalam tahap Introduction
        const introductionCount = products.filter(p => p.lifecycle_stage === 'Introduction').length;
        
        // Hitung jumlah transisi dari Introduction ke Growth dalam 6 bulan terakhir
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
        
        const recentTransitions = history.filter(h => 
            new Date(h.date) >= sixMonthsAgo && 
            h.previous_stage === 'Introduction' && 
            h.new_stage === 'Growth'
        ).length;
        
        // Bobot untuk komponen inovasi
        const introductionWeight = 0.6;
        const transitionWeight = 0.4;
        
        // Hitung skor berdasarkan produk Introduction dan transisi
        const introductionScore = (introductionCount / Math.max(1, products.length)) * 100;
        const transitionScore = (recentTransitions / Math.max(1, introductionCount)) * 100;
        
        // Hitung skor akhir dan simpan dalam variabel
        const finalScore = Math.min(100, Math.max(0, 
            introductionScore * introductionWeight + 
            transitionScore * transitionWeight
        ));
        
        return finalScore;
    }

    /**
     * Hitung Market Penetration
     * Estimasi penetrasi pasar berdasarkan tahap lifecycle
     */
    calculateMarketPenetration(products) {
        if (products.length === 0) return 50; // Nilai default
        
        // Hitung distribusi produk per tahap
        const growthCount = products.filter(p => p.lifecycle_stage === 'Growth').length;
        const maturityCount = products.filter(p => p.lifecycle_stage === 'Maturity').length;
        
        // Produk dalam tahap Growth dan Maturity biasanya memiliki penetrasi pasar yang lebih tinggi
        const penetrationScore = (
            (growthCount + maturityCount) / Math.max(1, products.length)
        ) * 100;
        
        // Sesuaikan skor berdasarkan jumlah total produk
        const scaleFactor = Math.min(1, products.length / 10); // Maksimal 10 produk untuk skala penuh
        
        return Math.min(100, Math.max(0, penetrationScore * scaleFactor + 40 * (1 - scaleFactor)));
    }

    /**
     * Hitung Portfolio Balance
     * Keseimbangan portfolio produk di berbagai tahap
     */
    calculatePortfolioBalance(products) {
        if (products.length === 0) return 50; // Nilai default
        
        // Distribusi ideal: 20% Introduction, 30% Growth, 40% Maturity, 10% Decline
        const idealDistribution = {
            Introduction: 0.2,
            Growth: 0.3,
            Maturity: 0.4,
            Decline: 0.1
        };
        
        // Hitung distribusi aktual
        const totalProducts = products.length;
        const actualDistribution = {
            Introduction: products.filter(p => p.lifecycle_stage === 'Introduction').length / totalProducts,
            Growth: products.filter(p => p.lifecycle_stage === 'Growth').length / totalProducts,
            Maturity: products.filter(p => p.lifecycle_stage === 'Maturity').length / totalProducts,
            Decline: products.filter(p => p.lifecycle_stage === 'Decline').length / totalProducts
        };
        
        // Hitung deviasi dari distribusi ideal
        const deviationSum = Object.keys(idealDistribution).reduce((sum, stage) => {
            return sum + Math.abs(idealDistribution[stage] - actualDistribution[stage]);
        }, 0);
        
        // Konversi deviasi ke skor (deviasi 0 = skor 100, deviasi 2 = skor 0)
        const balanceScore = 100 - (deviationSum * 50);
        
        return Math.min(100, Math.max(0, balanceScore));
    }

    /**
     * Hitung Transition Efficiency
     * Efisiensi transisi produk antar tahap lifecycle
     */
    calculateTransitionEfficiency(history) {
        if (history.length === 0) return 50; // Nilai default
        
        // Hitung rata-rata waktu transisi antar tahap
        const transitions = {};
        const transitionCounts = {};
        
        // Kelompokkan history berdasarkan product_id
        const productHistories = {};
        history.forEach(record => {
            if (!productHistories[record.product_id]) {
                productHistories[record.product_id] = [];
            }
            productHistories[record.product_id].push(record);
        });
        
        // Hitung waktu transisi untuk setiap produk
        Object.values(productHistories).forEach(records => {
            // Urutkan berdasarkan tanggal
            records.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Hitung waktu antar transisi
            for (let i = 1; i < records.length; i++) {
                const prevRecord = records[i-1];
                const currRecord = records[i];
                
                const transitionKey = `${prevRecord.new_stage}-${currRecord.new_stage}`;
                const transitionTime = new Date(currRecord.date) - new Date(prevRecord.date);
                
                // Konversi ke hari
                const transitionDays = transitionTime / (1000 * 60 * 60 * 24);
                
                if (!transitions[transitionKey]) {
                    transitions[transitionKey] = 0;
                    transitionCounts[transitionKey] = 0;
                }
                
                transitions[transitionKey] += transitionDays;
                transitionCounts[transitionKey]++;
            }
        });
        
        // Hitung rata-rata waktu transisi
        const avgTransitions = {};
        Object.keys(transitions).forEach(key => {
            avgTransitions[key] = transitions[key] / transitionCounts[key];
        });
        
        // Waktu transisi ideal (dalam hari)
        const idealTransitionTimes = {
            'Introduction-Growth': 180, // 6 bulan
            'Growth-Maturity': 365,    // 1 tahun
            'Maturity-Decline': 730     // 2 tahun
        };
        
        // Hitung efisiensi berdasarkan deviasi dari waktu ideal
        let efficiencyScore = 0;
        let transitionCount = 0;
        
        Object.keys(idealTransitionTimes).forEach(key => {
            if (avgTransitions[key]) {
                const ideal = idealTransitionTimes[key];
                const actual = avgTransitions[key];
                
                // Deviasi dari ideal (0 = sempurna)
                const deviation = Math.abs(actual - ideal) / ideal;
                
                // Konversi deviasi ke skor (deviasi 0 = skor 100, deviasi 1 = skor 0)
                const score = Math.max(0, 100 - (deviation * 100));
                
                efficiencyScore += score;
                transitionCount++;
            }
        });
        
        // Jika tidak ada transisi yang cocok, gunakan nilai default
        if (transitionCount === 0) return 50;
        
        return efficiencyScore / transitionCount;
    }
}

export { AdvancedMetrics };