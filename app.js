// Optimized for IoT - Minimal JS
document.addEventListener('DOMContentLoaded', () => {
    const elements = {
        fetchButton: document.getElementById('fetchButton'),
        saveButton: document.getElementById('saveButton'),
        dataContainer: document.getElementById('dataContainer'),
        modal: document.getElementById('saveModal'),
        closeButton: document.querySelector('.close-button'),
        saveForm: document.getElementById('saveForm'),
        itemCodeInput: document.getElementById('itemCode'),
        itemNameInput: document.getElementById('itemName'),
        viewDataButton: document.getElementById('viewDataButton'),
        viewDataModal: document.getElementById('viewDataModal'),
        closeViewButton: document.querySelector('.close-view-button'),
        dataListContainer: document.getElementById('dataListContainer')
    };

    let scaleData = null;
    let currentPage = 1;
    let totalPages = 1;

    // Generate random weight data
    function generateWeightData() {
        const weight = (Math.random() * 50 + 50).toFixed(1);
        const scaleId = `ID-${Date.now()}`;
        const location = "Gudang";
        const now = new Date();
        const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
        const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const datetime = `${date} ${time}`;

        return { weight, scaleId, location, datetime };
    }

    // Display weight data
    function displayWeightData(data) {
        elements.dataContainer.innerHTML = `
            <div class="details-container">
                <div class="detail-item"><strong>ID:</strong> ${data.scaleId}</div>
                <div class="detail-item"><strong>Lokasi:</strong> ${data.location}</div>
                <div class="detail-item"><strong>Waktu:</strong> ${data.datetime}</div>
            </div>
            <div class="weight-display">${data.weight} kg</div>
        `;
        elements.saveButton.disabled = false;
    }
    
    // Event Listeners - Minimal
    elements.fetchButton.addEventListener('click', () => {
        elements.dataContainer.classList.add('fade-out');
        setTimeout(() => {
            scaleData = generateWeightData();
            displayWeightData(scaleData);
            elements.dataContainer.classList.remove('fade-out');
        }, 300);
    });

    elements.saveButton.addEventListener('click', () => {
        if (!elements.saveButton.disabled) {
            elements.modal.style.display = 'block';
        }
    });

    elements.closeButton.addEventListener('click', () => {
        elements.modal.style.display = 'none';
    });

    // Save form
    elements.saveForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            ...scaleData,
            itemCode: elements.itemCodeInput.value.trim(),
            itemName: elements.itemNameInput.value.trim()
        };

        try {
            const response = await fetch('/api/weights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Network error');
            elements.modal.style.display = 'none';
            elements.saveForm.reset();
            elements.saveButton.disabled = true;
            elements.dataContainer.innerHTML = '<p>Klik tombol untuk menampilkan data</p>';
        } catch (error) {
            alert('Gagal menyimpan: ' + error.message);
        }
    });

    // View data with pagination
    async function loadData(page = 1) {
        try {
            // Use smaller limit for mobile to reduce scroll
            const isMobile = window.innerWidth <= 600;
            const limit = isMobile ? 10 : 10;
            
            const response = await fetch(`/api/weights?page=${page}&limit=${limit}`);
            if (!response.ok) throw new Error('Failed to fetch');
            
            const result = await response.json();
            currentPage = result.pagination.currentPage;
            totalPages = result.pagination.totalPages;
            
            if (result.data.length === 0) {
                elements.dataListContainer.innerHTML = '<p>No data available.</p>';
            } else {
                const tableHTML = `
                    <table class="data-table">
                        <thead><tr><th>Kode</th><th>Nama</th><th>Berat</th><th>Lokasi</th><th>Waktu</th></tr></thead>
                        <tbody>
                            ${result.data.map(item => `<tr>
                                <td>${item.itemCode}</td>
                                <td>${item.itemName}</td>
                                <td>${item.weight} Kg</td>
                                <td>${item.location}</td>
                                <td>${item.datetime}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                    <div class="pagination-controls">
                        <button onclick="previousPage()" ${!result.pagination.hasPreviousPage ? 'disabled' : ''}>←</button>
                        <span>${currentPage} / ${totalPages}</span>
                        <button onclick="nextPage()" ${!result.pagination.hasNextPage ? 'disabled' : ''}>→</button>
                    </div>
                `;
                elements.dataListContainer.innerHTML = tableHTML;
            }
        } catch (err) {
            elements.dataListContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
        }
    }

    // Pagination functions
    window.previousPage = () => {
        if (currentPage > 1) {
            loadData(currentPage - 1);
        }
    };

    window.nextPage = () => {
        if (currentPage < totalPages) {
            loadData(currentPage + 1);
        }
    };

    elements.viewDataButton.addEventListener('click', async () => {
        elements.viewDataModal.style.display = 'block';
        elements.dataListContainer.innerHTML = '<p>Loading...</p>';
        loadData(1);
    });

    elements.closeViewButton.addEventListener('click', () => {
        elements.viewDataModal.style.display = 'none';
    });

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === elements.modal) elements.modal.style.display = 'none';
        if (e.target === elements.viewDataModal) elements.viewDataModal.style.display = 'none';
    });
});