class TransitionDataDisplay {
    constructor() {
        this.stages = ['Introduction', 'Growth', 'Maturity', 'Decline'];
        this.segments = ['Kit & EP', 'Transmisi', 'Distribusi', 'Korporat', 'PP'];
        this.transitionData = {};
        this.selectedCell = null;
        this.init();
    }

    init() {
        // Tambahkan CSS untuk tabel
        this.addStyles();
        
        // Tampilkan data saat halaman dimuat
        document.addEventListener('DOMContentLoaded', () => {
            this.loadTransitionData();
        });

        // Tambahkan event listener untuk update saat ada perubahan data
        document.addEventListener('productDataUpdated', () => {
            this.loadTransitionData();
        });
    }
    
    /**
     * Menambahkan styles untuk tabel
     */
    addStyles() {
        const styleEl = document.createElement('style');
        styleEl.textContent = `
            .transition-table-container {
                width: 100%;
                height: 10px;
                overflow: auto;
                position: relative;
            }
            .transition-table {
                width: 100%;
                table-layout: fixed;
                border-collapse: collapse;
                font-size: 0.75rem;
                transition: all 0.3s ease;
            }
            .transition-table th, .transition-table td {
                padding: 10px;
                border: 1px solid rgba(15, 23, 42, 0.1);
                text-align: center;
                transition: all 0.2s ease;
                width: calc(100% / 6); /* Untuk 5 segmen + 1 kolom header */
                min-width: 80px;
                max-width: 120px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .transition-table th {
                font-weight: 600;
                background-color: rgba(6, 182, 212, 0.05);
                position: sticky;
                top: 0;
                z-index: 10;
            }
            .transition-table td:first-child {
                font-weight: 600;
                background-color: rgba(6, 182, 212, 0.05);
                position: sticky;
                left: 0;
                z-index: 5;
            }
            .transition-table td.highlight {
                transform: scale(1.05);
                box-shadow: 0 0 8px rgba(6, 182, 212, 0.5);
                z-index: 10;
                position: relative;
            }
            .transition-table td:hover {
                cursor: pointer;
                opacity: 0.9;
            }
            .heatmap-tooltip {
                position: fixed;
                background: rgba(15, 23, 42, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 0.75rem;
                pointer-events: none;
                z-index: 100;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                max-width: 200px;
                opacity: 0;
                transition: opacity 0.2s ease;
            }
            .heatmap-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
                font-size: 0.75rem;
            }
            .heatmap-controls select {
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid var(--gray-200);
                background-color: white;
                font-size: 0.75rem;
            }
            .heatmap-legend {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 0.7rem;
                margin-top: 8px;
                justify-content: center;
            }
            .legend-item {
                display: flex;
                align-items: center;
                gap: 4px;
            }
        `;
        document.head.appendChild(styleEl);
    }

    /**
     * Memuat data transisi dari database
     */
    async loadTransitionData() {
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
            console.log('Lifecycle history data loaded:', historyData);
            
            // Jika berhasil mendapatkan data, proses dan tampilkan
            if (historyData && historyData.length > 0) {
                this.processTransitionData(historyData);
            } else {
                // Gunakan data sampel jika tidak ada data
                this.useSampleData();
            }
        } catch (error) {
            console.error('Error loading transition data:', error);
            // Fallback ke data sampel jika terjadi error
            this.useSampleData();
        }
    }

    /**
     * Memproses data transisi dari history
     */
    processTransitionData(historyData) {
        // Reset data transisi
        this.transitionData = {};
        
        // Proses data history untuk mendapatkan transisi berdasarkan segmen
        historyData.forEach(record => {
            if (record.product && record.previous_stage && record.new_stage) {
                const segment = record.product.segment || 'Unknown';
                const key = `${segment}-${record.new_stage}`;
                
                this.transitionData[key] = (this.transitionData[key] || 0) + 1;
            }
        });
        
        // Tampilkan data
        this.displayTransitionData();
    }

    /**
     * Menggunakan data sampel jika tidak ada data nyata
     */
    useSampleData() {
        this.transitionData = {};
        
        // Buat data sampel untuk setiap kombinasi segmen dan tahap
        this.segments.forEach(segment => {
            this.stages.forEach(stage => {
                // Buat data sampel yang masuk akal
                const count = Math.floor(Math.random() * 10);
                if (count > 0) {
                    this.transitionData[`${segment}-${stage}`] = count;
                }
            });
        });
        
        // Tampilkan data
        this.displayTransitionData();
    }

    /**
     * Mendapatkan nilai maksimum dari data transisi
     */
    getMaxValue() {
        let max = 0;
        Object.values(this.transitionData).forEach(value => {
            if (value > max) max = value;
        });
        return max > 0 ? max : 10; // Default ke 10 jika tidak ada data
    }

    /**
     * Menampilkan data transisi dalam bentuk tabel
     */
    displayTransitionData() {
        // Cari container untuk menampilkan data
        const container = document.getElementById('heatmapMatrixContainer');
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        // Hapus konten sebelumnya
        container.innerHTML = '';
        
        // Tambahkan judul
        const title = document.createElement('h4');
        title.style.marginBottom = '8px';
        title.style.textAlign = 'center';
        title.style.color = '#0f172a';
        title.style.fontSize = '0.9rem';
        container.appendChild(title);
        
        // Tambahkan kontrol untuk filter dan sorting
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'heatmap-controls';
        
        // Filter untuk segmen
        const segmentFilter = document.createElement('select');
        segmentFilter.innerHTML = '<option value="all">Semua Segmen</option>';
        this.segments.forEach(segment => {
            segmentFilter.innerHTML += `<option value="${segment}">${segment}</option>`;
        });
        segmentFilter.addEventListener('change', () => this.filterData());
        segmentFilter.id = 'segment-filter';
        
        // Filter untuk tahap
        const stageFilter = document.createElement('select');
        stageFilter.innerHTML = '<option value="all">Semua Tahap</option>';
        this.stages.forEach(stage => {
            stageFilter.innerHTML += `<option value="${stage}">${stage}</option>`;
        });
        stageFilter.addEventListener('change', () => this.filterData());
        stageFilter.id = 'stage-filter';
        
        // Tambahkan filter ke kontrol
        const filterDiv = document.createElement('div');
        filterDiv.innerHTML = '<span>Filter: </span>';
        filterDiv.appendChild(segmentFilter);
        filterDiv.appendChild(stageFilter);
        controlsDiv.appendChild(filterDiv);
        
        container.appendChild(controlsDiv);
        
        // Buat container untuk tabel dengan ukuran tetap
        const tableContainer = document.createElement('div');
        tableContainer.className = 'transition-table-container';
        container.appendChild(tableContainer);
        
        // Buat tabel untuk menampilkan data
        const table = document.createElement('table');
        table.className = 'transition-table';
        table.id = 'heatmap-table';
        tableContainer.appendChild(table);
        
        // Buat header tabel
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        // Header kosong untuk kolom pertama
        const emptyHeader = document.createElement('th');
        headerRow.appendChild(emptyHeader);
        
        // Header untuk setiap segmen bisnis
        this.segments.forEach(segment => {
            const th = document.createElement('th');
            th.textContent = segment;
            th.dataset.segment = segment;
            headerRow.appendChild(th);
        });
        
        thead.appendChild(headerRow);
        table.appendChild(thead);
        
        // Buat body tabel
        const tbody = document.createElement('tbody');
        
        // Nilai maksimum untuk normalisasi warna
        const maxValue = this.getMaxValue();
        
        // Buat baris untuk setiap tahap lifecycle
        this.stages.forEach(stage => {
            const row = document.createElement('tr');
            
            // Kolom pertama adalah nama tahap
            const stageNameCell = document.createElement('td');
            stageNameCell.textContent = stage;
            stageNameCell.dataset.stage = stage;
            row.appendChild(stageNameCell);
            
            // Kolom untuk setiap segmen bisnis
            this.segments.forEach(segment => {
                const cell = document.createElement('td');
                
                // Cari data transisi
                const count = this.transitionData[`${segment}-${stage}`] || 0;
                
                // Tampilkan jumlah transisi
                cell.textContent = count;
                cell.dataset.count = count;
                cell.dataset.segment = segment;
                cell.dataset.stage = stage;
                
                // Beri warna berdasarkan jumlah
                if (count > 0) {
                    const intensity = Math.min(count / maxValue, 1);
                    cell.style.backgroundColor = `rgba(6, 182, 212, ${intensity})`;
                    // Jika intensitas tinggi, gunakan teks putih untuk kontras
                    if (intensity > 0.5) {
                        cell.style.color = 'white';
                    } else {
                        cell.style.color = '#0f172a'; // Teks gelap untuk intensitas rendah
                    }
                }
                
                // Tambahkan event listener untuk interaktivitas
                cell.addEventListener('mouseover', (e) => this.showTooltip(e, segment, stage, count));
                cell.addEventListener('mouseout', () => this.hideTooltip());
                cell.addEventListener('click', () => this.highlightCell(cell));
                
                row.appendChild(cell);
            });
            
            tbody.appendChild(row);
        });
        
        table.appendChild(tbody);
        container.appendChild(table);
        
        // Tambahkan tooltip element
        const tooltip = document.createElement('div');
        tooltip.className = 'heatmap-tooltip';
        tooltip.id = 'heatmap-tooltip';
        container.appendChild(tooltip);
        
        // Tambahkan legend
        this.addLegend(container, maxValue);
        
        // Tambahkan keterangan update terakhir
        const lastUpdate = document.createElement('div');
        lastUpdate.textContent = `Terakhir diperbarui: ${new Date().toLocaleString()}`;
        lastUpdate.style.fontSize = '0.65rem';
        lastUpdate.style.textAlign = 'right';
        lastUpdate.style.marginTop = '5px';
        lastUpdate.style.color = '#64748b';
        container.appendChild(lastUpdate);
    }
    
    /**
     * Menampilkan tooltip saat hover pada sel
     */
    showTooltip(event, segment, stage, count) {
        const tooltip = document.getElementById('heatmap-tooltip');
        if (!tooltip) return;
        
        tooltip.innerHTML = `
            <div><strong>Segmen:</strong> ${segment}</div>
            <div><strong>Tahap:</strong> ${stage}</div>
            <div><strong>Jumlah:</strong> ${count} produk</div>
        `;
        
        // Posisikan tooltip tepat di atas sel yang di-hover
        const cell = event.target;
        const cellRect = cell.getBoundingClientRect();
        
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${cellRect.left + (cellRect.width / 2)}px`;
        tooltip.style.top = `${cellRect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
        tooltip.style.opacity = '1';
    }
    
    /**
     * Menyembunyikan tooltip
     */
    hideTooltip() {
        const tooltip = document.getElementById('heatmap-tooltip');
        if (tooltip) {
            tooltip.style.opacity = '0';
        }
    }
    
    /**
     * Highlight sel yang diklik
     */
    highlightCell(cell) {
        // Hapus highlight dari sel sebelumnya
        if (this.selectedCell) {
            this.selectedCell.classList.remove('highlight');
        }
        
        // Jika sel yang sama diklik, hapus highlight
        if (this.selectedCell === cell) {
            this.selectedCell = null;
            return;
        }
        
        // Highlight sel baru
        cell.classList.add('highlight');
        this.selectedCell = cell;
        
        // Tampilkan detail tambahan jika diperlukan
        const segment = cell.dataset.segment;
        const stage = cell.dataset.stage;
        const count = cell.dataset.count;
        
        console.log(`Detail untuk ${segment} - ${stage}: ${count} produk`);
        // Di sini bisa ditambahkan kode untuk menampilkan detail tambahan
    }
    
    /**
     * Filter data berdasarkan pilihan user
     */
    filterData() {
        const segmentFilter = document.getElementById('segment-filter').value;
        const stageFilter = document.getElementById('stage-filter').value;
        
        const table = document.getElementById('heatmap-table');
        if (!table) return;
        
        // Filter baris (tahap)
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const stageCell = row.querySelector('td[data-stage]');
            if (!stageCell) return;
            
            const stage = stageCell.dataset.stage;
            if (stageFilter === 'all' || stage === stageFilter) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
        
        // Filter kolom (segmen)
        const headerCells = table.querySelectorAll('thead th[data-segment]');
        const dataCells = table.querySelectorAll('tbody td[data-segment]');
        
        headerCells.forEach(cell => {
            const segment = cell.dataset.segment;
            if (segmentFilter === 'all' || segment === segmentFilter) {
                cell.style.display = '';
            } else {
                cell.style.display = 'none';
            }
        });
        
        dataCells.forEach(cell => {
            const segment = cell.dataset.segment;
            if (segmentFilter === 'all' || segment === segmentFilter) {
                cell.style.display = '';
            } else {
                cell.style.display = 'none';
            }
        });
    }
    
    /**
     * Menambahkan legend untuk heatmap
     */
    addLegend(container, maxValue) {
        const legendDiv = document.createElement('div');
        legendDiv.className = 'heatmap-legend';
        
        // Buat 5 level intensitas
        const levels = 5;
        for (let i = 0; i < levels; i++) {
            const intensity = i / (levels - 1);
            const value = Math.round(intensity * maxValue);
            
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const colorBox = document.createElement('div');
            colorBox.className = 'legend-color';
            colorBox.style.backgroundColor = `rgba(6, 182, 212, ${intensity})`;
            
            const label = document.createElement('span');
            label.textContent = value;
            
            legendItem.appendChild(colorBox);
            legendItem.appendChild(label);
            legendDiv.appendChild(legendItem);
        }
        
        container.appendChild(legendDiv);
    }
}

// Inisialisasi display
const transitionDisplay = new TransitionDataDisplay();