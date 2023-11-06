document.addEventListener("DOMContentLoaded", function() {
    // Obtén todos los botones "Eliminar del Carrito"
    const removeButtons = document.querySelectorAll(".btn-danger");
  
    // Agrega un controlador de eventos a cada botón
    removeButtons.forEach(button => {
      button.addEventListener("click", function() {
        // Obtén el ID del producto y el ID del carrito desde los atributos de datos
        const productId = button.getAttribute("data-product-id");
        const cartId = button.getAttribute("data-cart-id");
        const productTitle = button.getAttribute("data-product-title");

        // Realiza una solicitud DELETE al endpoint para eliminar el producto del carrito
        fetch(`/api/carts/${cartId}/products/${productId}`, {
          method: "DELETE",
        })
        .then(response => {
          if (response.ok) {
            // Producto eliminado con éxito, puedes recargar la página o realizar alguna otra acción
            alert(`"${productTitle}" ha sido eliminado del carrito.`);
            window.location.reload(); // Recarga la página
          } else {
            // Ocurrió un error, muestra un mensaje al usuario
            alert("Error al eliminar el producto del carrito");
          }
        })
        .catch(error => {
          console.error("Error:", error);
          alert("Error al eliminar el producto del carrito");
        });
      });
    });
  });
  