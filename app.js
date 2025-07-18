document.addEventListener('DOMContentLoaded', () => {
    const fetchButton = document.getElementById('fetchButton');
    const saveButton = document.getElementById('saveButton');
    const dataContainer = document.getElementById('dataContainer');
    const modal = document.getElementById('saveModal');
    const closeButton = document.querySelector('.close-button');
    const saveForm = document.getElementById('saveForm');
    const itemCodeInput = document.getElementById('itemCode');
    const itemNameInput = document.getElementById('itemName');
    const viewDataButton = document.getElementById('viewDataButton');
    const viewDataModal = document.getElementById('viewDataModal');
    const closeViewButton = document.querySelector('.close-view-button');
    const dataListContainer = document.getElementById('dataListContainer');

    let scaleData = null;
    
    fetchButton.addEventListener('click', () => {
        dataContainer.classList.add('fade-out');
        setTimeout(() => {
            const weight = (Math.random() * 50 + 50).toFixed(1);
            const scaleId = `ID-${Math.floor(Math.random() * 1000)}`;
            const location = "Gudang Pusat";
            const now = new Date();
            const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
            const datetime = `${date} ${time}`;

            scaleData = {
                weight: weight,
                scaleId: scaleId,
                location: location,
                datetime: datetime
            };

            const newDataHTML = `
                <div class="details-container">
                    <div class="detail-item"><strong>ID :</strong> ${scaleData.scaleId}</div>
                    <div class="detail-item"><strong>Lokasi :</strong> ${scaleData.location}</div>
                    <div class="detail-item"><strong>Waktu :</strong> ${scaleData.datetime}</div>
                </div>
                <div class="weight-display">${scaleData.weight} kg</div>
            `;

            dataContainer.innerHTML = newDataHTML;
            dataContainer.classList.remove('fade-out');
            
            // Aktifkan tombol simpan
            saveButton.disabled = false;
        }, 300);
    });

    // Event listener untuk tombol simpan
    saveButton.addEventListener('click', () => {
        if (!saveButton.disabled) {
            modal.style.display = 'block';
        }
    });

    // Event listener untuk tombol close modal
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Close modal jika klik di luar area modal
    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
        if (event.target == viewDataModal) {
            viewDataModal.style.display = 'none';
        }
    });

    // Event listener untuk form submission
    saveForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const savedData = {
            scaleId: scaleData.scaleId,
            itemCode: itemCodeInput.value.trim(),
            itemName: itemNameInput.value.trim(),
            weight: scaleData.weight,
            location: scaleData.location,
            datetime: scaleData.datetime
        };

        try {
            const response = await fetch('http://localhost:5050/api/weights', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(savedData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const result = await response.json();
            alert('Data berhasil disimpan!');

            // Reset dan tutup modal
            modal.style.display = 'none';
            saveForm.reset();
            saveButton.disabled = true;
            dataContainer.innerHTML = '<p>Klik tombol untuk menampilkan data</p>';
        } catch (error) {
            console.error('Error:', error);
            alert('Gagal menyimpan data: ' + error.message);
        }
    });

    // Event listener untuk tombol Lihat Data
    viewDataButton.addEventListener('click', async () => {
        viewDataModal.style.display = 'block';
        dataListContainer.innerHTML = '<p>Memuat data...</p>';
        try {
            const response = await fetch('http://localhost:5050/api/weights');
            if (!response.ok) throw new Error('Gagal mengambil data');
            const data = await response.json();
            if (data.length === 0) {
                dataListContainer.innerHTML = '<p>Belum ada data tersimpan.</p>';
            } else {
                let tableHTML = `<table class="data-table">
                    <thead>
                        <tr>
                            <th>Kode</th>
                            <th>Nama</th>
                            <th>Berat (kg)</th>
                            <th>Lokasi</th>
                            <th>Waktu</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr data-scale-id="${item.scaleId}">
                                <td>${item.itemCode}</td>
                                <td class="item-name">${item.itemName}</td>
                                <td>${item.weight}</td>
                                <td>${item.location}</td>
                                <td>${item.datetime}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
                dataListContainer.innerHTML = tableHTML;
            }
        } catch (err) {
            dataListContainer.innerHTML = `<p style="color:red;">${err.message}</p>`;
        }
    });

    // Event listener untuk tombol close modal data
    closeViewButton.addEventListener('click', () => {
        viewDataModal.style.display = 'none';
    });
});