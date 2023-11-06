document.addEventListener("DOMContentLoaded", function() {
    const finalizeCompraButton = document.getElementById("finalizarCompraButton");
    finalizeCompraButton.addEventListener("click", function() {
      const cartId = finalizeCompraButton.getAttribute("data-cart-id"); // Obtén el ID del carrito desde el atributo de datos
      finalizeCompra(cartId);
    });
    console.log(cartId);
    function finalizeCompra(cartId) {
      // Realizar una solicitud POST al endpoint de finalización de compra
      fetch(`/api/carts/${cartId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => {
        if (response.ok) {
          // La compra se completó con éxito, puedes redirigir al usuario a una página de confirmación
          window.location.href = "/purchase-confirmation";
        } else {
          // Ocurrió un error, muestra un mensaje al usuario
          alert("Error al finalizar la compra");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        alert("Error al finalizar la compra");
      });
    }
  });
  