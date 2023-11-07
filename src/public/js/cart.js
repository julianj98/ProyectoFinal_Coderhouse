function addToCart(productId, productTitle,) {
  const quantity = 1;
  // Realiza una solicitud POST al servidor para agregar el producto al carrito
  fetch(`/api/carts/${cartId}/product/${productId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        // Si la solicitud es exitosa, muestra un mensaje al usuario
        alert(`"${productTitle}" ha sido agregado al carrito.`);
        
      } else {
        // Si hay un error en la solicitud, muestra un mensaje de error
        alert('No se pudo agregar el producto al carrito.');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}
