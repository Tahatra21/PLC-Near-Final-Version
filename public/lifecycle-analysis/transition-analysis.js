/**
 * Transition Analysis Module
 * Bertanggung jawab untuk menganalisis transisi produk antar tahapan lifecycle
 */
class TransitionAnalysis {
    constructor(productManager) {
        this.productManager = productManager;
        this.charts = {};
        this.lastHistoryData = [];
    }

    /**
     * Menampilkan heatmap matrix untuk transisi
     */
    showHeatmapMatrix() {
        document.getElementById('heatmapMatrixContainer').style.display = 'block';
        
        // Update button states
        this.updateButtonStates('showHeatmapBtn');
        
        // Inisialisasi heatmap
        this.initHeatmapMatrix();
    }

    /**
     * Update status tombol aktif
     */
    updateButtonStates(activeButtonId) {
        const buttons = ['showHeatmapBtn', 'showFlowBtn', 'showDoughnutBtn'];
        buttons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.classList.toggle('active', btnId === activeButtonId);
            }
        });
    }

    /**
     * Inisialisasi heatmap matrix
     */
    /**
     * Perbaikan initHeatmapMatrix dengan data loading yang lebih baik
     */
    initHeatmapMatrix() {
        const ctx = document.getElementById('heatmapMatrix');
        if (!ctx) {
            console.error('Heatmap canvas not found');
            return;
        }
        
        // Destroy existing chart if exists
        if (this.charts.heatmap) {
            this.charts.heatmap.destroy();
        }
        
        // Data untuk heatmap matrix
        const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
        const matrixData = this.generateHeatmapData(stages);
        
        console.log('Heatmap data:', matrixData); // Debug log
        
        // Pastikan canvas memiliki ukuran yang tepat
        ctx.style.width = '100%';
        ctx.style.height = '100%';
        
        this.charts.heatmap = new Chart(ctx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Transition Intensity',
                    data: matrixData,
                    backgroundColor: (context) => {
                        const value = context.parsed.v || 0;
                        const alpha = Math.min(Math.max(value / 10, 0.1), 1); // Ensure minimum visibility
                        return `rgba(6, 182, 212, ${alpha})`;
                    },
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    pointRadius: (context) => {
                        const value = context.parsed.v || 0;
                        return Math.max(value * 3, 8); // Minimum size 8px
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'category',
                        labels: stages,
                        title: {
                            display: true,
                            text: 'From Stage',
                            color: 'white',
                            font: { size: 14 }
                        },
                        ticks: {
                            color: 'white',
                            font: { size: 12 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        type: 'category',
                        labels: stages,
                        title: {
                            display: true,
                            text: 'To Stage',
                            color: 'white',
                            font: { size: 14 }
                        },
                        ticks: {
                            color: 'white',
                            font: { size: 12 }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        callbacks: {
                            title: () => 'Product Transition',
                            label: (context) => {
                                const fromStage = stages[context.parsed.x];
                                const toStage = stages[context.parsed.y];
                                const count = context.parsed.v || 0;
                                return `${fromStage} → ${toStage}: ${count} products`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Generate data untuk heatmap matrix
     */
    generateHeatmapData(stages) {
        const data = [];
        const transitionCounts = this.getTransitionCounts();
        
        stages.forEach((fromStage, fromIndex) => {
            stages.forEach((toStage, toIndex) => {
                // Skip same stage transitions
                if (fromIndex !== toIndex) {
                    const count = transitionCounts[`${fromStage}-${toStage}`] || 0;
                    data.push({
                        x: fromIndex,
                        y: toIndex,
                        v: count
                    });
                }
            });
        });
        
        return data;
    }

    /**
     * Inisialisasi flow diagram
     */
    initFlowDiagram() {
        const container = document.getElementById('flowDiagram');
        if (!container) return;
        
        // Clear container
        container.innerHTML = '';
        
        const stages = [
            { name: 'Introduction', color: '#06b6d4', x: 50, y: 50 },
            { name: 'Growth', color: '#10b981', x: 250, y: 50 },
            { name: 'Maturity', color: '#f59e0b', x: 450, y: 50 },
            { name: 'Decline', color: '#ef4444', x: 650, y: 50 }
        ];
        
        const transitionCounts = this.getTransitionCounts();
        
        // Create stage elements
        stages.forEach((stage, index) => {
            const stageEl = document.createElement('div');
            stageEl.className = 'flow-stage';
            stageEl.style.backgroundColor = stage.color;
            stageEl.style.left = stage.x + 'px';
            stageEl.style.top = stage.y + 'px';
            stageEl.textContent = stage.name;
            container.appendChild(stageEl);
            
            // Add arrows and counts for transitions
            if (index < stages.length - 1) {
                const nextStage = stages[index + 1];
                const transitionKey = `${stage.name}-${nextStage.name}`;
                const count = transitionCounts[transitionKey] || 0;
                
                // Arrow
                const arrow = document.createElement('div');
                arrow.className = 'flow-arrow';
                arrow.innerHTML = '→';
                arrow.style.left = (stage.x + 120 + 10) + 'px';
                arrow.style.top = (stage.y + 35) + 'px';
                container.appendChild(arrow);
                
                // Count
                if (count > 0) {
                    const countEl = document.createElement('div');
                    countEl.className = 'flow-count';
                    countEl.textContent = count;
                    countEl.style.left = (stage.x + 120 + 25) + 'px';
                    countEl.style.top = (stage.y + 15) + 'px';
                    container.appendChild(countEl);
                }
            }
        });
    }

    /**
     * Mendapatkan jumlah transisi dari data history
     */
    getTransitionCounts() {
        const counts = {};
        
        // Process transition data from history
        if (this.lastHistoryData && this.lastHistoryData.length > 0) {
            this.lastHistoryData.forEach(record => {
                const key = `${record.previous_stage}-${record.new_stage}`;
                counts[key] = (counts[key] || 0) + 1;
            });
        }
        
        return counts;
    }

    /**
     * Update statistik transisi
     */
    updateTransitionStats() {
        const transitionCounts = this.getTransitionCounts();
        const totalTransitions = Object.values(transitionCounts).reduce((sum, count) => sum + count, 0);
        
        // Total transitions
        const totalEl = document.getElementById('totalTransitions');
        if (totalEl) totalEl.textContent = totalTransitions;
        
        // Most common transition
        const mostCommonEl = document.getElementById('mostCommonTransition');
        if (mostCommonEl) {
            const mostCommon = Object.entries(transitionCounts)
                .sort(([,a], [,b]) => b - a)[0];
            mostCommonEl.textContent = mostCommon ? mostCommon[0].replace('-', ' → ') : '-';
        }
        
        // Success rate (simplified calculation)
        const successRateEl = document.getElementById('transitionSuccessRate');
        if (successRateEl) {
            const successfulTransitions = transitionCounts['Introduction-Growth'] + 
                                        transitionCounts['Growth-Maturity'] || 0;
            const rate = totalTransitions > 0 ? Math.round((successfulTransitions / totalTransitions) * 100) : 0;
            successRateEl.textContent = rate + '%';
        }
    }

    /**
     * Update semua visualisasi transisi
     */
    /**
     * Update semua visualisasi transisi
     */
    updateAllTransitionVisualizations(filteredHistory) {
        this.lastHistoryData = filteredHistory;
        // Update heatmap matrix
        this.initHeatmapMatrix();
        // Update statistics
        this.updateTransitionStats();
    }

    /**
     * Inisialisasi modul dengan error handling yang lebih baik
     */
    async init() {
        try {
            console.log('Initializing Transition Analysis module...');
            
            // Inisialisasi chart distribusi lifecycle
            this.initLifecycleDistributionChart();
            
            // Inisialisasi chart matriks transisi
            this.initTransitionMatrixChart();
            
            // Inisialisasi analisis kecepatan transisi
            this.initTransitionSpeedAnalysis();
            
            // Inisialisasi prediksi transisi
            this.initTransitionPredictions();
            
            // Load data awal
            await this.loadTransitionData();
            
            console.log('Transition Analysis module initialized successfully');
        } catch (error) {
            console.error('Error initializing Transition Analysis:', error);
        }
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Update chart distribusi lifecycle
        this.updateLifecycleDistributionChart(filteredProducts);
        
        // Update chart matriks transisi
        this.updateTransitionMatrixChart(filteredHistory);
        
        // Update analisis kecepatan transisi
        this.updateTransitionSpeedAnalysis(filteredHistory);
        
        // Update prediksi transisi
        this.updateTransitionPredictions(filteredProducts, filteredHistory);
    }

    /**
     * Inisialisasi chart distribusi lifecycle
     */
    initLifecycleDistributionChart() {
        const ctx = document.getElementById('lifecycleChart');
        if (!ctx) return;
        
        // Tambahkan konfigurasi global untuk Chart.js
        Chart.defaults.font.family = "'Poppins', 'Helvetica', 'Arial', sans-serif";
        Chart.defaults.font.size = 12;
        Chart.defaults.color = '#ffffff';
        
        // Tambahkan konfigurasi khusus untuk doughnut chart
        Chart.overrides.doughnut.plugins.legend = {
            display: true,
            position: 'bottom',
            labels: {
                color: 'white',
                padding: 20,
                usePointStyle: true,
                font: {
                    size: 12
                }
            }
        };
        this.charts.lifecycle = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true, // Pastikan legend ditampilkan
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12 // Ukuran font yang sesuai
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1,
                        callbacks: {
                            label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
                                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                                return `${label}: ${value} produk (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }

    /**
     * Update chart distribusi lifecycle
     */
    updateLifecycleDistributionChart(filteredProducts) {
        console.log('Updating lifecycle distribution chart with products:', filteredProducts ? filteredProducts.length : 0);
        
        if (!this.charts.lifecycle) {
            console.error('Lifecycle chart not initialized');
            return;
        }
        
        // Jika tidak ada produk, gunakan data default
        if (!filteredProducts || filteredProducts.length === 0) {
            console.warn('No products available for lifecycle distribution chart');
            this.charts.lifecycle.data.datasets[0].data = [0, 0, 0, 0]; // Default data
            this.charts.lifecycle.update();
            return;
        }
        
        // Hitung jumlah produk di setiap tahap lifecycle
        const stats = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0
        };
        
        filteredProducts.forEach(product => {
            if (product.lifecycle_stage in stats) {
                stats[product.lifecycle_stage]++;
            }
        });
        
        console.log('Lifecycle distribution stats:', stats);
        
        // Update chart data
        this.charts.lifecycle.data.datasets[0].data = [
            stats.Introduction,
            stats.Growth,
            stats.Maturity,
            stats.Decline
        ];
        
        this.charts.lifecycle.update();
    }

/**
 * Perbaikan initTransitionMatrixChart untuk memastikan data loading
 */
initTransitionMatrixChart() {
    // Langsung inisialisasi heatmap matrix
    this.initHeatmapMatrix();
    
    // Load initial data jika tersedia
    if (this.productManager && this.productManager.products) {
        this.loadTransitionData();
    }
}


/**
 * Perbaikan initHeatmapMatrix dengan data loading yang lebih baik
 */
initHeatmapMatrix() {
    const ctx = document.getElementById('heatmapMatrix');
    if (!ctx) {
        console.error('Heatmap canvas not found');
        return;
    }
    
    // Destroy existing chart if exists
    if (this.charts.heatmap) {
        this.charts.heatmap.destroy();
    }
    
    // Data untuk heatmap matrix
    const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
    const matrixData = this.generateHeatmapData(stages);
    
    console.log('Heatmap data:', matrixData); // Debug log
    
    this.charts.heatmap = new Chart(ctx.getContext('2d'), {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Transition Intensity',
                data: matrixData,
                backgroundColor: (context) => {
                    const value = context.parsed.v || 0;
                    const alpha = Math.min(Math.max(value / 10, 0.1), 1); // Ensure minimum visibility
                    return `rgba(6, 182, 212, ${alpha})`;
                },
                borderColor: '#06b6d4',
                borderWidth: 2,
                pointRadius: (context) => {
                    const value = context.parsed.v || 0;
                    return Math.max(value * 3, 8); // Minimum size 8px
                }
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'category',
                    labels: stages,
                    title: {
                        display: true,
                        text: 'From Stage',
                        color: 'white',
                        font: { size: 14 }
                    },
                    ticks: {
                        color: 'white',
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                y: {
                    type: 'category',
                    labels: stages,
                    title: {
                        display: true,
                        text: 'To Stage',
                        color: 'white',
                        font: { size: 14 }
                    },
                    ticks: {
                        color: 'white',
                        font: { size: 12 }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        title: () => 'Product Transition',
                        label: (context) => {
                            const fromStage = stages[context.parsed.x];
                            const toStage = stages[context.parsed.y];
                            const count = context.parsed.v || 0;
                            return `${fromStage} → ${toStage}: ${count} products`;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Perbaikan initFlowDiagram dengan responsive positioning
 */
initFlowDiagram() {
    const container = document.getElementById('flowDiagram');
    if (!container) {
        console.error('Flow diagram container not found');
        return;
    }
    
    // Clear container
    container.innerHTML = '';
    
    // Get container dimensions for responsive positioning
    const containerWidth = container.offsetWidth;
    const stageWidth = 100;
    const spacing = (containerWidth - (4 * stageWidth)) / 5;
    
    const stages = [
        { name: 'Introduction', color: '#06b6d4', x: spacing, y: 50 },
        { name: 'Growth', color: '#10b981', x: spacing * 2 + stageWidth, y: 50 },
        { name: 'Maturity', color: '#f59e0b', x: spacing * 3 + stageWidth * 2, y: 50 },
        { name: 'Decline', color: '#ef4444', x: spacing * 4 + stageWidth * 3, y: 50 }
    ];
    
    const transitionCounts = this.getTransitionCounts();
    console.log('Flow diagram transition counts:', transitionCounts); // Debug log
    
    // Create stage elements
    stages.forEach((stage, index) => {
        const stageEl = document.createElement('div');
        stageEl.className = 'flow-stage';
        stageEl.style.backgroundColor = stage.color;
        stageEl.style.left = stage.x + 'px';
        stageEl.style.top = stage.y + 'px';
        stageEl.textContent = stage.name;
        container.appendChild(stageEl);
        
        // Add arrows and counts for transitions
        if (index < stages.length - 1) {
            const nextStage = stages[index + 1];
            const transitionKey = `${stage.name}-${nextStage.name}`;
            const count = transitionCounts[transitionKey] || 0;
            
            // Arrow
            const arrow = document.createElement('div');
            arrow.className = 'flow-arrow';
            arrow.innerHTML = '→';
            arrow.style.left = (stage.x + stageWidth + 10) + 'px';
            arrow.style.top = (stage.y + 25) + 'px';
            container.appendChild(arrow);
            
            // Count (always show, even if 0)
            const countEl = document.createElement('div');
            countEl.className = 'flow-count';
            countEl.textContent = count;
            countEl.style.left = (stage.x + stageWidth + 20) + 'px';
            countEl.style.top = (stage.y + 5) + 'px';
            container.appendChild(countEl);
        }
    });
}

/**
 * Perbaikan generateHeatmapData dengan sample data jika tidak ada data real
 */
generateHeatmapData(stages) {
    const data = [];
    const transitionCounts = this.getTransitionCounts();
    
    // Jika tidak ada data transisi, gunakan data sampel
    const isEmpty = Object.keys(transitionCounts).length === 0;
    
    stages.forEach((fromStage, fromIndex) => {
        stages.forEach((toStage, toIndex) => {
            // Skip same stage transitions
            if (fromIndex !== toIndex) {
                let count = transitionCounts[`${fromStage}-${toStage}`] || 0;
                
                // Gunakan data sampel jika tidak ada data nyata
                if (isEmpty) {
                    // Buat data sampel yang masuk akal
                    if (fromIndex < toIndex && toIndex - fromIndex === 1) {
                        // Transisi normal (maju satu tahap)
                        count = Math.floor(Math.random() * 5) + 1;
                    } else if (fromIndex > toIndex && fromIndex - toIndex === 1) {
                        // Transisi mundur satu tahap
                        count = Math.floor(Math.random() * 3);
                    } else {
                        // Transisi lompat tahap (jarang)
                        count = Math.floor(Math.random() * 2);
                    }
                }
                
                data.push({
                    x: fromIndex,
                    y: toIndex,
                    v: count
                });
            }
        });
    });
    
    return data;
}

/**
 * Method baru untuk load transition data
 */
async loadTransitionData() {
    try {
        // Coba ambil data dari productManager
        if (this.productManager && typeof this.productManager.loadLifecycleHistory === 'function') {
            await this.productManager.loadLifecycleHistory();
            const history = this.productManager.lifecycleHistory || [];
            this.updateAllTransitionVisualizations(history);
        } else {
            console.log('Using sample data for transition matrix');
            // Gunakan sample data jika tidak ada data real
            this.updateAllTransitionVisualizations([]);
        }
    } catch (error) {
        console.error('Error loading transition data:', error);
        // Fallback ke sample data
        this.updateAllTransitionVisualizations([]);
    }
}

/**
 * Perbaikan getTransitionCounts dengan fallback data
 */
getTransitionCounts() {
    const counts = {};
    
    // Process transition data from history
    if (this.lastHistoryData && this.lastHistoryData.length > 0) {
        this.lastHistoryData.forEach(record => {
            const key = `${record.previous_stage}-${record.new_stage}`;
            counts[key] = (counts[key] || 0) + 1;
        });
    } else {
        // Sample data untuk testing jika tidak ada data real
        console.log('No history data available, using sample counts');
        return {
            'Introduction-Growth': 5,
            'Growth-Maturity': 8,
            'Maturity-Decline': 3,
            'Introduction-Maturity': 2,
            'Growth-Decline': 1
        };
    }
    
    return counts;
}
    /**
     * Inisialisasi Sankey diagram untuk matriks transisi
     */
    initSankeyTransitionChart(ctx) {
        this.charts.transition = new Chart(ctx.getContext('2d'), {
            type: 'sankey',
            data: {
                datasets: [{
                    data: [
                        { from: 'Introduction', to: 'Growth', flow: 0 },
                        { from: 'Growth', to: 'Maturity', flow: 0 },
                        { from: 'Maturity', to: 'Decline', flow: 0 },
                        { from: 'Decline', to: 'Discontinued', flow: 0 }
                    ],
                    colorFrom: (c) => this.getLifecycleStageColor(c.dataset.data[c.dataIndex].from),
                    colorTo: (c) => this.getLifecycleStageColor(c.dataset.data[c.dataIndex].to),
                    colorMode: 'gradient',
                    borderWidth: 2,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const data = context.dataset.data[context.dataIndex];
                                return `${data.from} → ${data.to}: ${data.flow} produk`;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Inisialisasi doughnut chart untuk matriks transisi (fallback)
     */
    initDoughnutTransitionChart(ctx) {
        this.charts.transition = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Introduction → Growth', 'Growth → Maturity', 'Maturity → Decline', 'Decline → Discontinued'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                }
            }
        });
    }

    /**
     * Update chart matriks transisi
     */
    updateTransitionMatrixChart(filteredHistory) {
        if (!this.charts.transition) return;
        
        // Proses data transisi
        const transitionCounts = this.processTransitionData(filteredHistory);
        
        // Update chart berdasarkan jenisnya
        if (this.charts.transition.config.type === 'sankey') {
            // Update Sankey diagram
            this.charts.transition.data.datasets[0].data = transitionCounts;
        } else {
            // Update doughnut chart
            this.charts.transition.data.datasets[0].data = [
                transitionCounts.find(t => t.from === 'Introduction' && t.to === 'Growth')?.flow || 0,
                transitionCounts.find(t => t.from === 'Growth' && t.to === 'Maturity')?.flow || 0,
                transitionCounts.find(t => t.from === 'Maturity' && t.to === 'Decline')?.flow || 0,
                transitionCounts.find(t => t.from === 'Decline' && t.to === 'Discontinued')?.flow || 0
            ];
        }
        
        this.charts.transition.update();
    }

    /**
     * Proses data transisi dari lifecycle history
     */
    processTransitionData(historyData) {
        // Inisialisasi data transisi
        const transitions = [
            { from: 'Introduction', to: 'Growth', flow: 0 },
            { from: 'Growth', to: 'Maturity', flow: 0 },
            { from: 'Maturity', to: 'Decline', flow: 0 },
            { from: 'Decline', to: 'Discontinued', flow: 0 }
        ];
        
        // Hitung jumlah transisi dari data history
        historyData.forEach(record => {
            const fromStage = record.previous_stage;
            const toStage = record.new_stage;
            
            // Cari transisi yang sesuai dan tambahkan jumlahnya
            const transition = transitions.find(t => t.from === fromStage && t.to === toStage);
            if (transition) {
                transition.flow++;
            }
        });
        
        return transitions;
    }

    /**
     * Inisialisasi analisis kecepatan transisi
     */
    initTransitionSpeedAnalysis() {
        const container = document.getElementById('transitionSpeedContainer');
        if (!container) return;
        
        // Hitung rata-rata waktu transisi
        const transitionTimes = this.calculateTransitionTimes(filteredHistory);
        
        // Bersihkan container
        container.innerHTML = '';
        
        // Buat item untuk setiap transisi
        const transitions = [
            { from: 'Introduction', to: 'Growth' },
            { from: 'Growth', to: 'Maturity' },
            { from: 'Maturity', to: 'Decline' }
        ];
        
        transitions.forEach(transition => {
            const key = `${transition.from}-${transition.to}`;
            const avgTime = transitionTimes[key] ? transitionTimes[key] : 'N/A';
            
            const item = document.createElement('div');
            item.className = 'transition-item';
            
            const label = document.createElement('div');
            label.className = 'transition-label';
            
            const fromIcon = document.createElement('span');
            fromIcon.className = 'transition-icon';
            fromIcon.style.backgroundColor = this.getLifecycleStageColor(transition.from);
            fromIcon.innerHTML = '<i class="fas fa-circle"></i>';
            
            const toIcon = document.createElement('span');
            toIcon.className = 'transition-icon';
            toIcon.style.backgroundColor = this.getLifecycleStageColor(transition.to);
            toIcon.innerHTML = '<i class="fas fa-circle"></i>';
            
            label.innerHTML = `${fromIcon.outerHTML} ${transition.from} → ${toIcon.outerHTML} ${transition.to}`;
            
            const value = document.createElement('div');
            value.className = 'transition-value';
            value.textContent = typeof avgTime === 'number' ? `${avgTime} hari` : avgTime;
            
            item.appendChild(label);
            item.appendChild(value);
            container.appendChild(item);
        });
        
        // Tambahkan pesan jika tidak ada data
        if (transitions.length === 0) {
            container.innerHTML = '<p>Tidak ada data transisi yang tersedia</p>';
        }
    }

    /**
     * Hitung rata-rata waktu transisi
     */
    calculateTransitionTimes(historyData) {
        // Kelompokkan data history berdasarkan product_id
        const productHistories = {};
        
        historyData.forEach(record => {
            if (!productHistories[record.product_id]) {
                productHistories[record.product_id] = [];
            }
            productHistories[record.product_id].push(record);
        });
        
        // Hitung waktu transisi untuk setiap produk
        const transitionTimes = {
            'Introduction-Growth': [],
            'Growth-Maturity': [],
            'Maturity-Decline': []
        };
        
        Object.values(productHistories).forEach(history => {
            // Urutkan history berdasarkan change_date
            history.sort((a, b) => new Date(a.change_date) - new Date(b.change_date));
            
            // Hitung waktu antar transisi
            for (let i = 1; i < history.length; i++) {
                const prevRecord = history[i-1];
                const currRecord = history[i];
                
                const key = `${prevRecord.previous_stage}-${currRecord.new_stage}`;
                if (transitionTimes[key]) {
                    const prevDate = new Date(prevRecord.change_date);
                    const currDate = new Date(currRecord.change_date);
                    const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
                    
                    transitionTimes[key].push(daysDiff);
                }
            }
        });
        
        // Hitung rata-rata
        const avgTransitionTimes = {};
        
        Object.entries(transitionTimes).forEach(([key, times]) => {
            if (times.length > 0) {
                const sum = times.reduce((acc, time) => acc + time, 0);
                avgTransitionTimes[key] = Math.round(sum / times.length);
            } else {
                avgTransitionTimes[key] = null;
            }
        });
        
        return avgTransitionTimes;
    }

    /**
     * Inisialisasi prediksi transisi
     */
    initTransitionPredictions() {
        const container = document.getElementById('transitionPredictionsContainer');
        if (!container) return;
        
        // Inisialisasi container dengan placeholder
        container.innerHTML = '<div class="loading-placeholder">Memuat prediksi...</div>';
    }

    /**
     * Update prediksi transisi
     */
    updateTransitionPredictions(filteredProducts, filteredHistory) {
        const container = document.getElementById('transitionPredictionsContainer');
        if (!container) return;
        
        // Dapatkan produk di setiap tahap
        const stageProducts = {
            Introduction: filteredProducts.filter(p => p.lifecycle_stage === 'Introduction'),
            Growth: filteredProducts.filter(p => p.lifecycle_stage === 'Growth'),
            Maturity: filteredProducts.filter(p => p.lifecycle_stage === 'Maturity')
        };
        
        // Dapatkan rata-rata waktu transisi
        const avgTransitionTimes = this.calculateTransitionTimes(filteredHistory);
        
        // Bersihkan container
        container.innerHTML = '';
        
        // Buat prediksi untuk setiap tahap
        Object.entries(stageProducts).forEach(([stage, products]) => {
            if (products.length === 0 || stage === 'Decline') return;
            
            // Dapatkan tahap berikutnya
            const nextStage = stage === 'Introduction' ? 'Growth' : 
                             stage === 'Growth' ? 'Maturity' : 'Decline';
            
            // Dapatkan rata-rata waktu untuk transisi ini
            const transitionKey = `${stage}-${nextStage}`;
            const avgTime = avgTransitionTimes[transitionKey];
            
            if (!avgTime) return;
            
            // Buat item prediksi
            const item = document.createElement('div');
            item.className = 'transition-item';
            
            const label = document.createElement('div');
            label.className = 'transition-label';
            
            const stageIcon = document.createElement('span');
            stageIcon.className = 'transition-icon';
            stageIcon.style.backgroundColor = this.getLifecycleStageColor(stage);
            stageIcon.innerHTML = '<i class="fas fa-circle"></i>';
            
            label.innerHTML = `${stageIcon.outerHTML} ${stage} → ${nextStage}`;
            
            const value = document.createElement('div');
            value.className = 'transition-value';
            
            // Hitung rata-rata tanggal peluncuran untuk produk di tahap ini
            const launchDates = products.map(p => new Date(p.launch_date));
            const avgLaunchDate = new Date(launchDates.reduce((acc, date) => acc + date.getTime(), 0) / launchDates.length);
            
            // Prediksi tanggal transisi
            const predictedDate = new Date(avgLaunchDate);
            predictedDate.setDate(predictedDate.getDate() + avgTime);
            
            // Format tanggal
            const today = new Date();
            const daysUntil = Math.floor((predictedDate - today) / (1000 * 60 * 60 * 24));
            
            if (daysUntil < 0) {
                value.textContent = 'Overdue';
                value.style.color = '#ef4444';
            } else {
                value.textContent = `${daysUntil} hari lagi`;
            }
            
            item.appendChild(label);
            item.appendChild(value);
            container.appendChild(item);
        });
        
        // Tambahkan pesan jika tidak ada prediksi
        if (container.children.length === 0) {
            container.innerHTML = '<p>Tidak ada prediksi yang tersedia</p>';
        }
    }

    /**
     * Update jenis chart
     */
    updateChartType(chartId, chartType) {
        if (chartId === 'lifecycleChart' && this.charts.lifecycle) {
            this.charts.lifecycle.config.type = chartType;
            this.charts.lifecycle.update();
        } else if (chartId === 'transitionChart' && this.charts.transition) {
            // Untuk chart transisi, kita perlu menginisialisasi ulang karena perbedaan struktur data
            const ctx = document.getElementById('transitionChart');
            if (!ctx) return;
            
            // Simpan data saat ini
            const currentData = this.charts.transition.data;
            
            // Hancurkan chart lama
            this.charts.transition.destroy();
            
            // Buat chart baru dengan jenis yang berbeda
            if (chartType === 'sankey' && typeof Chart.controllers.sankey !== 'undefined') {
                this.initSankeyTransitionChart(ctx);
            } else {
                this.initDoughnutTransitionChart(ctx);
            }
            
            // Update dengan data saat ini
            this.updateTransitionMatrixChart(this.lastHistoryData || []);
        }
    }
}

// Export modul
export { TransitionAnalysis };

/**
 * Update transition matrix chart dengan data terbaru
 */
    updateTransitionMatrixChart(historyData);
     {
        if (this.charts.transition && this.charts.transition.config.type === 'sankey') {
            // Update data untuk chart sankey
            this.charts.transition.data.datasets[0].data = historyData.map(record => ({
                from: record.previous_stage,
                to: record.new_stage,
                value: 1
            }));
            this.charts.transition.update();
            return;
        }

        const container = document.getElementById('transitionMatrixContainer');
        if (!container) return;
        
        // Jika tidak ada data, tampilkan pesan
        if (!historyData || historyData.length === 0) {
            container.innerHTML = '<div class="empty-state">Tidak ada data transisi tersedia</div>';
            return;
        }
        
        // Hitung transisi antar tahap
        const transitions = {
            'Introduction-Growth': 0,
            'Introduction-Maturity': 0,
            'Introduction-Decline': 0,
            'Growth-Introduction': 0,
            'Growth-Maturity': 0,
            'Growth-Decline': 0,
            'Maturity-Introduction': 0,
            'Maturity-Growth': 0,
            'Maturity-Decline': 0,
            'Decline-Introduction': 0,
            'Decline-Growth': 0,
            'Decline-Maturity': 0
        };
        
        // Hitung jumlah transisi
        historyData.forEach(record => {
            const key = `${record.previous_stage}-${record.new_stage}`;
            if (transitions.hasOwnProperty(key)) {
                transitions[key]++;
            }
        });
        
        // Buat HTML untuk matrix
        let html = `
            <div class="transition-matrix">
                <div class="matrix-header">
                    <div class="matrix-cell"></div>
                    <div class="matrix-cell">To: Introduction</div>
                    <div class="matrix-cell">To: Growth</div>
                    <div class="matrix-cell">To: Maturity</div>
                    <div class="matrix-cell">To: Decline</div>
                </div>
                <div class="matrix-row">
                    <div class="matrix-cell">From: Introduction</div>
                    <div class="matrix-cell">-</div>
                    <div class="matrix-cell">${transitions['Introduction-Growth']}</div>
                    <div class="matrix-cell">${transitions['Introduction-Maturity']}</div>
                    <div class="matrix-cell">${transitions['Introduction-Decline']}</div>
                </div>
                <div class="matrix-row">
                    <div class="matrix-cell">From: Growth</div>
                    <div class="matrix-cell">${transitions['Growth-Introduction']}</div>
                    <div class="matrix-cell">-</div>
                    <div class="matrix-cell">${transitions['Growth-Maturity']}</div>
                    <div class="matrix-cell">${transitions['Growth-Decline']}</div>
                </div>
                <div class="matrix-row">
                    <div class="matrix-cell">From: Maturity</div>
                    <div class="matrix-cell">${transitions['Maturity-Introduction']}</div>
                    <div class="matrix-cell">${transitions['Maturity-Growth']}</div>
                    <div class="matrix-cell">-</div>
                    <div class="matrix-cell">${transitions['Maturity-Decline']}</div>
                </div>
                <div class="matrix-row">
                    <div class="matrix-cell">From: Decline</div>
                    <div class="matrix-cell">${transitions['Decline-Introduction']}</div>
                    <div class="matrix-cell">${transitions['Decline-Growth']}</div>
                    <div class="matrix-cell">${transitions['Decline-Maturity']}</div>
                    <div class="matrix-cell">-</div>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        
        // Save the last history data for chart type updates
        this.lastHistoryData = historyData;
    }
class ProductLifecycleManager {
    constructor() {
        this.products = [];
        this.users = [];
        this.currentUser = null;
        this.editingUserId = null;
        this.currentEditId = null;
        this.charts = {};
        this.currentTab = 'overview';
        this.init();
    }

    async init() {
        // Check authentication
        await this.checkAuth();

        // Initialize components
        this.bindEvents();
        this.setupTabNavigation();
        this.initializeAOS();

        // Load initial data
        await this.loadProducts();
        this.initializeCharts();
        this.switchTab('dashboard');
    }

    async checkAuth() {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }

        try {
            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Invalid token');
            }

            const data = await response.json();
            this.currentUser = data.user;

            // Update UI with user info
            const userFullNameEl = document.getElementById('userFullName');
            const userRoleEl = document.getElementById('userRole');
            if (userFullNameEl) userFullNameEl.textContent = this.currentUser.full_name || this.currentUser.username;
            if (userRoleEl) userRoleEl.textContent = this.currentUser.role.charAt(0).toUpperCase() + this.currentUser.role.slice(1);

            // Show user management menu for admin
            if (this.currentUser.role === 'admin') {
                const usersMenuItem = document.getElementById('usersMenuItem');
                if (usersMenuItem) usersMenuItem.style.display = 'block';
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    initializeAOS() {
        // Initialize AOS animations
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 800,
                easing: 'ease-in-out',
                once: true
            });
        }
    }

    bindEvents() {
        // Modal controls
        const addProductBtn = document.getElementById('addProductBtn');
        const closeBtn = document.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelBtn');
        const productForm = document.getElementById('productForm');

        if (addProductBtn) addProductBtn.addEventListener('click', () => this.openModal());
        if (closeBtn) closeBtn.addEventListener('click', () => this.closeModal());
        if (cancelBtn) cancelBtn.addEventListener('click', () => this.closeModal());
        if (productForm) productForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Sidebar toggle untuk mobile responsiveness
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                sidebar.classList.toggle('collapsed');
            });
        }

        // Product search and filter
        const lifecycleFilter = document.getElementById('lifecycleFilter');
        const segmentFilter = document.getElementById('segmentFilter');
        const searchInput = document.getElementById('searchInput');
        // Gunakan filterProducts langsung untuk filter client-side yang lebih responsif
        if (lifecycleFilter) lifecycleFilter.addEventListener('change', () => {
            this.filterProducts(); // Gunakan client-side filtering untuk responsivitas
        });
        if (segmentFilter) segmentFilter.addEventListener('change', () => {
            this.filterProducts(); // Gunakan client-side filtering untuk responsivitas
        });
        if (searchInput) searchInput.addEventListener('input', this.debounce(() => {
            this.filterProducts(); // Gunakan client-side filtering untuk responsivitas
        }, 300));

        // User management events
        const addUserBtn = document.getElementById('addUserBtn');
        const closeUserModal = document.getElementById('closeUserModal');
        const cancelUserBtn = document.getElementById('cancelUserBtn');
        const userForm = document.getElementById('userForm');

        if (addUserBtn) addUserBtn.addEventListener('click', () => this.openUserModal());
        if (closeUserModal) closeUserModal.addEventListener('click', () => this.closeUserModal());
        if (cancelUserBtn) cancelUserBtn.addEventListener('click', () => this.closeUserModal());
        if (userForm) userForm.addEventListener('submit', (e) => this.handleUserFormSubmit(e));

        // Logout event
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => this.logout());

        // Sidebar menu navigation - PERBAIKAN: gunakan selector yang sesuai dengan HTML
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = item.getAttribute('data-tab');
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });

        // Hapus atau komentari bagian ini karena tidak sesuai dengan struktur HTML
        // document.querySelectorAll('.menu-item').forEach(item => {
        //     item.addEventListener('click', (e) => {
        //         e.preventDefault();
        //         const tabName = item.getAttribute('data-tab');
        //         this.switchTab(tabName);
        //     });
        // });
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('productModal');
            const userModal = document.getElementById('userModal');
            if (e.target === modal) {
                this.closeModal();
            }
            if (e.target === userModal) {
                this.closeUserModal();
            }
        });
    }

    setupTabNavigation() {
        // This method is now handled in bindEvents for sidebar menu
        // Keep for backward compatibility if there are other nav-tab elements
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });
    }

    switchTab(tabName) {
        // Update active sidebar menu
        document.querySelectorAll('.sidebar-menu li').forEach(item => {
            item.classList.remove('active');
        });
        const activeMenuItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }

        // Show/hide tab content
        document.querySelectorAll('.content-section').forEach(content => {
            content.classList.remove('active');
        });

        const targetContent = document.getElementById(tabName);
        if (targetContent) {
            targetContent.classList.add('active');
        }

        this.currentTab = tabName;

        // Execute specific functions for each menu
        this.executeMenuFunction(tabName);
    }

    async executeMenuFunction(tabName) {
        switch (tabName) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'products':
                await this.loadProductCatalog();
                break;
            case 'lifecycle':
                await this.loadLifecycleAnalysis();
                break;
            case 'analytics':
                await this.loadAdvancedAnalytics();
                break;
            case 'users':
                await this.loadUserManagement();
                break;
            case 'reports':
                await this.loadReports();
                break;
            default:
                console.log('Unknown tab:', tabName);
        }
    }

    // Dashboard Functions
    loadDashboard() {
        console.log('Loading Dashboard...');
        this.loadProducts().then(() => {
            this.updateStats();
            this.updateCharts();
            this.loadRecentActivities();
        });
        this.showNotification('Dashboard loaded successfully', 'success');
    }

    // Product Catalog Functions
    async loadProductCatalog() {
        console.log('Loading Product Catalog...');
        try {
            await this.loadProducts(); // Memuat semua produk


            // Simpan salinan semua produk untuk filter client-side
            this.allProducts = Array.isArray(this.products) ? [...this.products] : [];

            this.setupProductFilters();
            this.showNotification('Product catalog loaded', 'info');
        } catch (error) {
            console.error('Error loading product catalog:', error);
            this.showNotification('Failed to load product catalog', 'error');
        }
    }

    setupProductFilters() {
        // Tidak perlu menambahkan event listener di sini karena sudah ditangani di bindEvents
        console.log('Product filters setup complete');
    }

    filterProductsBySearch(searchTerm) {
        if (!searchTerm) {
            this.renderProducts(this.products);
            return;
        }

        const filtered = this.products.filter(product => product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (product.segment && product.segment.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        this.renderProducts(filtered);
    }

    // Lifecycle Analysis Functions
    async loadLifecycleAnalysis() {
        console.log('Loading Lifecycle Analysis...');

        try {
            // Import dan inisialisasi loader
            const { LifecycleAnalysisLoader } = await import('./lifecycle-analysis/loader.js');
            this.lifecycleLoader = new LifecycleAnalysisLoader(this);
            await this.lifecycleLoader.init();

            // Pastikan chart tidak diinisialisasi dua kali
            // this.initTimelineChart(); // Sebaiknya dikelola oleh timeline-analysis.js
            // this.initTransitionMatrix(); // Sebaiknya dikelola oleh transition-analysis.js
            this.generateLifecycleInsights();

            console.log('Lifecycle analysis modules initialized successfully');
            this.showNotification('Lifecycle analysis loaded', 'info');
        } catch (error) {
            console.error('Error loading lifecycle analysis:', error);
            this.showNotification('Failed to load lifecycle analysis', 'error');
        }
    }

    initTransitionMatrix() {
        const ctx = document.getElementById('transitionChart');
        if (!ctx) return;

        // Create transition matrix chart
        new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Introduction → Growth', 'Growth → Maturity', 'Maturity → Decline', 'Decline → Discontinued'],
                datasets: [{
                    data: [30, 45, 20, 5],
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    generateLifecycleInsights() {
        // Generate insights based on current product data
        const insights = this.analyzeLifecycleData();
        console.log('Lifecycle insights generated:', insights);
    }

    async analyzeLifecycleData() {
        const stats = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0
        };

        this.products.forEach(product => {
            stats[product.lifecycle_stage]++;
        });

        const resultObject = {
            totalProducts: this.products.length,
            stageDistribution: stats,
            recommendations: this.generateRecommendations(stats)
        };
        return resultObject;


        generateRecommendations(stats);
        {
            const recommendations = [];

            if (stats.Introduction > stats.Growth) {
                recommendations.push('Consider focusing on growth strategies for introduction-stage products');
            }

            if (stats.Decline > 0);
            {
                recommendations.push(`${stats.Decline} products in decline stage need attention`);
            }

            return recommendations;
        }

        // Advanced Analytics Functions
        loadAdvancedAnalytics();
        {
            console.log('Loading Advanced Analytics...');
            this.initRevenueChart();
            this.initPerformanceMatrix();
            this.generateAdvancedMetrics();
            this.showNotification('Advanced analytics loaded', 'info');
        }

        generateAdvancedMetrics();
        {
            // Calculate advanced metrics
            const metrics = {
                averageLifecycleTime: this.calculateAverageLifecycleTime(),
                revenueByStage: this.calculateRevenueByStage(),
                growthRate: this.calculateGrowthRate()
            };

            console.log('Advanced metrics:', metrics);
            return metrics;
        }

        calculateAverageLifecycleTime();
        {
            // Calculate average time products spend in each stage
            return 'Not implemented yet';
        }

        calculateRevenueByStage();
        {
            const revenueByStage = {
                Introduction: 0,
                Growth: 0,
                Maturity: 0,
                Decline: 0
            };

            this.products.forEach(product => {
                if (product.price) {
                    revenueByStage[product.lifecycle_stage] += parseFloat(product.price);
                }
            });

            return revenueByStage;
        }

        calculateGrowthRate();
        {
            // Calculate growth rate based on historical data
            return 'Not implemented yet';
        }

        // User Management Methods
        if (!this.currentUser || this.currentUser.role !== 'admin') {
            this.showNotification('Access denied. Admin privileges required.', 'error');
            return;
        }

        try {
            await this.loadUsers();
            return this.showNotification('User management loaded', 'info');
        } catch (error) {
            console.error('Error loading user management:', error);
            this.showNotification('Failed to load user management', 'error');
        }
    }

    async loadUsers() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to load users');
            }

            this.users = await response.json();
            this.renderUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            this.showNotification('Failed to load users', 'error');
        }
    }

    renderUsers() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.username}</td>
                <td>${user.full_name || '-'}</td>
                <td>${user.email}</td>
                <td>
                    <span class="role-badge role-${user.role}">${user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                </td>
                <td>
                    <span class="status-badge ${user.is_active ? 'active' : 'inactive'}">
                        ${user.is_active ? 'Active' : 'Inactive'}
                    </span>
                </td>
                <td>${user.last_login ? new Date(user.last_login).toLocaleDateString() : 'Never'}</td>
                <td>
                    <button class="btn btn-sm btn-secondary" onclick="manager.editUser(${user.id})">
                        Edit
                    </button>
                    ${user.id !== this.currentUser.id ? `
                        <button class="btn btn-sm btn-danger" onclick="manager.deleteUser(${user.id})">
                            Delete
                        </button>
                    ` : ''}
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    openUserModal(userId = null) {
        this.editingUserId = userId;
        const modal = document.getElementById('userModal');
        const title = document.getElementById('userModalTitle');
        const form = document.getElementById('userForm');
        const passwordGroup = document.getElementById('passwordGroup');
        const statusGroup = document.getElementById('statusGroup');

        if (!modal || !title || !form) return;

        if (userId) {
            title.textContent = 'Edit User';
            if (passwordGroup) passwordGroup.style.display = 'none';
            if (statusGroup) statusGroup.style.display = 'block';
            this.populateUserForm(userId);
        } else {
            title.textContent = 'Add User';
            if (passwordGroup) passwordGroup.style.display = 'block';
            if (statusGroup) statusGroup.style.display = 'none';
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeUserModal() {
        const modal = document.getElementById('userModal');
        if (modal) modal.style.display = 'none';
        this.editingUserId = null;
    }

    populateUserForm(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const usernameEl = document.getElementById('userUsername');
        const emailEl = document.getElementById('userEmail');
        const fullNameEl = document.getElementById('userFullName');
        const roleEl = document.getElementById('userRole');
        const statusEl = document.getElementById('userStatus');

        if (usernameEl) usernameEl.value = user.username;
        if (emailEl) emailEl.value = user.email;
        if (fullNameEl) fullNameEl.value = user.full_name || '';
        if (roleEl) roleEl.value = user.role;
        if (statusEl) statusEl.value = user.is_active.toString();
    }

    async handleUserFormSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        const userData = {
            username: formData.get('username'),
            email: formData.get('email'),
            full_name: formData.get('full_name'),
            role: formData.get('role')
        };

        if (!this.editingUserId) {
            userData.password = formData.get('password');
        } else {
            userData.is_active = formData.get('is_active') === 'true';
        }

        try {
            const token = localStorage.getItem('token');
            const url = this.editingUserId ? `/api/users/${this.editingUserId}` : '/api/users';
            const method = this.editingUserId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to save user');
            }

            await this.loadUsers();
            this.closeUserModal();
            this.showNotification(this.editingUserId ? 'User updated successfully' : 'User created successfully', 'success');
        } catch (error) {
            console.error('Error saving user:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async editUser(userId) {
        this.openUserModal(userId);
    }

    async deleteUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        if (!confirm(`Are you sure you want to delete user "${user.username}"?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to delete user');
            }

            await this.loadUsers();
            this.showNotification('User deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting user:', error);
            this.showNotification(error.message, 'error');
        }
    }

    async logout() {
        try {
            const token = localStorage.getItem('token');
            await fetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
    }

    // Reports Functions
    loadReports() {
        console.log('Loading Reports...');
        this.generateProductReport();
        this.generateLifecycleReport();
        this.generatePerformanceReport();
        this.showNotification('Reports generated successfully', 'success');
    }

    generateProductReport() {
        const report = {
            totalProducts: this.products.length,
            productsByCategory: this.groupProductsByCategory(),
            productsByStage: this.groupProductsByStage(),
            generatedAt: new Date().toISOString()
        };

        console.log('Product Report:', report);
        return report;
    }

    generateLifecycleReport() {
        const report = {
            stageDistribution: this.analyzeLifecycleData().stageDistribution,
            recommendations: this.generateRecommendations(this.analyzeLifecycleData().stageDistribution),
            generatedAt: new Date().toISOString()
        };

        console.log('Lifecycle Report:', report);
        return report;
    }

    generatePerformanceReport() {
        const report = {
            metrics: this.generateAdvancedMetrics(),
            topPerformers: this.getTopPerformingProducts(),
            underPerformers: this.getUnderPerformingProducts(),
            generatedAt: new Date().toISOString()
        };

        console.log('Performance Report:', report);
        return report;
    }

    groupProductsByCategory() {
        const grouped = {};
        this.products.forEach(product => {
            const category = product.category || 'Uncategorized';
            if (!grouped[category]) {
                grouped[category] = 0;
            }
            grouped[category]++;
        });
        return grouped;
    }

    groupProductsByStage() {
        const grouped = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0
        };

        this.products.forEach(product => {
            grouped[product.lifecycle_stage]++;
        });

        return grouped;
    }

    getTopPerformingProducts() {
        // Return products in Growth or Maturity stage
        return this.products.filter(product => product.lifecycle_stage === 'Growth' || product.lifecycle_stage === 'Maturity'
        ).slice(0, 5);
    }

    getUnderPerformingProducts() {
        // Return products in Decline stage
        return this.products.filter(product => product.lifecycle_stage === 'Decline'
        );
    }

    loadRecentActivities() {
        // Load recent activities for dashboard
        const activities = [
            {
                type: 'product_added',
                message: 'New product added to catalog',
                time: '2 hours ago',
                icon: 'fas fa-plus'
            },
            {
                type: 'stage_change',
                message: 'Product moved to Growth stage',
                time: '4 hours ago',
                icon: 'fas fa-arrow-up'
            },
            {
                type: 'report_generated',
                message: 'Monthly report generated',
                time: '1 day ago',
                icon: 'fas fa-file-alt'
            }
        ];

        this.renderActivities(activities);
    }

    renderActivities(activities) {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">
                    <i class="${activity.icon}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${activity.message}</div>
                    <div class="activity-time">${activity.time}</div>
                </div>
            </div>
        `).join('');
    }

    async loadProducts() {
        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to load products');

            this.products = await response.json();
            this.renderProducts();
            this.updateStats();
            this.updateCharts();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading products:', error);
            this.showNotification('Failed to load products. Please check your database connection.', 'error');
            this.hideLoading();
        }
    }

    showLoading() {
        const grid = document.getElementById('productsGrid');
        if (grid) {
            grid.innerHTML = '<div class="loading"><div class="spinner"></div>Loading products...</div>';
        }
    }

    hideLoading(isError = false) {
        // If there's an error, the error message is already displayed
        if (isError) return;

        // If no products found and no error, show the "No products found" message
        if (this.products.length === 0) {
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.innerHTML = '<div class="loading">No products found</div>';
            }
        }
    }

    renderProducts(productsToRender = this.products) {
        const grid = document.getElementById('productsGrid');

        if (!grid) {
            console.error('Products grid element not found');
            return;
        }

        if (productsToRender.length === 0) {
            grid.innerHTML = '<div class="loading">No products found</div>';
            return;
        }

        grid.innerHTML = productsToRender.map(product => {
            // Lowercase segment for CSS class
            const segmentClass = product.segment ? product.segment.toLowerCase().replace(/\s+/g, '') : '';

            const productCardHtml = `
            <div class="product-card" data-aos="fade-up">
                <div class="product-header">
                    <div>
                        <div class="product-title">${product.name}</div>
                        <div class="product-category">${product.category || 'No category'}</div>
                        <div class="product-segment ${segmentClass}">${product.segment || 'No segment'}</div>
                    </div>
                    <span class="lifecycle-badge ${product.lifecycle_stage.toLowerCase()}">
                        ${product.lifecycle_stage}
                    </span>
                </div>
                
                <div class="product-description">
                    ${product.description || 'No description'}
                </div>`;

            return productCardHtml;
        }).join('');

        // Refresh AOS animations for new content
        if (typeof AOS !== 'undefined') {
            AOS.refresh();
        }
    }

    updateStats() {
        const lifecycleStats = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0
        };

        const segmentStats = {
            'Pembangkitan': 0,
            'Transmisi': 0,
            'Distribusi': 0,
            'Korporat': 0,
            'Pelayanan Pelanggan': 0
        };

        // Count products by lifecycle and segment
        this.products.forEach(product => {
            // Count lifecycle stages
            if (lifecycleStats.hasOwnProperty(product.lifecycle_stage)) {
                lifecycleStats[product.lifecycle_stage]++;
            }

            // Count segments
            if (segmentStats.hasOwnProperty(product.segment)) {
                segmentStats[product.segment]++;
            }
        });

        // Update lifecycle cards
        const totalProducts = this.products.length;
        this.animateCounter('totalProducts', totalProducts);
        this.animateCounter('introductionProducts', lifecycleStats.Introduction);
        this.animateCounter('growthProducts', lifecycleStats.Growth);
        this.animateCounter('maturityProducts', lifecycleStats.Maturity);
        this.animateCounter('declineProducts', lifecycleStats.Decline);

        // Update segment cards
        this.animateCounter('pembangkitanProducts', segmentStats['Pembangkitan']);
        this.animateCounter('transmisiProducts', segmentStats['Transmisi']);
        this.animateCounter('distribusiProducts', segmentStats['Distribusi']);
        this.animateCounter('korporatProducts', segmentStats['Korporat']);
        this.animateCounter('pelayananProducts', segmentStats['Pelayanan Pelanggan']);

        // Update charts
        this.updateCharts();
    }

    updateProgressBars(stats, total) {
        const stages = ['introduction', 'growth', 'maturity', 'decline'];
        const stageKeys = ['Introduction', 'Growth', 'Maturity', 'Decline'];

        stages.forEach((stage, index) => {
            const progressBar = document.querySelector(`.${stage}-progress`);
            if (progressBar && total > 0) {
                const percentage = (stats[stageKeys[index]] / total) * 100;
                progressBar.style.width = `${percentage}%`;
            }
        });
    }

    animateCounter(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        const currentValue = parseInt(element.textContent) || 0;
        const increment = targetValue > currentValue ? 1 : -1;
        const duration = 1000;
        const steps = Math.abs(targetValue - currentValue);

        if (steps === 0) return;

        const stepDuration = duration / steps;
        let current = currentValue;

        const timer = setInterval(() => {
            current += increment;
            element.textContent = current;

            if (current === targetValue) {
                clearInterval(timer);
            }
        }, stepDuration);
    }

    // Fungsi debounce untuk mengurangi jumlah request
    debounce(func, delay) {
        let timeout;
        return function () {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    // Fungsi untuk mencari produk langsung ke database
    async searchProducts() {
        try {
            this.showLoading();
            const token = localStorage.getItem('token');
            const lifecycleFilter = document.getElementById('lifecycleFilter')?.value || '';
            const segmentFilter = document.getElementById('segmentFilter')?.value || '';
            const searchTerm = document.getElementById('searchInput')?.value || '';

            // Try server-side filtering
            try {
                let url = '/api/products/search';
                const params = [];
                if (searchTerm) params.push(`term=${encodeURIComponent(searchTerm)}`);
                if (lifecycleFilter) params.push(`lifecycle=${encodeURIComponent(lifecycleFilter)}`);
                if (segmentFilter) params.push(`segment=${encodeURIComponent(segmentFilter)}`);
                if (params.length > 0) url += '?' + params.join('&');

                const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                if (!response.ok) {
                    throw new Error('Server filtering failed');
                }

                const data = await response.json();
                this.products = data;
                this.renderProducts(this.products);
                this.updateStats();
                this.hideLoading();
            } catch (serverError) {
                console.warn('Server-side filtering failed, falling back to client-side:', serverError);

                // Fallback to client-side filtering if server-side fails
                if (!this.allProducts || this.allProducts.length === 0) {
                    // If no cached products, fetch all products first
                    const allProductsResponse = await fetch('/api/products', {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });

                    if (allProductsResponse.ok) {
                        this.allProducts = await allProductsResponse.json();
                    } else {
                        throw new Error('Failed to fetch products for filtering');
                    }
                }

                // Perform client-side filtering
                this.filterProducts();
            }
        } catch (error) {
            this.showNotification('Failed to search products: ' + error.message, 'error');
            const grid = document.getElementById('productsGrid');
            if (grid) {
                grid.innerHTML = `<div class="loading error">Error: ${error.message}</div>`;
            }
            this.hideLoading(true);
        }
    }

    filterProducts() {
        const lifecycleFilter = document.getElementById('lifecycleFilter').value;
        const segmentFilter = document.getElementById('segmentFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        console.log('Filtering products:', { lifecycleFilter, segmentFilter, searchTerm });

        // Gunakan allProducts jika tersedia, jika tidak gunakan this.products
        let sourceProducts = this.allProducts || this.products;
        console.log('Products before filter:', sourceProducts.length);

        let filtered = [...sourceProducts]; // Buat salinan array untuk difilter


        // Filter berdasarkan lifecycle stage
        if (lifecycleFilter) {
            filtered = filtered.filter(product => product.lifecycle_stage === lifecycleFilter);
        }

        // Filter berdasarkan segment
        if (segmentFilter) {
            filtered = filtered.filter(product => product.segment === segmentFilter);
        }

        // Filter berdasarkan search term
        if (searchTerm) {
            filtered = filtered.filter(product => product.name.toLowerCase().includes(searchTerm) ||
                (product.description && product.description.toLowerCase().includes(searchTerm)) ||
                (product.category && product.category.toLowerCase().includes(searchTerm)) ||
                (product.segment && product.segment.toLowerCase().includes(searchTerm))
            );
        }

        console.log('Products after filter:', filtered.length);
        this.renderProducts(filtered);
        this.hideLoading();
    }

    openModal(product = null) {
        const modal = document.getElementById('productModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('productForm');

        if (product) {
            title.textContent = 'Edit Product';
            this.currentEditId = product.id;
            this.populateForm(product);
        } else {
            title.textContent = 'Add Product';
            this.currentEditId = null;
            form.reset();
        }

        modal.style.display = 'block';
    }

    closeModal() {
        document.getElementById('productModal').style.display = 'none';
        this.currentEditId = null;
    }

    populateForm(product) {
        document.getElementById('productName').value = product.name;
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productCategory').value = product.category || '';
        document.getElementById('productSegment').value = product.segment || '';
        document.getElementById('productLifecycle').value = product.lifecycle_stage;
        document.getElementById('productLaunchDate').value = product.launch_date ? product.launch_date.split('T')[0] : '';
    }

    async handleFormSubmit(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('productName').value,
            description: document.getElementById('productDescription').value,
            category: document.getElementById('productCategory').value,
            segment: document.getElementById('productSegment').value,
            lifecycle_stage: document.getElementById('productLifecycle').value,
            launch_date: document.getElementById('productLaunchDate').value || null
        };

        try {
            const token = localStorage.getItem('token');
            let response;
            if (this.currentEditId) {
                response = await fetch(`/api/products/${this.currentEditId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
            } else {
                response = await fetch('/api/products', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });
            }

            if (!response.ok) throw new Error('Failed to save product');

            this.closeModal();
            this.loadProducts();
            this.showNotification(this.currentEditId ? 'Product updated successfully' : 'Product added successfully', 'success');
        } catch (error) {
            console.error('Error saving product:', error);
            this.showNotification('Failed to save product', 'error');
        }
    }

    async editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.openModal(product);
        }
    }

    async deleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/products/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Failed to delete product');

            this.loadProducts();
            this.showNotification('Product deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting product:', error);
            this.showNotification('Failed to delete product', 'error');
        }
    }

    initializeCharts() {
        // Jangan inisialisasi chart yang akan dikelola oleh lifecycle-analysis loader
        // this.initLifecycleChart(); // Dikelola oleh transition-analysis.js
        this.initTrendChart();
        this.initRevenueChart();
        this.initPerformanceMatrix();
        // this.initTimelineChart(); // Dipanggil di loadLifecycleAnalysis()
    }

    initLifecycleChart() {
        const ctx = document.getElementById('lifecycleChart');
        if (!ctx) return;

        this.charts.lifecycle = new Chart(ctx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
                datasets: [{
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: 'white',
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                        borderWidth: 1
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 2000
                }
            }
        });
    }

    initTrendChart() {
        const ctx = document.getElementById('trendChart');
        if (!ctx) return;

        this.charts.trend = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Introduction',
                        data: [],
                        borderColor: '#06b6d4',
                        backgroundColor: 'rgba(6, 182, 212, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Growth',
                        data: [],
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Maturity',
                        data: [],
                        borderColor: '#f59e0b',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Decline',
                        data: [],
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeInOutQuart'
                }
            }
        });
    }

    initRevenueChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;

        this.charts.revenue = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
                datasets: [{
                    label: 'Revenue (USD)',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.8)',
                        'rgba(16, 185, 129, 0.8)',
                        'rgba(245, 158, 11, 0.8)',
                        'rgba(239, 68, 68, 0.8)'
                    ],
                    borderColor: [
                        '#06b6d4',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        callbacks: {
                            label: function (context) {
                                return `Revenue: $${context.parsed.y.toLocaleString()}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function (value) {
                                return '$' + value.toLocaleString();
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutBounce'
                }
            }
        });
    }

    initPerformanceMatrix() {
        const ctx = document.getElementById('performanceMatrix');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx.getContext('2d'), {
            type: 'scatter',
            data: {
                datasets: []
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: 'white'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Product Age (months)',
                            color: 'white'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Revenue (USD)',
                            color: 'white'
                        },
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    initTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) return;

        this.charts.timeline = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Product Lifecycle Timeline',
                    data: [],
                    borderColor: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--primary-color')) || '#A05AFF',
                    backgroundColor: 'rgba(160, 90, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: {
                            color: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--text-primary')) || '#0f172a'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white'
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')) || '#475569'
                        },
                        grid: {
                            color: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--gray-200')) || '#e2e8f0'
                        }
                    },
                    y: {
                        ticks: {
                            color: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--text-secondary')) || '#475569'
                        },
                        grid: {
                            color: (typeof window !== 'undefined' && getComputedStyle(document.documentElement).getPropertyValue('--gray-200')) || '#e2e8f0'
                        }
                    }
                }
            }
        });
    }

    updateCharts() {
        if (this.charts.lifecycle) {
            const stats = {
                Introduction: 0,
                Growth: 0,
                Maturity: 0,
                Decline: 0
            };

            this.products.forEach(product => {
                stats[product.lifecycle_stage]++;
            });

            this.charts.lifecycle.data.datasets[0].data = [
                stats.Introduction,
                stats.Growth,
                stats.Maturity,
                stats.Decline
            ];
            this.charts.lifecycle.update();
        }

        if (this.charts.revenue) {
            const revenueStats = {
                Introduction: 0,
                Growth: 0,
                Maturity: 0,
                Decline: 0
            };

            this.products.forEach(product => {
                if (product.price) {
                    revenueStats[product.lifecycle_stage] += parseFloat(product.price);
                }
            });

            this.charts.revenue.data.datasets[0].data = [
                revenueStats.Introduction,
                revenueStats.Growth,
                revenueStats.Maturity,
                revenueStats.Decline
            ];
            this.charts.revenue.update();
        }
    }

    updateActivityFeed() {
        const activityFeed = document.getElementById('activityFeed');
        if (!activityFeed) return;

        // Generate activity items based on recent product changes
        const activities = this.products.slice(0, 5).map(product => {
            const activityObject = {
                type: 'product_update',
                message: `Product "${product.name}" is in ${product.lifecycle_stage} stage`,
                timestamp: new Date().toISOString()
            };
            return activityObject;
        });

        activityFeed.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <small>${new Date(activity.timestamp).toLocaleString()}</small>
                </div>
            </div>
        `).join('');
    }

    globalSearch(query) {
        if (!query) {
            this.renderProducts();
            return;
        }

        const filtered = this.products.filter(product => product.name.toLowerCase().includes(query.toLowerCase()) ||
            (product.description && product.description.toLowerCase().includes(query.toLowerCase())) ||
            (product.category && product.category.toLowerCase().includes(query.toLowerCase())) ||
            (product.segment && product.segment.toLowerCase().includes(query.toLowerCase())) ||
            product.lifecycle_stage.toLowerCase().includes(query.toLowerCase())
        );

        this.renderProducts(filtered);
    }

    switchChartType(chartType) {
        if (this.charts.lifecycle) {
            this.charts.lifecycle.config.type = chartType;
            this.charts.lifecycle.update();
        }
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
        `;
    }
}
