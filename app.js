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
    
    // Fungsi untuk mengatur event listener tombol edit dan hapus
    function setupTableButtons() {
        // Tambahkan listener pada semua tombol edit dan hapus
        attachEditButtons();
        attachDeleteButtons();
    }
    
    // Fungsi untuk menambahkan event listener ke semua tombol edit
    function attachEditButtons() {
        document.querySelectorAll('.edit-btn').forEach(button => {
            // Hapus event listener lama untuk mencegah duplikasi
            button.replaceWith(button.cloneNode(true));
            // Ambil ulang button setelah clone
            const newButton = document.querySelector(`.edit-btn[data-scale-id="${button.getAttribute('data-scale-id')}"]`);
            
            newButton.addEventListener('click', handleEditClick);
        });
    }
    
    // Fungsi untuk menambahkan event listener ke semua tombol hapus
    function attachDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(button => {
            // Hapus event listener lama untuk mencegah duplikasi
            button.replaceWith(button.cloneNode(true));
            // Ambil ulang button setelah clone
            const newButton = document.querySelector(`.delete-btn[data-scale-id="${button.getAttribute('data-scale-id')}"]`);
            
            newButton.addEventListener('click', handleDeleteClick);
        });
    }
    
    // Handler untuk klik tombol edit
    function handleEditClick(e) {
        e.preventDefault();
        const scaleId = e.target.getAttribute('data-scale-id');
        const row = document.querySelector(`tr[data-scale-id="${scaleId}"]`);
        const nameCell = row.querySelector('.item-name');
        const currentName = nameCell.textContent;
        const actionsCell = row.querySelector('.action-buttons');
        const originalActions = actionsCell.innerHTML;
        
        // Ganti nama dengan input text
        nameCell.innerHTML = `<input type="text" class="edit-name" value="${currentName}">`;
        
        // Ganti tombol di kolom aksi dengan Simpan dan Batal
        actionsCell.innerHTML = `
            <button class="save-name-btn">Simpan</button>
            <button class="cancel-edit-btn">Batal</button>
        `;
        
        // Event listener untuk tombol simpan nama baru
        actionsCell.querySelector('.save-name-btn').addEventListener('click', async () => {
            const newName = nameCell.querySelector('.edit-name').value.trim();
            if (!newName) {
                alert('Nama barang tidak boleh kosong!');
                return;
            }
            
            try {
                const response = await fetch(`http://localhost:5050/api/weights/${scaleId}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ itemName: newName })
                });
                
                if (!response.ok) throw new Error('Gagal memperbarui data');
                
                const result = await response.json();
                nameCell.textContent = result.itemName;
                actionsCell.innerHTML = originalActions;
                
                // Register ulang event listener untuk tombol edit dan hapus
                setupTableButtons();
                alert('Data berhasil diperbarui!');
            } catch (error) {
                console.error('Error:', error);
                nameCell.textContent = currentName;
                actionsCell.innerHTML = originalActions;
                
                // Register ulang event listener untuk tombol edit dan hapus
                setupTableButtons();
                alert('Gagal memperbarui data: ' + error.message);
            }
        });
        
        // Event listener untuk tombol batal edit
        actionsCell.querySelector('.cancel-edit-btn').addEventListener('click', () => {
            nameCell.textContent = currentName;
            actionsCell.innerHTML = originalActions;
            
            // Register ulang event listener untuk tombol edit dan hapus
            setupTableButtons();
        });
    }
    
    // Handler untuk klik tombol hapus
    async function handleDeleteClick(e) {
        e.preventDefault();
        if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            const scaleId = e.target.getAttribute('data-scale-id');
            try {
                const response = await fetch(`http://localhost:5050/api/weights/${scaleId}`, {
                    method: 'DELETE'
                });
                
                if (!response.ok) throw new Error('Gagal menghapus data');
                
                e.target.closest('tr').remove();
                alert('Data berhasil dihapus!');
                
                // Jika semua data sudah dihapus
                if (document.querySelectorAll('.data-table tbody tr').length === 0) {
                    dataListContainer.innerHTML = '<p>Belum ada data tersimpan.</p>';
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Gagal menghapus data: ' + error.message);
            }
        }
    }
    
    fetchButton.addEventListener('click', () => {
        dataContainer.classList.add('fade-out');
        setTimeout(() => {
            const weight = (Math.random() * 50 + 50).toFixed(1);
            const scaleId = `ID-${Math.floor(Math.random() * 1000)}`;
            const location = "Gudang Pusat";
            const now = new Date();
            const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
            const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

            scaleData = {
                weight: weight,
                scaleId: scaleId,
                location: location,
                date: date,
                time: time
            };

            const newDataHTML = `
                <div class="details-container">
                    <div class="detail-item"><strong>ID :</strong> ${scaleData.scaleId}</div>
                    <div class="detail-item"><strong>Lokasi :</strong> ${scaleData.location}</div>
                    <div class="detail-item"><strong>Tanggal :</strong> ${scaleData.date}</div>
                    <div class="detail-item"><strong>Jam :</strong> ${scaleData.time}</div>
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
            date: scaleData.date,
            time: scaleData.time
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
                            <th>Tanggal</th>
                            <th>Jam</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(item => `
                            <tr data-scale-id="${item.scaleId}">
                                <td>${item.itemCode}</td>
                                <td class="item-name">${item.itemName}</td>
                                <td>${item.weight}</td>
                                <td>${item.location}</td>
                                <td>${item.date}</td>
                                <td>${item.time}</td>
                                <td class="action-buttons">
                                    <button class="edit-btn" data-scale-id="${item.scaleId}">Edit</button>
                                    <button class="delete-btn" data-scale-id="${item.scaleId}">Hapus</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
                dataListContainer.innerHTML = tableHTML;
                
                // Setup event listeners untuk semua tombol
                setupTableButtons();
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