document.addEventListener("DOMContentLoaded", function () {
    const createCartForm = document.getElementById('createCartForm');
    createCartForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      // Realiza la solicitud POST al servidor para crear el carrito
      fetch('/api/carts/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'success') {
            // Si el carrito se creó con éxito, muestra una alerta
            alert(data.message);
            window.location.replace('/products');

          } else {
            // Si hay un error, muestra una alerta de error
            alert('No se pudo crear el carrito.');
          }
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Error al crear el carrito.');
        });
    });
  });
  