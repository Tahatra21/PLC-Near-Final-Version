class LifecycleAnalysisLoader {
    constructor(productManager) {
        this.productManager = productManager;
        this.modules = {};
    }

    /**
     * Inisialisasi semua modul analisis
     */
    async init() {
        // Memuat semua modul
        await this.loadModules();
        
        // Memuat data awal
        await this.loadInitialData();
        
        console.log('Lifecycle Analysis Modules loaded successfully');
    }

    /**
     * Memuat semua modul analisis
     */
    async loadModules() {
        try {
            // Import modul-modul analisis yang tersedia
            const transitionAnalysis = await import('./transition-analysis.js');
            const performanceAnalysis = await import('./performance-analysis.js');
            const recommendationEngine = await import('./recommendation-engine.js');
            const timelineAnalysis = await import('./timeline-analysis.js');
            const competitiveAnalysis = await import('./competitive-analysis.js');
            const advancedMetrics = await import('./advanced-metrics.js');
            const insightGenerator = await import('./insight-generator.js');
            const reportGenerator = await import('./report-generator.js');
            
            // Inisialisasi modul-modul
            this.modules.transition = new transitionAnalysis.TransitionAnalysis(this.productManager);
            this.modules.performance = new performanceAnalysis.PerformanceAnalysis(this.productManager);
            this.modules.recommendation = new recommendationEngine.RecommendationEngine(this.productManager);
            this.modules.timeline = new timelineAnalysis.TimelineAnalysis(this.productManager);
            this.modules.competitive = new competitiveAnalysis.CompetitiveAnalysis(this.productManager);
            this.modules.metrics = new advancedMetrics.AdvancedMetrics(this.productManager);
            this.modules.insights = new insightGenerator.InsightGenerator(this.productManager);
            this.modules.reports = new reportGenerator.ReportGenerator(this.productManager);
            
            // Inisialisasi setiap modul
            for (const [name, module] of Object.entries(this.modules)) {
                if (module && typeof module.init === 'function') {
                    await module.init();
                }
            }
        } catch (error) {
            console.error('Error loading lifecycle analysis modules:', error);
        }
    }

    /**
     * Setup event listeners untuk interaksi
     */
    setupEventListeners() {
        // Toggle untuk jenis chart
        const chartTypeToggles = document.querySelectorAll('.chart-type-toggle');
        chartTypeToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                const chartId = e.currentTarget.dataset.chartId;
                const chartType = e.currentTarget.dataset.chartType;
                this.updateChartType(chartId, chartType);
            });
        });
        
        // Export report button
        const exportReportBtn = document.getElementById('exportReportBtn');
        if (exportReportBtn) {
            exportReportBtn.addEventListener('click', () => this.exportReport());
        }
    }

    /**
     * Memuat data awal untuk analisis
     */
    async loadInitialData() {
        try {
            // Memuat data produk jika belum dimuat
            if (!this.productManager.products || this.productManager.products.length === 0) {
                await this.productManager.loadProducts();
            }
            
            // Memuat data lifecycle history
            await this.fetchLifecycleHistory();
            
            // Update semua analisis dengan semua data (tanpa filter)
            this.updateAnalysis();
        } catch (error) {
            console.error('Error loading initial data:', error);
        }
    }

    /**
     * Mengambil data lifecycle history dari API
     */
    async fetchLifecycleHistory() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products/lifecycle-history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch lifecycle history');
            }
            
            const historyData = await response.json();
            console.log('Lifecycle history data:', historyData); // Tambahkan logging
            this.lifecycleHistory = historyData;
            
            return historyData;
        } catch (error) {
            console.error('Error fetching lifecycle history:', error);
            this.lifecycleHistory = [];
            return [];
        }
    }

    /**
     * Update semua analisis dengan semua data (tanpa filter)
     */
    updateAnalysis() {
        // Gunakan semua produk dan history tanpa filter
        const allProducts = [...this.productManager.products];
        const allHistory = [...this.lifecycleHistory];
        
        console.log('Updating analysis with products:', allProducts.length); // Tambahkan logging
        console.log('Updating analysis with history:', allHistory.length); // Tambahkan logging
        
        // Update setiap modul dengan semua data
        for (const [name, module] of Object.entries(this.modules)) {
            if (module && typeof module.update === 'function') {
                console.log(`Updating module: ${name}`); // Tambahkan logging
                module.update(allProducts, allHistory);
            }
        }
    }

    /**
     * Update jenis chart
     */
    updateChartType(chartId, chartType) {
        const module = this.getModuleForChart(chartId);
        if (module && typeof module.updateChartType === 'function') {
            module.updateChartType(chartId, chartType);
        }
    }

    /**
     * Mendapatkan modul yang mengelola chart tertentu
     */
    getModuleForChart(chartId) {
        // Map chart ID ke modul yang sesuai
        const chartModuleMap = {
            'lifecycleChart': this.modules.transition,
            'transitionChart': this.modules.transition,
            'timelineChart': this.modules.timeline,
            'performanceChart': this.modules.performance,
            'revenueChart': this.modules.performance,
            'competitiveChart': this.modules.competitive
        };
        
        return chartModuleMap[chartId];
    }

    /**
     * Export laporan analisis
     */
    exportReport() {
        if (this.modules.reports && typeof this.modules.reports.generateReport === 'function') {
            this.modules.reports.generateReport();
        }
    }
}

// Export modul
export { LifecycleAnalysisLoader };