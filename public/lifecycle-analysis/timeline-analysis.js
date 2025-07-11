/**
 * Timeline Analysis Module
 * Bertanggung jawab untuk menganalisis perubahan lifecycle produk dari waktu ke waktu
 */
class TimelineAnalysis {
    constructor(productManager) {
        this.productManager = productManager;
        this.charts = {};
        this.lifecycleHistory = [];
        this.products = []; // Tambahkan untuk menyimpan data produk
        this.segments = ['Pembangkitan', 'Transmisi', 'Distribusi', 'Korporat', 'Pelayanan Pelanggan'];
        this.stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
        this.segmentColors = {
            'Pembangkitan': '#06b6d4',
            'Transmisi': '#10b981',
            'Distribusi': '#f59e0b',
            'Korporat': '#8b5cf6',
            'Pelayanan Pelanggan': '#ec4899'
        };
        this.stageColors = {
            'Introduction': '#06b6d4',
            'Growth': '#10b981',
            'Maturity': '#f59e0b',
            'Decline': '#ef4444'
        };
    }

    /**
     * Inisialisasi modul
     */
    async init() {
        // Inisialisasi chart timeline
        this.initTimelineChart();
        
        // Tambahkan kontrol untuk timeline
        this.addTimelineControls();
        
        // Load data produk untuk timeline launch
        await this.loadProductsData();
        
        console.log('Timeline Analysis module initialized');
    }

    /**
     * Load data produk dari API
     */
    async loadProductsData() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                this.products = await response.json();
                console.log('Products data loaded:', this.products.length, 'products');
                
                // Update timeline dengan data launch
                this.updateLaunchTimeline();
            } else {
                console.error('Failed to load products data');
                this.addDummyLaunchData();
            }
        } catch (error) {
            console.error('Error loading products data:', error);
            this.addDummyLaunchData();
        }
    }

    /**
     * Update modul dengan data terbaru
     */
    update(filteredProducts, filteredHistory) {
        // Simpan data history dan products
        this.lifecycleHistory = filteredHistory || [];
        this.products = filteredProducts || [];
        
        // Update chart timeline berdasarkan mode yang aktif
        const modeToggle = document.getElementById('timeline-mode-toggle');
        if (modeToggle && modeToggle.value === 'launch') {
            this.updateLaunchTimeline();
        } else {
            this.updateTimelineChart(filteredHistory);
        }
    }

    /**
     * Tambahkan data dummy untuk launch timeline jika tidak ada data
     */
    addDummyLaunchData() {
        console.log('Adding dummy launch data for visualization');
        
        const dummyProducts = [];
        const today = new Date();
        
        // Buat data dummy untuk 2 tahun terakhir
        for (let i = 0; i < 24; i++) {
            const launchDate = new Date(today);
            launchDate.setMonth(launchDate.getMonth() - i);
            
            const segment = this.segments[Math.floor(Math.random() * this.segments.length)];
            const stage = this.stages[Math.floor(Math.random() * this.stages.length)];
            
            dummyProducts.push({
                id: 1000 + i,
                name: `Produk Demo ${i + 1}`,
                segment: segment,
                lifecycle_stage: stage,
                launch_date: launchDate.toISOString().split('T')[0],
                category: 'Demo'
            });
        }
        
        this.products = dummyProducts;
        this.updateLaunchTimeline();
    }

    /**
     * Inisialisasi chart timeline
     */
    initTimelineChart() {
        const ctx = document.getElementById('timelineChart');
        if (!ctx) {
            console.error('Timeline chart canvas element not found');
            return;
        }
        
        // Pastikan canvas memiliki ukuran yang cukup
        ctx.style.height = '300px';
        ctx.style.width = '100%';
        
        // Destroy global chart instance if exists
        if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
            window.timelineChart.destroy();
            window.timelineChart = null;
        }
        // Destroy local chart instance if exists
        if (this.charts.timeline) {
            this.charts.timeline.destroy();
            this.charts.timeline = null;
        }
        
        // Buat chart baru
        this.charts.timeline = new Chart(ctx.getContext('2d'), {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'Introduction',
                        data: [],
                        borderColor: this.stageColors.Introduction,
                        backgroundColor: 'rgba(6, 182, 212, 0.3)', // Increased opacity
                        tension: 0.4,
                        fill: true // Changed to true for better visibility
                    },
                    {
                        label: 'Growth',
                        data: [],
                        borderColor: this.stageColors.Growth,
                        backgroundColor: 'rgba(16, 185, 129, 0.3)', // Increased opacity
                        tension: 0.4,
                        fill: true // Changed to true for better visibility
                    },
                    {
                        label: 'Maturity',
                        data: [],
                        borderColor: this.stageColors.Maturity,
                        backgroundColor: 'rgba(245, 158, 11, 0.3)', // Increased opacity
                        tension: 0.4,
                        fill: true // Changed to true for better visibility
                    },
                    {
                        label: 'Decline',
                        data: [],
                        borderColor: this.stageColors.Decline,
                        backgroundColor: 'rgba(239, 68, 68, 0.3)', // Increased opacity
                        tension: 0.4,
                        fill: true // Changed to true for better visibility
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#0f172a',
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: 'white',
                        bodyColor: 'white',
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value} produk`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: {
                            color: '#475569'
                        },
                        grid: {
                            color: '#e2e8f0'
                        }
                    },
                    y: {
                        ticks: {
                            color: '#475569'
                        },
                        grid: {
                            color: '#e2e8f0'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
        window.timelineChart = this.charts.timeline;
    }

    /**
     * Filter data timeline berdasarkan segmen dan rentang waktu
     */
    filterTimelineData() {
        const segmentFilter = document.getElementById('timeline-segment-filter');
        const timeRangeFilter = document.getElementById('timeline-range-filter');
        
        if (!segmentFilter || !timeRangeFilter || !this.lifecycleHistory) return;
        
        const segment = segmentFilter.value;
        const timeRange = timeRangeFilter.value;
        
        // Filter data berdasarkan segmen dan rentang waktu
        let filteredHistory = [...this.lifecycleHistory];
        
        // Filter berdasarkan segmen
        if (segment !== 'all') {
            filteredHistory = filteredHistory.filter(record => record.segment === segment);
        }
        
        // Filter berdasarkan rentang waktu
        if (timeRange !== 'all') {
            const daysAgo = parseInt(timeRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            
            filteredHistory = filteredHistory.filter(record => {
                const recordDate = new Date(record.change_date);
                return recordDate >= cutoffDate;
            });
        }
        
        // Update chart dengan data yang difilter
        this.updateTimelineChart(filteredHistory);
    }

    /**
     * Update chart timeline dengan data terbaru
     */
    updateTimelineChart(historyData) {
        if (!this.charts.timeline) {
            console.error('Timeline chart not initialized');
            this.initTimelineChart();
            if (!this.charts.timeline) return;
        }
        
        // Jika tidak ada data, tambahkan data dummy
        if (!historyData || historyData.length === 0) {
            console.log('No timeline data available, using dummy data');
            // this.addDummyDataIfEmpty(); // REMOVE this call to avoid error
            return;
        }
        
        console.log('Updating timeline chart with data:', historyData.length, 'records');
        
        // Kelompokkan data berdasarkan tanggal dan tahap
        const groupedData = this.groupHistoryDataByDate(historyData);
        
        // Dapatkan tanggal unik dan urutkan
        const dates = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
        
        // Format tanggal untuk label
        const labels = dates.map(date => this.formatDate(date));
        
        // Siapkan data untuk setiap tahap lifecycle
        const introductionData = [];
        const growthData = [];
        const maturityData = [];
        const declineData = [];
        
        // Hitung jumlah produk di setiap tahap untuk setiap tanggal
        dates.forEach(date => {
            introductionData.push(groupedData[date].Introduction || 0);
            growthData.push(groupedData[date].Growth || 0);
            maturityData.push(groupedData[date].Maturity || 0);
            declineData.push(groupedData[date].Decline || 0);
        });
        
        // Update chart data
        this.charts.timeline.data.labels = labels;
        this.charts.timeline.data.datasets[0].data = introductionData;
        this.charts.timeline.data.datasets[1].data = growthData;
        this.charts.timeline.data.datasets[2].data = maturityData;
        this.charts.timeline.data.datasets[3].data = declineData;
        
        // Update chart
        this.charts.timeline.update();
        console.log('Timeline chart updated with', labels.length, 'data points');
        
        // Tambahkan informasi terakhir diperbarui
        this.addLastUpdatedInfo();
    }

    /**
     * Tambahkan informasi terakhir diperbarui
     */
    addLastUpdatedInfo() {
        const container = document.querySelector('.full-width-chart');
        if (!container) return;
        
        // Hapus info terakhir diperbarui jika sudah ada
        const existingInfo = container.querySelector('.last-updated-info');
        if (existingInfo) {
            existingInfo.remove();
        }
        
        // Buat elemen untuk info terakhir diperbarui
        const lastUpdatedInfo = document.createElement('div');
        lastUpdatedInfo.className = 'last-updated-info';
        lastUpdatedInfo.style.fontSize = '0.75rem';
        lastUpdatedInfo.style.color = 'var(--gray-500)';
        lastUpdatedInfo.style.textAlign = 'right';
        lastUpdatedInfo.style.marginTop = '5px';
        lastUpdatedInfo.textContent = `Terakhir diperbarui: ${new Date().toLocaleString('id-ID')}`;
        
        // Tambahkan ke container
        container.appendChild(lastUpdatedInfo);
    }

    /**
     * Kelompokkan data history berdasarkan tanggal
     */
    groupHistoryDataByDate(historyData) {
        const groupedData = {};
        
        if (!historyData || historyData.length === 0) {
            return groupedData;
        }
        
        // Dapatkan semua tanggal unik dari data history
        const uniqueDates = new Set();
        historyData.forEach(record => {
            const date = record.change_date.split('T')[0]; // Ambil hanya tanggal (YYYY-MM-DD)
            uniqueDates.add(date);
        });
        
        // Inisialisasi dengan semua tanggal yang ada di data
        uniqueDates.forEach(date => {
            groupedData[date] = {
                Introduction: 0,
                Growth: 0,
                Maturity: 0,
                Decline: 0
            };
        });
        
        // Hitung jumlah produk di setiap tahap untuk setiap tanggal
        historyData.forEach(record => {
            const date = record.change_date.split('T')[0];
            groupedData[date][record.new_stage]++;
        });
        
        return groupedData;
    }

    /**
     * Format tanggal untuk label chart
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }

    /**
     * Update jenis chart
     */
    updateChartType(chartId, chartType, stacked = false) {
        if (chartId === 'timelineChart' && this.charts.timeline) {
            // Update tombol aktif
            const buttons = document.querySelectorAll('.chart-type-toggle .btn');
            buttons.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.chartType === chartType || (btn.dataset.chartType === 'stacked' && stacked)) {
                    btn.classList.add('active');
                }
            });
            
            // Update jenis chart
            this.charts.timeline.config.type = chartType;
            
            // Update opsi stacked jika diperlukan
            if (chartType === 'bar') {
                this.charts.timeline.options.scales.x.stacked = stacked;
                this.charts.timeline.options.scales.y.stacked = stacked;
            } else {
                this.charts.timeline.options.scales.x.stacked = false;
                this.charts.timeline.options.scales.y.stacked = false;
            }
            
            this.charts.timeline.update();
        }
    }

    /**
     * Tampilkan detail history perubahan lifecycle
     */
    showHistoryDetails() {
        // Buat modal untuk menampilkan detail
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.overflow = 'auto';
        modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
        
        // Buat konten modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.margin = '5% auto';
        modalContent.style.padding = '20px';
        modalContent.style.border = '1px solid #888';
        modalContent.style.width = '80%';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        
        // Buat header modal
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.style.display = 'flex';
        modalHeader.style.justifyContent = 'space-between';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.marginBottom = '15px';
        
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Detail Perubahan Lifecycle Produk';
        modalTitle.style.margin = '0';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.color = '#aaa';
        closeBtn.style.float = 'right';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => modal.remove();
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);
        
        // Buat tabel untuk menampilkan data
        const table = document.createElement('table');
        table.className = 'history-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';
        
        // Buat header tabel
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tanggal</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Produk</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Segmen</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tahap Sebelumnya</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tahap Baru</th>
            </tr>
        `;
        
        // Buat body tabel
        const tbody = document.createElement('tbody');
        
        // Filter data berdasarkan filter yang aktif
        const segmentFilter = document.getElementById('timeline-segment-filter');
        const timeRangeFilter = document.getElementById('timeline-range-filter');
        
        let filteredHistory = [...this.lifecycleHistory];
        
        if (segmentFilter && segmentFilter.value !== 'all') {
            filteredHistory = filteredHistory.filter(record => record.segment === segmentFilter.value);
        }
        
        if (timeRangeFilter && timeRangeFilter.value !== 'all') {
            const daysAgo = parseInt(timeRangeFilter.value);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            
            filteredHistory = filteredHistory.filter(record => {
                const recordDate = new Date(record.change_date);
                return recordDate >= cutoffDate;
            });
        }
        
        // Jika tidak ada data, tambahkan pesan
        if (filteredHistory.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="5" style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">
                    Tidak ada data perubahan lifecycle untuk ditampilkan.
                </td>
            `;
            tbody.appendChild(tr);
        } else {
            // Urutkan data berdasarkan tanggal terbaru
            filteredHistory.sort((a, b) => new Date(b.change_date) - new Date(a.change_date));
            
            // Tambahkan data ke tabel
            filteredHistory.forEach(record => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${new Date(record.change_date).toLocaleString('id-ID')}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${record.product_name}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${record.segment}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${this.stageColors[record.previous_stage] || '#ccc'}; color: white;">
                            ${record.previous_stage || 'Baru'}
                        </span>
                    </td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${this.stageColors[record.new_stage] || '#ccc'}; color: white;">
                            ${record.new_stage}
                        </span>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        // Tambahkan semua elemen ke modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(table);
        modal.appendChild(modalContent);
        
        // Tambahkan modal ke body
        document.body.appendChild(modal);
    }

    /**
     * Tampilkan detail timeline (launch atau history)
     */
    showTimelineDetails() {
        const modeToggle = document.getElementById('timeline-mode-toggle');
        
        if (modeToggle && modeToggle.value === 'launch') {
            this.showLaunchDetails();
        } else {
            this.showHistoryDetails();
        }
    }

    /**
     * Tampilkan detail peluncuran produk
     */
    showLaunchDetails() {
        // Buat modal untuk menampilkan detail
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.overflow = 'auto';
        modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
        
        // Buat konten modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.margin = '5% auto';
        modalContent.style.padding = '20px';
        modalContent.style.border = '1px solid #888';
        modalContent.style.width = '80%';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        
        // Buat header modal
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.style.display = 'flex';
        modalHeader.style.justifyContent = 'space-between';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.marginBottom = '15px';
        
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Detail Timeline Peluncuran Produk';
        modalTitle.style.margin = '0';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.color = '#aaa';
        closeBtn.style.float = 'right';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => modal.remove();
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);
        
        // Buat tabel untuk menampilkan data
        const table = document.createElement('table');
        table.className = 'launch-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';
        
        // Buat header tabel
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tanggal Peluncuran</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Nama Produk</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Segmen</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tahap Lifecycle</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Kategori</th>
            </tr>
        `;
        
        // Buat body tabel
        const tbody = document.createElement('tbody');
        
        // Dapatkan produk yang difilter
        const filteredProducts = this.getFilteredProducts();
        
        // Jika tidak ada data, tambahkan pesan
        if (filteredProducts.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="5" style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">
                    Tidak ada data peluncuran produk untuk ditampilkan.
                </td>
            `;
            tbody.appendChild(tr);
        } else {
            // Urutkan data berdasarkan tanggal peluncuran terbaru
            filteredProducts.sort((a, b) => new Date(b.launch_date) - new Date(a.launch_date));
            
            // Tambahkan data ke tabel
            filteredProducts.forEach(product => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${new Date(product.launch_date).toLocaleDateString('id-ID')}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${product.name}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${this.segmentColors[product.segment] || '#ccc'}; color: white;">
                            ${product.segment}
                        </span>
                    </td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${this.stageColors[product.lifecycle_stage] || '#ccc'}; color: white;">
                            ${product.lifecycle_stage}
                        </span>
                    </td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${product.category || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        // Tambahkan semua elemen ke modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(table);
        modal.appendChild(modalContent);
        
        // Tambahkan modal ke body
        document.body.appendChild(modal);
    }

    /**
     * Tambahkan kontrol untuk timeline
     */
    addTimelineControls() {
        const container = document.querySelector('.full-width-chart');
        if (!container) {
            console.error('Container for timeline controls not found');
            return;
        }
        
        // Buat div untuk kontrol
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'timeline-controls';
        controlsDiv.style.display = 'flex';
        controlsDiv.style.justifyContent = 'space-between';
        controlsDiv.style.marginBottom = '15px';
        controlsDiv.style.alignItems = 'center';
        
        // Toggle untuk mode timeline (Launch vs History)
        const modeToggle = document.createElement('select');
        modeToggle.id = 'timeline-mode-toggle';
        modeToggle.style.padding = '5px';
        modeToggle.style.borderRadius = '4px';
        modeToggle.style.border = '1px solid var(--gray-200)';
        modeToggle.innerHTML = `
            <option value="launch">Timeline Peluncuran Produk</option>
            <option value="history">Timeline Perubahan Lifecycle</option>
        `;
        
        // Filter untuk segmen
        const segmentFilter = document.createElement('select');
        segmentFilter.id = 'timeline-segment-filter';
        segmentFilter.style.padding = '5px';
        segmentFilter.style.borderRadius = '4px';
        segmentFilter.style.border = '1px solid var(--gray-200)';
        segmentFilter.innerHTML = '<option value="all">Semua Segmen</option>';
        this.segments.forEach(segment => {
            segmentFilter.innerHTML += `<option value="${segment}">${segment}</option>`;
        });
        
        // Filter untuk rentang waktu
        const timeRangeFilter = document.createElement('select');
        timeRangeFilter.id = 'timeline-range-filter';
        timeRangeFilter.style.padding = '5px';
        timeRangeFilter.style.borderRadius = '4px';
        timeRangeFilter.style.border = '1px solid var(--gray-200)';
        timeRangeFilter.innerHTML = `
            <option value="30">30 Hari Terakhir</option>
            <option value="90">3 Bulan Terakhir</option>
            <option value="180">6 Bulan Terakhir</option>
            <option value="365">1 Tahun Terakhir</option>
            <option value="730">2 Tahun Terakhir</option>
            <option value="all" selected>Semua Data</option>
        `;
        
        // Toggle untuk jenis chart
        const chartTypeToggle = document.createElement('div');
        chartTypeToggle.className = 'chart-type-toggle';
        chartTypeToggle.style.display = 'flex';
        chartTypeToggle.style.gap = '10px';
        
        const lineChartBtn = document.createElement('button');
        lineChartBtn.className = 'btn btn-sm active';
        lineChartBtn.dataset.chartType = 'line';
        lineChartBtn.innerHTML = '<i class="fas fa-chart-line"></i> Line';
        lineChartBtn.onclick = () => this.updateChartType('timelineChart', 'line');
        
        const barChartBtn = document.createElement('button');
        barChartBtn.className = 'btn btn-sm';
        barChartBtn.dataset.chartType = 'bar';
        barChartBtn.innerHTML = '<i class="fas fa-chart-bar"></i> Bar';
        barChartBtn.onclick = () => this.updateChartType('timelineChart', 'bar');
        
        const scatterChartBtn = document.createElement('button');
        scatterChartBtn.className = 'btn btn-sm';
        scatterChartBtn.dataset.chartType = 'scatter';
        scatterChartBtn.innerHTML = '<i class="fas fa-braille"></i> Scatter';
        scatterChartBtn.onclick = () => this.updateChartType('timelineChart', 'scatter');
        
        chartTypeToggle.appendChild(lineChartBtn);
        chartTypeToggle.appendChild(barChartBtn);
        chartTypeToggle.appendChild(scatterChartBtn);
        
        // Tambahkan label dan filter ke kontrol
        const filterDiv = document.createElement('div');
        filterDiv.style.display = 'flex';
        filterDiv.style.gap = '10px';
        filterDiv.style.alignItems = 'center';
        
        const modeLabel = document.createElement('span');
        modeLabel.textContent = 'Mode:';
        modeLabel.style.fontSize = '0.9rem';
        
        const segmentLabel = document.createElement('span');
        segmentLabel.textContent = 'Segmen:';
        segmentLabel.style.fontSize = '0.9rem';
        
        const timeRangeLabel = document.createElement('span');
        timeRangeLabel.textContent = 'Periode:';
        timeRangeLabel.style.fontSize = '0.9rem';
        
        filterDiv.appendChild(modeLabel);
        filterDiv.appendChild(modeToggle);
        filterDiv.appendChild(segmentLabel);
        filterDiv.appendChild(segmentFilter);
        filterDiv.appendChild(timeRangeLabel);
        filterDiv.appendChild(timeRangeFilter);
        
        controlsDiv.appendChild(filterDiv);
        controlsDiv.appendChild(chartTypeToggle);
        
        // Tambahkan event listener
        modeToggle.addEventListener('change', () => this.switchTimelineMode());
        segmentFilter.addEventListener('change', () => this.filterTimelineData());
        timeRangeFilter.addEventListener('change', () => this.filterTimelineData());
        
        // Sisipkan kontrol setelah judul
        const title = container.querySelector('h3');
        if (title && title.nextSibling) {
            container.insertBefore(controlsDiv, title.nextSibling.nextSibling);
        } else {
            container.appendChild(controlsDiv);
        }
        
        // Tambahkan tombol untuk melihat detail produk
        const viewDetailsBtn = document.createElement('button');
        viewDetailsBtn.className = 'btn btn-sm';
        viewDetailsBtn.innerHTML = '<i class="fas fa-list"></i> Lihat Detail';
        viewDetailsBtn.style.marginLeft = '10px';
        viewDetailsBtn.onclick = () => this.showTimelineDetails();
        
        chartTypeToggle.appendChild(viewDetailsBtn);
    }

    /**
     * Switch antara mode launch timeline dan history timeline
     */
    switchTimelineMode() {
        const modeToggle = document.getElementById('timeline-mode-toggle');
        if (!modeToggle) return;
        
        if (modeToggle.value === 'launch') {
            this.updateLaunchTimeline();
        } else {
            this.updateTimelineChart(this.lifecycleHistory);
        }
    }

    /**
     * Update timeline chart untuk menampilkan data peluncuran produk sebagai timeline
     * Visualisasi timeline peluncuran produk berdasarkan launch_date dari tabel products
     */
    updateLaunchTimeline() {
        if (!this.charts.timeline) {
            this.initTimelineChart();
            if (!this.charts.timeline) return;
        }
        let filteredProducts = this.getFilteredProducts();
        if (!filteredProducts || filteredProducts.length === 0) {
            this.addDummyLaunchData();
            filteredProducts = this.getFilteredProducts();
            if (!filteredProducts || filteredProducts.length === 0) return;
        }
        const groupedData = this.groupProductsByLaunchDate(filteredProducts);
        const months = Object.keys(groupedData).sort((a, b) => new Date(a) - new Date(b));
        const labels = months.map(month => this.formatMonthYear(month));
        const datasets = [];
        this.segments.forEach((segment, idx) => {
            const data = months.map(month => groupedData[month][segment] || 0);
            datasets.push({
                label: segment,
                data: data,
                borderColor: this.segmentColors[segment],
                backgroundColor: this.segmentColors[segment] + 'CC', // 80% opacity
                tension: 0.4,
                fill: true,
                pointRadius: 5,
                pointHoverRadius: 8,
                borderWidth: 3,
                stepped: false
            });
        });
        this.charts.timeline.data.labels = labels;
        this.charts.timeline.data.datasets = datasets;
        // Custom tooltip for launch timeline
        this.charts.timeline.options.plugins.tooltip.callbacks.label = (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value} produk diluncurkan`;
        };
        // Improve legend and axis color for better visibility
        this.charts.timeline.options.plugins.legend.labels.color = '#0f172a';
        this.charts.timeline.options.scales.x.ticks.color = '#0f172a';
        this.charts.timeline.options.scales.y.ticks.color = '#0f172a';
        this.charts.timeline.options.scales.x.grid.color = '#e2e8f0';
        this.charts.timeline.options.scales.y.grid.color = '#e2e8f0';
        this.charts.timeline.update();
        this.addLastUpdatedInfo();
    }

    /**
     * Kelompokkan produk berdasarkan bulan peluncuran
     */
    groupProductsByLaunchDate(products) {
        const groupedData = {};
        
        if (!products || products.length === 0) {
            return groupedData;
        }
        
        // Dapatkan semua bulan unik dari data produk
        const uniqueMonths = new Set();
        products.forEach(product => {
            if (product.launch_date) {
                const date = new Date(product.launch_date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                uniqueMonths.add(monthKey);
            }
        });
        
        // Inisialisasi dengan semua bulan yang ada di data
        uniqueMonths.forEach(month => {
            groupedData[month] = {};
            this.segments.forEach(segment => {
                groupedData[month][segment] = 0;
            });
        });
        
        // Hitung jumlah produk di setiap segmen untuk setiap bulan
        products.forEach(product => {
            if (product.launch_date && product.segment) {
                const date = new Date(product.launch_date);
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (groupedData[monthKey]) {
                    groupedData[monthKey][product.segment]++;
                }
            }
        });
        
        return groupedData;
    }

    /**
     * Format bulan-tahun untuk label chart
     */
    formatMonthYear(monthString) {
        const [year, month] = monthString.split('-');
        const date = new Date(year, month - 1);
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }

    /**
     * Dapatkan produk yang difilter berdasarkan kontrol
     */
    getFilteredProducts() {
        const segmentFilter = document.getElementById('timeline-segment-filter');
        const timeRangeFilter = document.getElementById('timeline-range-filter');
        
        let filteredProducts = [...this.products];
        
        // Filter berdasarkan segmen
        if (segmentFilter && segmentFilter.value !== 'all') {
            filteredProducts = filteredProducts.filter(product => product.segment === segmentFilter.value);
        }
        
        // Filter berdasarkan rentang waktu
        if (timeRangeFilter && timeRangeFilter.value !== 'all') {
            const daysAgo = parseInt(timeRangeFilter.value);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
            
            filteredProducts = filteredProducts.filter(product => {
                if (!product.launch_date) return false;
                const launchDate = new Date(product.launch_date);
                return launchDate >= cutoffDate;
            });
        }
        
        return filteredProducts;
    }

    /**
     * Tampilkan detail timeline (launch atau history)
     */
    showTimelineDetails() {
        const modeToggle = document.getElementById('timeline-mode-toggle');
        
        if (modeToggle && modeToggle.value === 'launch') {
            this.showLaunchDetails();
        } else {
            this.showHistoryDetails();
        }
    }

    /**
     * Tampilkan detail peluncuran produk
     */
    showLaunchDetails() {
        // Buat modal untuk menampilkan detail
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'block';
        modal.style.position = 'fixed';
        modal.style.zIndex = '1000';
        modal.style.left = '0';
        modal.style.top = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.overflow = 'auto';
        modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
        
        // Buat konten modal
        const modalContent = document.createElement('div');
        modalContent.className = 'modal-content';
        modalContent.style.backgroundColor = 'white';
        modalContent.style.margin = '5% auto';
        modalContent.style.padding = '20px';
        modalContent.style.border = '1px solid #888';
        modalContent.style.width = '80%';
        modalContent.style.borderRadius = '8px';
        modalContent.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        
        // Buat header modal
        const modalHeader = document.createElement('div');
        modalHeader.className = 'modal-header';
        modalHeader.style.display = 'flex';
        modalHeader.style.justifyContent = 'space-between';
        modalHeader.style.alignItems = 'center';
        modalHeader.style.marginBottom = '15px';
        
        const modalTitle = document.createElement('h3');
        modalTitle.textContent = 'Detail Timeline Peluncuran Produk';
        modalTitle.style.margin = '0';
        
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.color = '#aaa';
        closeBtn.style.float = 'right';
        closeBtn.style.fontSize = '28px';
        closeBtn.style.fontWeight = 'bold';
        closeBtn.style.cursor = 'pointer';
        closeBtn.onclick = () => modal.remove();
        
        modalHeader.appendChild(modalTitle);
        modalHeader.appendChild(closeBtn);
        
        // Buat tabel untuk menampilkan data
        const table = document.createElement('table');
        table.className = 'launch-table';
        table.style.width = '100%';
        table.style.borderCollapse = 'collapse';
        table.style.marginTop = '10px';
        
        // Buat header tabel
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tanggal Peluncuran</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Nama Produk</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Segmen</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Tahap Lifecycle</th>
                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd; background-color: #f2f2f2;">Kategori</th>
            </tr>
        `;
        
        // Buat body tabel
        const tbody = document.createElement('tbody');
        
        // Dapatkan produk yang difilter
        const filteredProducts = this.getFilteredProducts();
        
        // Jika tidak ada data, tambahkan pesan
        if (filteredProducts.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td colspan="5" style="padding: 8px; text-align: center; border-bottom: 1px solid #ddd;">
                    Tidak ada data peluncuran produk untuk ditampilkan.
                </td>
            `;
            tbody.appendChild(tr);
        } else {
            // Urutkan data berdasarkan tanggal peluncuran terbaru
            filteredProducts.sort((a, b) => new Date(b.launch_date) - new Date(a.launch_date));
            
            // Tambahkan data ke tabel
            filteredProducts.forEach(product => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${new Date(product.launch_date).toLocaleDateString('id-ID')}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${product.name}</td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${this.segmentColors[product.segment] || '#ccc'}; color: white;">
                            ${product.segment}
                        </span>
                    </td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">
                        <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; background-color: ${this.stageColors[product.lifecycle_stage] || '#ccc'}; color: white;">
                            ${product.lifecycle_stage}
                        </span>
                    </td>
                    <td style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">${product.category || '-'}</td>
                `;
                tbody.appendChild(tr);
            });
        }
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        // Tambahkan semua elemen ke modal
        modalContent.appendChild(modalHeader);
        modalContent.appendChild(table);
        modal.appendChild(modalContent);
        
        // Tambahkan modal ke body
        document.body.appendChild(modal);
    }
}

// Export modul
export { TimelineAnalysis };