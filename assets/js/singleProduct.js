function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
}

function fetchProductDetail() {
  const productId = getProductIdFromUrl();
  if (!productId) return;

  db.collection('products').doc(productId).get()
    .then(function(doc) {
      if (doc.exists) {
        const product = doc.data();
        document.getElementById('productImage').src = product.imageUrl;
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productPrice').innerText = "$" + product.price;
        document.getElementById('productDescription').innerText = product.description;
      } else {
        alert('Produk tidak ditemukan.');
      }
    })
    .catch(function(error) {
      console.error("Error getting product:", error);
    });
}

document.addEventListener('DOMContentLoaded', fetchProductDetail);