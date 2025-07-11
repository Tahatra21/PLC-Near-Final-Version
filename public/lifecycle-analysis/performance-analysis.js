/**
 * Performance Analysis Module
 * Bertanggung jawab untuk menganalisis performa produk berdasarkan tahapan lifecycle
 */
class PerformanceAnalysis {
    constructor(productManager) {
        this.productManager = productManager;
        this.charts = {};
    }

    /**
     * Inisialisasi modul
     */
    async init() {
        // Inisialisasi chart perbandingan revenue per tahap
        this.initRevenueComparisonChart();
        
        // Inisialisasi chart metrik efisiensi
        this.initEfficiencyMetricsChart();
        
        // Inisialisasi chart perbandingan antar segmen
        this.initSegmentComparisonChart();
        
        console.log('Performance Analysis module initialized');
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Update chart perbandingan revenue per tahap
        this.updateRevenueComparisonChart(filteredProducts);
        
        // Update chart metrik efisiensi
        this.updateEfficiencyMetricsChart(filteredProducts);
        
        // Update chart perbandingan antar segmen
        this.updateSegmentComparisonChart(filteredProducts);
    }

    /**
     * Inisialisasi chart perbandingan revenue per tahap
     */
    initRevenueComparisonChart() {
        const ctx = document.getElementById('revenueChart');
        if (!ctx) return;
        
        this.charts.revenue = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: ['Introduction', 'Growth', 'Maturity', 'Decline'],
                datasets: [{
                    label: 'Revenue',
                    data: [0, 0, 0, 0],
                    backgroundColor: [
                        'rgba(6, 182, 212, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(239, 68, 68, 0.7)'
                    ],
                    borderColor: [
                        'rgb(6, 182, 212)',
                        'rgb(16, 185, 129)',
                        'rgb(245, 158, 11)',
                        'rgb(239, 68, 68)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            callback: function(value) {
                                const formattedValue = value.toLocaleString('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0
                                });
                                return formattedValue;
                            }
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
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
                            label: function(context) {
                                const formattedValue = context.parsed.y.toLocaleString('id-ID', {
                                    style: 'currency',
                                    currency: 'IDR',
                                    maximumFractionDigits: 0
                                });
                                return formattedValue;
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Update chart perbandingan revenue per tahap
     */
    updateRevenueComparisonChart(filteredProducts) {
        if (!this.charts.revenue) return;
        
        const revenueStats = {
            Introduction: 0,
            Growth: 0,
            Maturity: 0,
            Decline: 0
        };

        filteredProducts.forEach(product => {
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

    /**
     * Inisialisasi chart metrik efisiensi
     */
    initEfficiencyMetricsChart() {
        const ctx = document.getElementById('efficiencyChart');
        if (!ctx) return;
        
        this.charts.efficiency = new Chart(ctx.getContext('2d'), {
            type: 'radar',
            data: {
                labels: ['ROI', 'Margin', 'Market Share', 'Customer Satisfaction', 'Innovation'],
                datasets: [
                    {
                        label: 'Introduction',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(6, 182, 212, 0.2)',
                        borderColor: 'rgb(6, 182, 212)',
                        pointBackgroundColor: 'rgb(6, 182, 212)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(6, 182, 212)'
                    },
                    {
                        label: 'Growth',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: 'rgb(16, 185, 129)',
                        pointBackgroundColor: 'rgb(16, 185, 129)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(16, 185, 129)'
                    },
                    {
                        label: 'Maturity',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(245, 158, 11, 0.2)',
                        borderColor: 'rgb(245, 158, 11)',
                        pointBackgroundColor: 'rgb(245, 158, 11)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(245, 158, 11)'
                    },
                    {
                        label: 'Decline',
                        data: [0, 0, 0, 0, 0],
                        backgroundColor: 'rgba(239, 68, 68, 0.2)',
                        borderColor: 'rgb(239, 68, 68)',
                        pointBackgroundColor: 'rgb(239, 68, 68)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgb(239, 68, 68)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        pointLabels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        ticks: {
                            backdropColor: 'transparent',
                            color: 'rgba(255, 255, 255, 0.7)'
                        }
                    }
                },
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
     * Update chart metrik efisiensi
     */
    updateEfficiencyMetricsChart(filteredProducts) {
        if (!this.charts.efficiency) return;
        
        // Hitung metrik efisiensi untuk setiap tahap
        const metrics = this.calculateEfficiencyMetrics(filteredProducts);
        
        // Update dataset untuk setiap tahap
        const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
        stages.forEach((stage, index) => {
            this.charts.efficiency.data.datasets[index].data = [
                metrics[stage].roi,
                metrics[stage].margin,
                metrics[stage].marketShare,
                metrics[stage].customerSatisfaction,
                metrics[stage].innovation
            ];
        });
        
        this.charts.efficiency.update();
    }

    /**
     * Hitung metrik efisiensi
     */
    calculateEfficiencyMetrics(filteredProducts) {
        // Inisialisasi metrik untuk setiap tahap
        const metrics = {
            Introduction: { roi: 0, margin: 0, marketShare: 0, customerSatisfaction: 0, innovation: 0 },
            Growth: { roi: 0, margin: 0, marketShare: 0, customerSatisfaction: 0, innovation: 0 },
            Maturity: { roi: 0, margin: 0, marketShare: 0, customerSatisfaction: 0, innovation: 0 },
            Decline: { roi: 0, margin: 0, marketShare: 0, customerSatisfaction: 0, innovation: 0 }
        };
        
        // Dalam implementasi nyata, metrik ini akan dihitung dari data aktual
        // Untuk contoh ini, kita akan menggunakan nilai dummy berdasarkan tahap
        
        // ROI (Return on Investment)
        metrics.Introduction.roi = 20; // ROI rendah di tahap awal
        metrics.Growth.roi = 80; // ROI tinggi di tahap pertumbuhan
        metrics.Maturity.roi = 60; // ROI stabil di tahap matang
        metrics.Decline.roi = 30; // ROI menurun di tahap penurunan
        
        // Margin
        metrics.Introduction.margin = 30; // Margin rendah karena biaya awal tinggi
        metrics.Growth.margin = 50; // Margin meningkat dengan skala
        metrics.Maturity.margin = 70; // Margin tertinggi karena efisiensi
        metrics.Decline.margin = 40; // Margin menurun karena persaingan
        
        // Market Share
        metrics.Introduction.marketShare = 10; // Market share kecil
        metrics.Growth.marketShare = 40; // Market share tumbuh cepat
        metrics.Maturity.marketShare = 70; // Market share tertinggi
        metrics.Decline.marketShare = 50; // Market share menurun
        
        // Customer Satisfaction
        metrics.Introduction.customerSatisfaction = 60; // Kepuasan pelanggan awal
        metrics.Growth.customerSatisfaction = 80; // Kepuasan meningkat
        metrics.Maturity.customerSatisfaction = 90; // Kepuasan tertinggi
        metrics.Decline.customerSatisfaction = 70; // Kepuasan menurun
        
        // Innovation
        metrics.Introduction.innovation = 90; // Inovasi tertinggi
        metrics.Growth.innovation = 70; // Inovasi tinggi
        metrics.Maturity.innovation = 40; // Inovasi menurun
        metrics.Decline.innovation = 20; // Inovasi rendah
        
        return metrics;
    }

    /**
     * Inisialisasi chart perbandingan antar segmen
     */
    initSegmentComparisonChart() {
        const ctx = document.getElementById('segmentComparisonChart');
        if (!ctx) return;
        
        // Dapatkan semua segmen bisnis
        const segments = ['Pembangkitan', 'Transmisi', 'Distribusi', 'Korporat', 'Pelayanan Pelanggan'];
        
        this.charts.segmentComparison = new Chart(ctx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: segments,
                datasets: [
                    {
                        label: 'Introduction',
                        data: Array(segments.length).fill(0),
                        backgroundColor: 'rgba(6, 182, 212, 0.7)',
                        borderColor: 'rgb(6, 182, 212)',
                        borderWidth: 1
                    },
                    {
                        label: 'Growth',
                        data: Array(segments.length).fill(0),
                        backgroundColor: 'rgba(16, 185, 129, 0.7)',
                        borderColor: 'rgb(16, 185, 129)',
                        borderWidth: 1
                    },
                    {
                        label: 'Maturity',
                        data: Array(segments.length).fill(0),
                        backgroundColor: 'rgba(245, 158, 11, 0.7)',
                        borderColor: 'rgb(245, 158, 11)',
                        borderWidth: 1
                    },
                    {
                        label: 'Decline',
                        data: Array(segments.length).fill(0),
                        backgroundColor: 'rgba(239, 68, 68, 0.7)',
                        borderColor: 'rgb(239, 68, 68)',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    y: {
                        stacked: true,
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                },
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
     * Update chart perbandingan antar segmen
     */
    updateSegmentComparisonChart(filteredProducts) {
        if (!this.charts.segmentComparison) return;
        
        // Dapatkan semua segmen bisnis
        const segments = ['Pembangkitan', 'Transmisi', 'Distribusi', 'Korporat', 'Pelayanan Pelanggan'];
        
        // Hitung jumlah produk untuk setiap kombinasi segmen dan tahap
        const segmentStageCount = {};
        segments.forEach(segment => {
            segmentStageCount[segment] = {
                Introduction: 0,
                Growth: 0,
                Maturity: 0,
                Decline: 0
            };
        });
        
        // Hitung jumlah produk
        filteredProducts.forEach(product => {
            if (segments.includes(product.segment)) {
                segmentStageCount[product.segment][product.lifecycle_stage]++;
            }
        });
        
        // Update dataset untuk setiap tahap
        const stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
        stages.forEach((stage, index) => {
            this.charts.segmentComparison.data.datasets[index].data = segments.map(segment => 
                segmentStageCount[segment][stage]
            );
        });
        
        this.charts.segmentComparison.update();
    }

    /**
     * Update jenis chart
     */
    updateChartType(chartId, chartType) {
        if (chartId === 'revenueChart' && this.charts.revenue) {
            this.charts.revenue.config.type = chartType;
            this.charts.revenue.update();
        } else if (chartId === 'efficiencyChart' && this.charts.efficiency) {
            // Radar chart tidak dapat diubah ke jenis lain dengan mudah
            console.warn('Efficiency chart type cannot be changed');
        } else if (chartId === 'segmentComparisonChart' && this.charts.segmentComparison) {
            if (chartType === 'bar' || chartType === 'line') {
                this.charts.segmentComparison.config.type = chartType;
                this.charts.segmentComparison.update();
            }
        }
    }
}

// Export modul
export { PerformanceAnalysis };