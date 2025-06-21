const products = [
  { id: 1, name: 'Arroz 1kg', price: 6.90, img: 'https://m.media-amazon.com/images/I/81-Yw7YyRBL.jpg' },
  { id: 2, name: 'Feijão 1kg', price: 7.50, img: 'https://ibassets.com.br/ib.item.image.large/l-b15349c79e694c919b8d0e86514a5c24.jpeg' },
  { id: 3, name: 'Açúcar 1kg', price: 4.20, img: 'https://protelimp.com.br/wp-content/uploads/a%C3%A7ucar-uni%C3%A3o.png' },
  { id: 4, name: 'Óleo 900ml', price: 8.80, img: 'https://d3gdr9n5lqb5z7.cloudfront.net/fotos/904120.webp' },
  { id: 5, name: 'Macarrão 500g', price: 3.70, img: 'https://davo.com.br/ccstore/v1/images/?source=/file/v7173402153024082117/products/prod_7896022200213.imagem1.jpg&height=940&width=940' }
];

const cart = [];
const debounceMap = new Map();

function debounceProduct(productId, callback) {
  if (debounceMap.has(productId)) return;

  debounceMap.set(productId, true);
  callback();

  setTimeout(() => {
    debounceMap.delete(productId);
  }, 170);
}

function renderProducts() {
  const productList = document.getElementById('products');
  productList.innerHTML = '';

  products.forEach(product => {
    const li = document.createElement('li');

    const img = document.createElement('img');
    img.src = product.img;
    img.alt = product.name;
    img.classList.add('product-img');

    const name = document.createElement('div');
    name.classList.add('cart-item-name');
    name.textContent = `${product.name}\nR$ ${product.price.toFixed(2)}`;

    const existing = cart.find(item => item.id === product.id);
    const controls = document.createElement('div');

    if (existing) {
      const minusBtn = document.createElement('button');
      minusBtn.textContent = '-';
      minusBtn.onclick = () => {
        debounceProduct(product.id, () => updateQuantity(product.id, -1));
      };

      const qty = document.createElement('span');
      qty.textContent = ` ${existing.quantity} `;

      const plusBtn = document.createElement('button');
      plusBtn.textContent = '+';
      plusBtn.onclick = () => {
        debounceProduct(product.id, () => updateQuantity(product.id, 1));
      };

      controls.appendChild(minusBtn);
      controls.appendChild(qty);
      controls.appendChild(plusBtn);
    } else {
      const addBtn = document.createElement('button');
      addBtn.textContent = 'Adicionar ao Carrinho';
      addBtn.onclick = () => {
        debounceProduct(product.id, () => updateQuantity(product.id, 1));
      };
      controls.appendChild(addBtn);
    }

    li.appendChild(img);
    li.appendChild(name);
    li.appendChild(controls);
    productList.appendChild(li);
  });
}

function renderCart() {
  const cartList = document.getElementById('cart-items');
  cartList.innerHTML = '';

  let totalGeral = 0;

  cart.forEach(item => {
    const li = document.createElement('li');

    const info = document.createElement('span');
    info.textContent = `${item.name} - Qtd: ${item.quantity} - R$ ${(item.price * item.quantity).toFixed(2)}`;

    totalGeral += item.price * item.quantity;

    const controls = document.createElement('span');

    const minusBtn = document.createElement('button');
    minusBtn.textContent = '-';
    minusBtn.onclick = () => {
      debounceProduct(item.id, () => updateQuantity(item.id, -1));
    };

    const plusBtn = document.createElement('button');
    plusBtn.textContent = '+';
    plusBtn.onclick = () => {
      debounceProduct(item.id, () => updateQuantity(item.id, 1));
    };

    const removeBtn = document.createElement('button');
    removeBtn.textContent = 'X';
    removeBtn.classList.add('remove-btn');
    removeBtn.onclick = () => removeFromCart(item.id);

    controls.appendChild(minusBtn);
    controls.appendChild(plusBtn);
    controls.appendChild(removeBtn);

    li.appendChild(info);
    li.appendChild(controls);
    cartList.appendChild(li);
  });

  const totalElement = document.createElement('div');
  totalElement.classList.add('cart-total');
  totalElement.textContent = `Total: R$ ${totalGeral.toFixed(2)}`;

  cartList.appendChild(totalElement);
  updateCartCount();
}

function updateQuantity(productId, change) {
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId);
      return;
    }
  } else if (change > 0) {
    const product = products.find(p => p.id === productId);
    if (product) cart.push({ ...product, quantity: 1 });
  }
  renderCart();
  renderProducts();
}

function removeFromCart(productId) {
  const index = cart.findIndex(p => p.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
    renderCart();
    renderProducts();
  }
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  document.getElementById('cart-count').textContent = count;
}

function toggleCart() {
  const modal = document.getElementById('cart-modal');
  const overlay = document.getElementById('cart-overlay');

  if (modal.classList.contains('hidden')) {
    modal.classList.remove('hidden');
    overlay.style.display = 'block';
  } else {
    modal.classList.add('hidden');
    overlay.style.display = 'none';
  }
}

function generateWhatsAppMessage() {
  if (cart.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  const confirmation = confirm("Para finalizar o pedido, você será redirecionado ao WhatsApp. Por favor, revise a mensagem gerada e clique em ENVIAR para que o mercadinho receba o seu pedido. Deseja continuar?");
  if (!confirmation) return;

  let message = 'Novo pedido:%0A%0A';
  cart.forEach(item => {
    message += `${item.name} x ${item.quantity}%0A`;
  });

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  message += `%0ATotal: R$ ${total.toFixed(2)}%0A%0A`;

  const rua = document.getElementById('address-street').value.trim();
  const numero = document.getElementById('address-number').value.trim();
  const complemento = document.getElementById('address-complement').value.trim();
  const bairro = document.getElementById('address-neighborhood').value.trim();
  const cidade = document.getElementById('address-city').value.trim();
  const telefone = document.getElementById('address-phone').value.trim();
  const payment = document.getElementById('payment-method').value;

  message += `Endereço:%0A${rua}, ${numero} - ${bairro}, ${cidade}%0A`;
  if (complemento) message += `Complemento: ${complemento}%0A`;
  if (telefone) message += `Telefone: ${telefone}%0A`;
  message += `Forma de Pagamento: ${payment}%0A`;

  const phone = '5513997430587';
  const url = `https://wa.me/${phone}?text=${message}`;

  window.open(url, '_blank');
}

renderProducts();
