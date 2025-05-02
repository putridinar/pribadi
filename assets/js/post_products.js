function fetchProducts() {
    var productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';

    db.collection('products').orderBy('createdAt', 'desc').get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          var product = doc.data();
			var productId = doc.id; // Ambil ID dokumen

          var productCard = document.createElement('div');
          productCard.classList.add('product-card');

          productCard.innerHTML = `
            <img src="${product.imageUrl}" alt="${product.name}" class="product-card__img">
            <div class="product-card__info">
              <h3 class="product-card__title">${product.name}</h3>
              <p class="product-card__price">Rp ${product.price}</p>
      <a href="/product?id=${productId}" class="product-card__btn">Lihat Detail</a>
            </div>
          `;

          productsContainer.appendChild(productCard);
        });
      })
      .catch(function(error) {
        console.error("Error getting products: ", error);
      });
  }

  document.addEventListener('DOMContentLoaded', fetchProducts);