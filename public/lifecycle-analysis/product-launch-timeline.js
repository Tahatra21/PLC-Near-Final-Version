// Product Launch Timeline Scatter Chart
(function() {
  const segmentColors = {
    'Pembangkitan': '#06b6d4',
    'Transmisi': '#10b981',
    'Distribusi': '#f59e0b',
    'Korporat': '#8b5cf6',
    'Pelayanan Pelanggan': '#ec4899'
  };
  const segments = Object.keys(segmentColors);

  async function fetchProducts() {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return await res.json();
    } catch (e) {
      // Dummy data fallback
      return [
        { name: 'Produk A', launch_date: '2023-01-15', segment: 'Pembangkitan' },
        { name: 'Produk B', launch_date: '2023-02-10', segment: 'Transmisi' },
        { name: 'Produk C', launch_date: '2023-02-20', segment: 'Distribusi' },
        { name: 'Produk D', launch_date: '2023-03-05', segment: 'Korporat' }
      ];
    }
  }

  function prepareDatasets(products) {
    const segmentMap = {};
    segments.forEach(seg => segmentMap[seg] = []);
    products.forEach(p => {
      if (!p.launch_date || !p.segment) return;
      const date = new Date(p.launch_date);
      segmentMap[p.segment].push({
        x: date.getFullYear(),
        y: date.getMonth() + 1,
        label: p.name,
        date: date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })
      });
    });
    return segments.map(seg => ({
      label: seg,
      data: segmentMap[seg],
      backgroundColor: segmentColors[seg],
      pointRadius: 7,
      pointHoverRadius: 10
    }));
  }

  function renderChart(datasets, minYear, maxYear) {
    const canvas = document.getElementById('timelineChart');
    if (!canvas) return;
    // Destroy chart dari modul lain jika ada
    if (window.timelineChart && typeof window.timelineChart.destroy === 'function') {
      window.timelineChart.destroy();
      window.timelineChart = null;
    }
    // Destroy chart dari modul ini jika ada
    if (window.productLaunchTimelineChart && typeof window.productLaunchTimelineChart.destroy === 'function') {
      window.productLaunchTimelineChart.destroy();
    }
    window.productLaunchTimelineChart = new Chart(canvas.getContext('2d'), {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#0f172a', usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: (context) => {
                const d = context.raw;
                return `${d.label} (${d.date})`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Tahun', color: '#222' },
            ticks: {
              color: '#222',
              stepSize: 1,
              precision: 0,
              callback: v => Number.isInteger(v) ? v : null // hanya tampilkan tahun bulat
            },
            min: minYear,
            max: maxYear
          },
          y: {
            type: 'linear',
            title: { display: true, text: 'Bulan', color: '#222' },
            min: 1, max: 12,
            ticks: {
              color: '#222',
              callback: v => ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][v-1]
            }
          }
        }
      }
    });
  }

  async function waitForLifecycleTabAndRender() {
    const lifecycleTab = document.getElementById('lifecycle');
    if (!lifecycleTab) {
      // Coba lagi setelah DOM siap
      document.addEventListener('DOMContentLoaded', waitForLifecycleTabAndRender);
      return;
    }
    const observer = new MutationObserver(async () => {
      if (lifecycleTab.style.display !== 'none') {
        const products = await fetchProducts();
        const years = products.map(p => p.launch_date ? new Date(p.launch_date).getFullYear() : null).filter(Boolean);
        const minYear = Math.min(...years, 2020);
        const maxYear = Math.max(...years, new Date().getFullYear());
        const datasets = prepareDatasets(products);
        renderChart(datasets, minYear, maxYear);
        observer.disconnect();
      }
    });
    observer.observe(lifecycleTab, { attributes: true, attributeFilter: ['style'] });
    if (lifecycleTab.style.display !== 'none') {
      const products = await fetchProducts();
      const years = products.map(p => p.launch_date ? new Date(p.launch_date).getFullYear() : null).filter(Boolean);
      const minYear = Math.min(...years, 2020);
      const maxYear = Math.max(...years, new Date().getFullYear());
      const datasets = prepareDatasets(products);
      renderChart(datasets, minYear, maxYear);
      observer.disconnect();
    }
  }

  waitForLifecycleTabAndRender();
})();