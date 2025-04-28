document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.admin__form');
  const productsContainer = document.querySelector('.admin__products');
  const searchInput = document.getElementById('search-input');
  const filterCategory = document.getElementById('filter-category');
  const spinner = document.querySelector('.admin__spinner');
  
	const auth = firebase.auth();

	// Cek apakah user sudah login
	auth.onAuthStateChanged(async (user) => {
	  if (!user) {
		window.location.href = '/loginAdmin'; // Belum login -> ke login
		return;
	  }

	  try {
		const userDoc = await db.collection('users').doc(user.uid).get();
		if (!userDoc.exists) {
		  window.location.href = '/403'; // User tidak terdaftar
		  return;
		}

		const userData = userDoc.data();
		if (userData.role !== 'admin') {
		  window.location.href = '/403'; // Bukan admin -> tendang
		  return;
		}

		console.log('Welcome Admin!'); // Kalau admin, lanjut akses
	  } catch (error) {
		console.error('Error fetching user data:', error);
		window.location.href = '/403'; // Error ambil data -> tendang
	  }
	});

	// Logout Button (optional)
	const logoutBtn = document.getElementById('logout-btn');
	if (logoutBtn) {
	  logoutBtn.addEventListener('click', () => {
		auth.signOut().then(() => {
		  window.location.href = '/loginAdmin';
		});
	  });
	}

  let productsData = []; // simpan semua data produk
  const pageSize = 6; // produk per halaman
  let currentPage = 1;

  // Form submit: tambah produk
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('product-name').value.trim();
    const price = parseFloat(document.getElementById('product-price').value);
    const category = document.getElementById('product-category').value;
    const description = document.getElementById('product-description').value.trim();
    const imageUrl = document.getElementById('product-image-url').value.trim();

    if (!name || !price || !category || !description || !imageUrl) {
      showAlert('Semua field wajib diisi!', 'warning');
      return;
    }

    try {
      await db.collection('products').add({
        name,
        price,
        category,
        description,
        imageUrl,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showAlert('Produk berhasil diupload!');
      form.reset();
    } catch (error) {
      console.error('Error uploading product:', error);
      showAlert('Terjadi kesalahan saat upload produk.', 'error');
    }
  });

  // Realtime load produk
  db.collection('products').orderBy('createdAt', 'desc').onSnapshot((snapshot) => {
    spinner.style.display = 'block';
    productsData = [];

    snapshot.forEach(doc => {
      productsData.push({ id: doc.id, ...doc.data() });
    });

    spinner.style.display = 'none';
    renderProducts();
  });

  // Render produk + search + filter + pagination
  function renderProducts() {
    const keyword = searchInput.value.toLowerCase();
    const categoryFilter = filterCategory.value;

    let filtered = productsData.filter(product => {
      const matchName = product.name.toLowerCase().includes(keyword);
      const matchCategory = categoryFilter ? product.category === categoryFilter : true;
      return matchName && matchCategory;
    });

    const totalPages = Math.ceil(filtered.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginated = filtered.slice(start, end);

    productsContainer.innerHTML = '';

    if (paginated.length === 0) {
      productsContainer.innerHTML = '<p>Tidak ada produk ditemukan.</p>';
      return;
    }

    paginated.forEach(product => {
      const productEl = document.createElement('div');
      productEl.className = 'admin__product';
      productEl.innerHTML = `
        <img src="${product.imageUrl}" alt="${product.name}">
        <div class="admin__product-info">
          <h3>${product.name}</h3>
          <p>Rp ${product.price.toLocaleString('id-ID')}</p>
          <p><small>${product.category}</small></p>
          <div class="admin__product-actions">
            <button class="edit-btn" data-id="${product.id}">Edit</button>
            <button class="delete-btn" data-id="${product.id}">Hapus</button>
          </div>
        </div>
      `;
      productsContainer.appendChild(productEl);
    });

    renderPagination(totalPages);
    attachProductEvents();
  }

  // Render pagination
 function renderPagination(totalPages) {
    let paginationHtml = '<div class="admin__pagination">';
    for (let i = 1; i <= totalPages; i++) {
      paginationHtml += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    paginationHtml += '</div>';
    productsContainer.insertAdjacentHTML('afterend', paginationHtml);

    document.querySelectorAll('.page-btn').forEach(button => {
      button.addEventListener('click', (e) => {
        currentPage = parseInt(e.target.dataset.page);
        renderProducts();
      });
    });
  }

  // Attach event untuk tombol edit/hapus
  function attachProductEvents() {
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        if (showConfirm('Yakin mau hapus produk ini?')) {
          await db.collection('products').doc(id).delete();
        }
      });
    });

    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
      button.addEventListener('click', async (e) => {
        const id = e.target.dataset.id;
        const doc = await db.collection('products').doc(id).get();
        const data = doc.data();

        document.getElementById('product-name').value = data.name;
        document.getElementById('product-price').value = data.price;
        document.getElementById('product-category').value = data.category;
        document.getElementById('product-description').value = data.description;
        document.getElementById('product-image-url').value = data.imageUrl;

        const submitButton = form.querySelector('.admin__btn');
        submitButton.textContent = 'Update Produk';

        form.onsubmit = async (ev) => {
          ev.preventDefault();

          try {
            await db.collection('products').doc(id).update({
              name: document.getElementById('product-name').value.trim(),
              price: parseFloat(document.getElementById('product-price').value),
              category: document.getElementById('product-category').value,
              description: document.getElementById('product-description').value.trim(),
              imageUrl: document.getElementById('product-image-url').value.trim()
            });

            showAlert('Produk berhasil diupdate!', 'success');
            form.reset();
            submitButton.textContent = 'Upload Produk';
            form.onsubmit = defaultSubmitHandler;
          } catch (error) {
            console.error('Error updating product:', error);
            showAlert('Gagal update produk.', 'error');
          }
        }
      });
    });
  }

  // Search and filter listener
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderProducts();
  });

  filterCategory.addEventListener('change', () => {
    currentPage = 1;
    renderProducts();
  });

  const defaultSubmitHandler = form.onsubmit;
});