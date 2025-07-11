/**
 * Strategic Recommendation Engine
 * Bertanggung jawab untuk menghasilkan rekomendasi strategis berdasarkan analisis lifecycle produk
 */
class RecommendationEngine {
    constructor(productManager) {
        this.productManager = productManager;
        this.insightContainer = document.getElementById('lifecycleInsights');
    }

    /**
     * Inisialisasi modul
     */
    async init() {
        console.log('Recommendation Engine initialized');
        // Inisialisasi container insights jika belum ada
        if (this.insightContainer) {
            this.insightContainer.innerHTML = '<div class="loading-placeholder">Memuat rekomendasi...</div>';
        }
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Generate rekomendasi berdasarkan data yang difilter
        this.generateRecommendations(filteredProducts, filteredHistory);
    }

    /**
     * Menghasilkan rekomendasi strategis berdasarkan data produk dan history
     */
    generateRecommendations(products, history) {
        if (!this.insightContainer) return;

        // Bersihkan container
        this.insightContainer.innerHTML = '';

        // Hitung distribusi produk per tahap
        const stageDistribution = this.calculateStageDistribution(products);
        
        // Hitung tren transisi dari history
        const transitionTrends = this.calculateTransitionTrends(history);
        
        // Dapatkan rekomendasi per tahap
        const stageRecommendations = this.getStageSpecificRecommendations(stageDistribution, products);
        
        // Dapatkan rekomendasi berdasarkan tren historis
        const trendRecommendations = this.getTrendBasedRecommendations(transitionTrends, products);
        
        // Dapatkan rekomendasi portofolio
        const portfolioRecommendations = this.getPortfolioRecommendations(stageDistribution);
        
        // Tampilkan semua rekomendasi
        this.displayRecommendations(stageRecommendations, trendRecommendations, portfolioRecommendations);
    }

    /**
     * Menghitung distribusi produk per tahap
     */
    calculateStageDistribution(products) {
        const distribution = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0,
            total: products.length
        };

        products.forEach(product => {
            distribution[product.lifecycle_stage]++;
        });

        // Hitung persentase
        Object.keys(distribution).forEach(stage => {
            if (stage !== 'total') {
                distribution[`${stage}Percent`] = distribution.total > 0 ? 
                    Math.round((distribution[stage] / distribution.total) * 100) : 0;
            }
        });

        return distribution;
    }

    /**
     * Menghitung tren transisi dari data history
     */
    calculateTransitionTrends(history) {
        const trends = {
            accelerating: [], // Produk dengan transisi yang semakin cepat
            slowing: [],     // Produk dengan transisi yang melambat
            stagnant: []     // Produk yang stagnan di tahap tertentu
        };

        // Kelompokkan history berdasarkan product_id
        const productHistory = {};
        history.forEach(item => {
            if (!productHistory[item.product_id]) {
                productHistory[item.product_id] = [];
            }
            productHistory[item.product_id].push(item);
        });

        // Analisis tren untuk setiap produk
        Object.entries(productHistory).forEach(([productId, items]) => {
            // Urutkan berdasarkan tanggal
            items.sort((a, b) => new Date(a.change_date) - new Date(b.change_date));
            
            // Jika produk memiliki lebih dari 1 transisi, kita bisa menganalisis tren
            if (items.length > 1) {
                // Hitung waktu antar transisi
                const transitionTimes = [];
                for (let i = 1; i < items.length; i++) {
                    const prevDate = new Date(items[i-1].change_date);
                    const currDate = new Date(items[i].change_date);
                    const days = Math.round((currDate - prevDate) / (1000 * 60 * 60 * 24));
                    transitionTimes.push({
                        from: items[i-1].previous_stage,
                        to: items[i-1].new_stage,
                        days: days,
                        productId: parseInt(productId)
                    });
                }
                
                // Analisis tren waktu transisi
                if (transitionTimes.length > 1) {
                    const firstTransition = transitionTimes[0].days;
                    const lastTransition = transitionTimes[transitionTimes.length - 1].days;
                    
                    if (lastTransition < firstTransition * 0.8) {
                        trends.accelerating.push(parseInt(productId));
                    } else if (lastTransition > firstTransition * 1.2) {
                        trends.slowing.push(parseInt(productId));
                    }
                }
            } else if (items.length === 1) {
                // Cek apakah produk stagnan di tahap tertentu
                const transitionDate = new Date(items[0].change_date);
                const now = new Date();
                const daysSinceTransition = Math.round((now - transitionDate) / (1000 * 60 * 60 * 24));
                
                // Jika produk berada di tahap yang sama selama lebih dari 180 hari (6 bulan)
                if (daysSinceTransition > 180) {
                    trends.stagnant.push(parseInt(productId));
                }
            }
        });

        return trends;
    }

    /**
     * Mendapatkan rekomendasi spesifik per tahap
     */
    getStageSpecificRecommendations(distribution, products) {
        const recommendations = {
            Introduction: [],
            Growth: [],
            Maturity: [],
            Decline: []
        };

        // Rekomendasi untuk tahap Introduction
        if (distribution.Introduction > 0) {
            recommendations.Introduction.push({
                title: 'Strategi Penetrasi Pasar',
                description: `Fokus pada ${distribution.Introduction} produk di tahap Introduction dengan meningkatkan awareness dan edukasi pasar.`,
                action: 'Tingkatkan aktivitas marketing dan edukasi untuk memperkenalkan produk ke target pasar yang lebih luas.'
            });
            
            recommendations.Introduction.push({
                title: 'Pengembangan Fitur',
                description: 'Kumpulkan feedback awal dan prioritaskan pengembangan fitur yang paling dibutuhkan pasar.',
                action: 'Lakukan survei pengguna dan analisis kompetitor untuk mengidentifikasi fitur yang perlu diprioritaskan.'
            });
            
            if (distribution.IntroductionPercent > 30) {
                recommendations.Introduction.push({
                    title: 'Peringatan Portofolio',
                    description: `Portofolio memiliki ${distribution.IntroductionPercent}% produk di tahap Introduction, yang berisiko tinggi.`,
                    action: 'Pertimbangkan untuk menyeimbangkan portofolio dengan mengurangi jumlah produk baru dan fokus pada produk yang paling menjanjikan.'
                });
            }
        }

        // Rekomendasi untuk tahap Growth
        if (distribution.Growth > 0) {
            recommendations.Growth.push({
                title: 'Optimasi Skalabilitas',
                description: `Pastikan ${distribution.Growth} produk di tahap Growth dapat diskalakan untuk memenuhi peningkatan permintaan.`,
                action: 'Evaluasi infrastruktur dan proses produksi untuk memastikan dapat menangani pertumbuhan volume.'
            });
            
            recommendations.Growth.push({
                title: 'Ekspansi Pasar',
                description: 'Identifikasi segmen pasar baru dan peluang ekspansi geografis.',
                action: 'Lakukan analisis pasar untuk mengidentifikasi segmen atau wilayah baru yang potensial.'
            });
            
            if (distribution.GrowthPercent > 40) {
                recommendations.Growth.push({
                    title: 'Fokus Investasi',
                    description: `Dengan ${distribution.GrowthPercent}% produk di tahap Growth, alokasikan sumber daya untuk memaksimalkan pertumbuhan.`,
                    action: 'Tingkatkan anggaran marketing dan pengembangan untuk produk-produk di tahap Growth.'
                });
            }
        }

        // Rekomendasi untuk tahap Maturity
        if (distribution.Maturity > 0) {
            recommendations.Maturity.push({
                title: 'Diferensiasi Produk',
                description: `Pertahankan relevansi ${distribution.Maturity} produk di tahap Maturity dengan inovasi inkremental.`,
                action: 'Lakukan pembaruan fitur dan desain untuk membedakan produk dari kompetitor.'
            });
            
            recommendations.Maturity.push({
                title: 'Optimasi Margin',
                description: 'Fokus pada efisiensi operasional dan optimasi biaya untuk memaksimalkan profitabilitas.',
                action: 'Evaluasi rantai pasok dan proses produksi untuk mengidentifikasi peluang pengurangan biaya.'
            });
            
            if (distribution.MaturityPercent > 50) {
                recommendations.Maturity.push({
                    title: 'Peringatan Inovasi',
                    description: `Dengan ${distribution.MaturityPercent}% produk di tahap Maturity, portofolio berisiko kehilangan relevansi di masa depan.`,
                    action: 'Tingkatkan investasi R&D untuk mengembangkan produk baru yang inovatif.'
                });
            }
        }

        // Rekomendasi untuk tahap Decline
        if (distribution.Decline > 0) {
            recommendations.Decline.push({
                title: 'Strategi Harvesting',
                description: `Maksimalkan nilai sisa dari ${distribution.Decline} produk di tahap Decline.`,
                action: 'Kurangi investasi marketing dan fokus pada pelanggan loyal yang masih menggunakan produk.'
            });
            
            recommendations.Decline.push({
                title: 'Evaluasi Penghentian',
                description: 'Identifikasi produk yang sudah tidak menguntungkan untuk dihentikan.',
                action: 'Lakukan analisis profitabilitas dan tentukan timeline untuk penghentian produk yang tidak menguntungkan.'
            });
            
            if (distribution.DeclinePercent > 20) {
                recommendations.Decline.push({
                    title: 'Peringatan Pendapatan',
                    description: `Dengan ${distribution.DeclinePercent}% produk di tahap Decline, pendapatan masa depan berisiko menurun signifikan.`,
                    action: 'Percepat pengembangan produk baru dan akuisisi untuk menggantikan pendapatan dari produk yang menurun.'
                });
            }
        }

        return recommendations;
    }

    /**
     * Mendapatkan rekomendasi berdasarkan tren historis
     */
    getTrendBasedRecommendations(trends, products) {
        const recommendations = [];

        // Rekomendasi untuk produk dengan transisi yang semakin cepat
        if (trends.accelerating.length > 0) {
            const acceleratingProducts = products.filter(p => trends.accelerating.includes(p.id));
            const stages = this.groupProductsByStage(acceleratingProducts);
            
            recommendations.push({
                title: 'Produk dengan Siklus Cepat',
                description: `${trends.accelerating.length} produk menunjukkan percepatan transisi antar tahap lifecycle.`,
                action: 'Siapkan strategi untuk mengantisipasi perubahan tahap yang lebih cepat, terutama untuk produk di tahap ' + 
                       Object.keys(stages).filter(stage => stages[stage].length > 0).join(', ') + '.'
            });
        }

        // Rekomendasi untuk produk dengan transisi yang melambat
        if (trends.slowing.length > 0) {
            const slowingProducts = products.filter(p => trends.slowing.includes(p.id));
            const stages = this.groupProductsByStage(slowingProducts);
            
            recommendations.push({
                title: 'Produk dengan Perlambatan',
                description: `${trends.slowing.length} produk menunjukkan perlambatan dalam transisi antar tahap lifecycle.`,
                action: 'Identifikasi faktor yang menyebabkan perlambatan dan intervensi untuk produk di tahap ' + 
                       Object.keys(stages).filter(stage => stages[stage].length > 0).join(', ') + '.'
            });
        }

        // Rekomendasi untuk produk yang stagnan
        if (trends.stagnant.length > 0) {
            const stagnantProducts = products.filter(p => trends.stagnant.includes(p.id));
            const stages = this.groupProductsByStage(stagnantProducts);
            
            recommendations.push({
                title: 'Produk Stagnan',
                description: `${trends.stagnant.length} produk telah stagnan di tahap mereka saat ini selama lebih dari 6 bulan.`,
                action: 'Evaluasi produk stagnan di tahap ' + 
                       Object.keys(stages).filter(stage => stages[stage].length > 0).join(', ') + 
                       ' dan tentukan apakah perlu intervensi atau transisi ke tahap berikutnya.'
            });
        }

        return recommendations;
    }

    /**
     * Mendapatkan rekomendasi portofolio secara keseluruhan
     */
    getPortfolioRecommendations(distribution) {
        const recommendations = [];

        // Evaluasi keseimbangan portofolio
        const stagePercentages = {
            Introduction: distribution.IntroductionPercent,
            Growth: distribution.GrowthPercent,
            Maturity: distribution.MaturityPercent,
            Decline: distribution.DeclinePercent
        };

        // Rekomendasi berdasarkan keseimbangan portofolio
        const highestStage = Object.keys(stagePercentages).reduce((a, b) => 
            stagePercentages[a] > stagePercentages[b] ? a : b);
        const lowestStage = Object.keys(stagePercentages).reduce((a, b) => 
            stagePercentages[a] < stagePercentages[b] ? a : b);

        // Jika ada ketidakseimbangan signifikan
        if (stagePercentages[highestStage] > 50) {
            recommendations.push({
                title: 'Ketidakseimbangan Portofolio',
                description: `Portofolio didominasi oleh produk di tahap ${highestStage} (${stagePercentages[highestStage]}%).`,
                action: `Diversifikasi portofolio dengan ${highestStage === 'Introduction' || highestStage === 'Growth' ? 
                    'mengembangkan produk yang lebih stabil' : 'meningkatkan inovasi dan produk baru'}.`
            });
        }

        // Jika ada tahap yang sangat rendah
        if (stagePercentages[lowestStage] < 10 && distribution.total > 5) {
            recommendations.push({
                title: 'Kesenjangan Portofolio',
                description: `Portofolio memiliki sangat sedikit produk di tahap ${lowestStage} (${stagePercentages[lowestStage]}%).`,
                action: `${lowestStage === 'Introduction' ? 'Tingkatkan inovasi dan pengembangan produk baru' : 
                        lowestStage === 'Growth' ? 'Fokus pada strategi pertumbuhan untuk produk yang menjanjikan' : 
                        lowestStage === 'Maturity' ? 'Stabilkan produk yang sedang bertumbuh' : 
                        'Evaluasi produk yang mendekati akhir siklus hidup'}.`
            });
        }

        // Rekomendasi berdasarkan jumlah total produk
        if (distribution.total < 3) {
            recommendations.push({
                title: 'Portofolio Terbatas',
                description: `Portofolio hanya memiliki ${distribution.total} produk, yang meningkatkan risiko bisnis.`,
                action: 'Pertimbangkan untuk mengembangkan atau mengakuisisi produk baru untuk mendiversifikasi risiko.'
            });
        } else if (distribution.total > 20 && (distribution.Introduction + distribution.Growth) > distribution.total * 0.7) {
            recommendations.push({
                title: 'Portofolio Overextended',
                description: `Portofolio memiliki terlalu banyak produk di tahap awal (${distribution.Introduction + distribution.Growth} dari ${distribution.total}).`,
                action: 'Prioritaskan dan fokus pada produk yang paling menjanjikan, pertimbangkan untuk menghentikan proyek dengan prospek rendah.'
            });
        }

        return recommendations;
    }

    /**
     * Mengelompokkan produk berdasarkan tahap lifecycle
     */
    groupProductsByStage(products) {
        const stages = {
            Introduction: [],
            Growth: [],
            Maturity: [],
            Decline: []
        };

        products.forEach(product => {
            stages[product.lifecycle_stage].push(product);
        });

        return stages;
    }

    /**
     * Menampilkan rekomendasi ke UI
     */
    displayRecommendations(stageRecommendations, trendRecommendations, portfolioRecommendations) {
        if (!this.insightContainer) return;

        // Bersihkan container
        this.insightContainer.innerHTML = '';

        // Tambahkan rekomendasi portofolio
        if (portfolioRecommendations.length > 0) {
            const portfolioSection = document.createElement('div');
            portfolioSection.className = 'insight-section';
            portfolioSection.innerHTML = `<h4>Rekomendasi Portofolio</h4>`;
            
            const portfolioList = document.createElement('div');
            portfolioList.className = 'insight-list';
            
            portfolioRecommendations.forEach(rec => {
                const card = this.createInsightCard(rec, 'portfolio');
                portfolioList.appendChild(card);
            });
            
            portfolioSection.appendChild(portfolioList);
            this.insightContainer.appendChild(portfolioSection);
        }

        // Tambahkan rekomendasi berdasarkan tren
        if (trendRecommendations.length > 0) {
            const trendSection = document.createElement('div');
            trendSection.className = 'insight-section';
            trendSection.innerHTML = `<h4>Rekomendasi Berdasarkan Tren</h4>`;
            
            const trendList = document.createElement('div');
            trendList.className = 'insight-list';
            
            trendRecommendations.forEach(rec => {
                const card = this.createInsightCard(rec, 'trend');
                trendList.appendChild(card);
            });
            
            trendSection.appendChild(trendList);
            this.insightContainer.appendChild(trendSection);
        }

        // Tambahkan rekomendasi per tahap
        const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
        stages.forEach(stage => {
            const recommendations = stageRecommendations[stage];
            if (recommendations && recommendations.length > 0) {
                const stageSection = document.createElement('div');
                stageSection.className = 'insight-section';
                stageSection.innerHTML = `<h4>Rekomendasi untuk Tahap ${stage}</h4>`;
                
                const stageList = document.createElement('div');
                stageList.className = 'insight-list';
                
                recommendations.forEach(rec => {
                    const card = this.createInsightCard(rec, stage.toLowerCase());
                    stageList.appendChild(card);
                });
                
                stageSection.appendChild(stageList);
                this.insightContainer.appendChild(stageSection);
            }
        });

        // Jika tidak ada rekomendasi
        if (this.insightContainer.children.length === 0) {
            this.insightContainer.innerHTML = '<p>Tidak ada rekomendasi yang tersedia untuk filter saat ini.</p>';
        }
    }

    /**
     * Membuat kartu insight
     */
    createInsightCard(recommendation, type) {
        const card = document.createElement('div');
        card.className = `insight-card ${type}`;
        
        const iconClass = this.getIconForRecommendationType(type);
        
        card.innerHTML = `
            <div class="insight-header">
                <i class="${iconClass}"></i>
                <h5>${recommendation.title}</h5>
            </div>
            <p class="insight-description">${recommendation.description}</p>
            <div class="insight-action">
                <strong>Rekomendasi Tindakan:</strong>
                <p>${recommendation.action}</p>
            </div>
        `;
        
        return card;
    }

    /**
     * Mendapatkan ikon untuk tipe rekomendasi
     */
    getIconForRecommendationType(type) {
        const icons = {
            'introduction': 'fas fa-rocket',
            'growth': 'fas fa-chart-line',
            'maturity': 'fas fa-balance-scale',
            'decline': 'fas fa-chart-line fa-flip-vertical',
            'portfolio': 'fas fa-briefcase',
            'trend': 'fas fa-history'
        };
        
        return icons[type.toLowerCase()] || 'fas fa-lightbulb';
    }
}

// Export modul
export { RecommendationEngine };