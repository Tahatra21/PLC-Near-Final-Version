// Product Timeline Visualization
// Requires Chart.js to be loaded in your HTML

async function fetchProducts() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/products', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
    if (!response.ok) throw new Error('Failed to fetch products');
    return await response.json();
}

function groupByMonth(products) {
    const grouped = {};
    products.forEach(product => {
        if (!product.launch_date) return;
        const date = new Date(product.launch_date);
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        if (!grouped[key]) grouped[key] = 0;
        grouped[key]++;
    });
    return grouped;
}

function formatMonthYear(key) {
    const [year, month] = key.split('-');
    const date = new Date(year, month - 1);
    return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
}

async function renderProductTimeline(canvasId) {
    try {
        const products = await fetchProducts();
        const grouped = groupByMonth(products);
        const months = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
        const labels = months.map(formatMonthYear);
        const data = months.map(month => grouped[month]);
        const ctx = document.getElementById(canvasId).getContext('2d');
        // Destroy previous chart instance if exists
        if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
            window.timelineChart.destroy();
        }
        window.timelineChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Product Launches',
                    data: data,
                    borderColor: '#06b6d4',
                    backgroundColor: 'rgba(6,182,212,0.3)',
                    fill: true,
                    tension: 0.4,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    borderWidth: 3
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { labels: { color: '#0f172a' } },
                    tooltip: {
                        callbacks: {
                            label: ctx => `Peluncuran: ${ctx.raw} produk`
                        }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#0f172a' },
                        grid: { color: '#e2e8f0' }
                    },
                    y: {
                        ticks: { color: '#0f172a' },
                        grid: { color: '#e2e8f0' }
                    }
                }
            }
        });
    } catch (err) {
        alert('Failed to load timeline data: ' + err.message);
    }
}

function renderLifecyclePieChart(products) {
    const stageCounts = {
        Introduction: 0,
        Growth: 0,
        Maturity: 0,
        Decline: 0
    };
    products.forEach(product => {
        const stage = product.lifecycle_stage || 'Introduction';
        if (stageCounts[stage] !== undefined) {
            stageCounts[stage]++;
        }
    });
    const ctx = document.getElementById('lifecyclePieChart').getContext('2d');
    if (window.lifecyclePieChartInstance) {
        window.lifecyclePieChartInstance.destroy();
    }
    window.lifecyclePieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(stageCounts),
            datasets: [{
                data: Object.values(stageCounts),
                backgroundColor: [
                    '#36A2EB', // Introduction
                    '#4BC0C0', // Growth
                    '#FFCE56', // Maturity
                    '#FF6384'  // Decline
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                title: {
                    display: true,
                    text: 'Product Lifecycle Distribution'
                }
            }
        }
    });
}
// Usage example (call this after DOM is ready):
// renderProductTimeline('timelineChart');
// Setelah data produk di-load, panggil fungsi ini:
// renderLifecyclePieChart(products);