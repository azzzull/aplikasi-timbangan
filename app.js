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

            alert('Data tersimpan!');
            elements.modal.style.display = 'none';
            elements.saveForm.reset();
            elements.saveButton.disabled = true;
            elements.dataContainer.innerHTML = '<p>Klik tombol untuk menampilkan data</p>';
        } catch (error) {
            alert('Gagal menyimpan: ' + error.message);
        }
    });

    // View data - simplified
    elements.viewDataButton.addEventListener('click', async () => {
        elements.viewDataModal.style.display = 'block';
        elements.dataListContainer.innerHTML = '<p>Loading...</p>';
        
        try {
            const response = await fetch('/api/weights');
            if (!response.ok) throw new Error('Failed to fetch');
            
            const data = await response.json();
            if (data.length === 0) {
                elements.dataListContainer.innerHTML = '<p>No data.</p>';
            } else {
                const tableHTML = `<table class="data-table">
                    <thead><tr><th>Kode</th><th>Nama</th><th>Berat</th><th>Lokasi</th><th>Waktu</th></tr></thead>
                    <tbody>
                        ${data.map(item => `<tr>
                            <td>${item.itemCode}</td>
                            <td>${item.itemName}</td>
                            <td>${item.weight}</td>
                            <td>${item.location}</td>
                            <td>${item.datetime}</td>
                        </tr>`).join('')}
                    </tbody>
                </table>`;
                elements.dataListContainer.innerHTML = tableHTML;
            }
        } catch (err) {
            elements.dataListContainer.innerHTML = `<p style="color:red;">Error: ${err.message}</p>`;
        }
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