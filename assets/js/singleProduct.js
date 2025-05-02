function getProductIdFromUrl() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('id');
  console.log("Product ID from URL:", productId);  // Debugging
   return productId;
}

function fetchProductDetail() {
  const productId = getProductIdFromUrl();
  if (!productId) return;

  db.collection('products').doc(productId).get()
    .then(function(doc) {
      if (doc.exists) {
        const product = doc.data();
        document.getElementById('productImage').src = product.imageUrl;
        document.getElementById('productCategory').innerText = product.category;
        document.getElementById('productName').innerText = product.name;
        document.getElementById('productPrice').innerText = "Rp" + product.price;
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