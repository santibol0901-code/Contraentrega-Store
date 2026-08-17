const form = document.querySelector('#order-form');
const productSelect = document.querySelector('#product-select');
// La tienda ya no maneja ofertas; se conserva el catálogo anterior y se agregan suplementos.
[...productSelect.options].filter(option => option.text.includes('Set de 12 Recipientes')).forEach(option => option.remove());
[['Proteína Whey 2 lb — $149.900'], ['Creatina Monohidratada — $89.900']].forEach(([text]) => { const option = new Option(text, text); productSelect.add(option); });
if (![...productSelect.options].some(option => option.text.includes('Magnesium Complex Toplux'))) productSelect.add(new Option('Magnesium Complex Toplux — $80.000', 'Magnesium Complex Toplux'));
document.querySelector('footer a[href="#oferta"]')?.remove();
const footerDescription = document.querySelector('footer p');
if (footerDescription) footerDescription.textContent = 'Productos útiles, tecnología y suplementos hasta tu puerta.';
const menu = document.querySelector('.menu');
const nav = document.querySelector('nav');
menu.addEventListener('click', () => { nav.classList.toggle('open'); menu.textContent = nav.classList.contains('open') ? '×' : '☰'; });
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => { nav.classList.remove('open'); menu.textContent = '☰'; }));
nav.querySelector('a[href="#inicio"]')?.addEventListener('click', event => { if (document.body.classList.contains('catalog-page')) { event.preventDefault(); window.location.href = 'index.html'; } });
document.querySelectorAll('.want').forEach(link => link.addEventListener('click', () => {
  const product = link.dataset.product;
  if (product) [...productSelect.options].find(o => o.text.includes(product))?.setAttribute('selected', 'selected');
}));
if (form) {
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const message = `Hola, quiero confirmar mi pedido:%0A%0A*Producto:* ${data.get('producto')}%0A*Nombre:* ${data.get('nombre')}%0A*Teléfono:* ${data.get('telefono')}%0A*Departamento:* ${data.get('departamento')}%0A*Ciudad:* ${data.get('ciudad')}%0A*Dirección:* ${data.get('direccion')}`;
    // función de pedido deshabilitada: abrir WhatsApp ha sido removido
    showToast('La función de pedido fue deshabilitada', 4000);
  });
}
const modal = document.querySelector('#product-modal');
const modalTitle = document.querySelector('#modal-title');
const modalPrice = document.querySelector('#modal-price');
const modalDescription = document.querySelector('#modal-description');
const modalImage = document.querySelector('#modal-main-image');
const modalOrder = document.querySelector('#modal-order');
const reviewList = document.querySelector('#review-list');
const reviewForm = document.querySelector('#review-form');
let currentProduct = '';
let currentRating = 5;
const demoReviews = [{name:'María G.',rating:5,text:'Me gustó mucho. Llegó rápido y tal como se veía en la publicación.'},{name:'Carlos R.',rating:5,text:'Muy buena atención y el pago contraentrega me dio mucha confianza.'}];
const images = { 'img-clean':['https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=85'], 'img-massage':['https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=900&q=85'], 'img-earbuds':['https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&w=900&q=85'], 'img-lamp':['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=85'], 'img-whey':['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=85'], 'img-creatine':['https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85'], 'img-magnesium':['images/magnesium-complex-beneficios.png','images/magnesium-complex-toplux.png'] };
// Normaliza URLs de imagen para forzar recarga cuando sea necesario
function normalizeImageUrl(url){
  if (!url) return '';
  if (String(url).startsWith('data:')) return url;
  try {
    const base = new URL(url, location.href).toString();
    const version = localStorage.getItem('imagesVersion') || Date.now();
    const sep = base.includes('?') ? '&' : '?';
    return `${base}${sep}v=${version}`;
  } catch(e){
    return url;
  }
}
function renderReviews(){ const saved = JSON.parse(localStorage.getItem(`reviews-${currentProduct}`) || '[]'); const allReviews = [...demoReviews, ...saved].filter(r => !String(r.name || '').toLowerCase().includes('kevin')); reviewList.innerHTML = allReviews.map(r => `<article class="review"><b>${r.name}</b><span>${'★'.repeat(r.rating)}${'☆'.repeat(5-r.rating)}</span><p>${r.text}</p></article>`).join(''); }
function showImage(type, imageIndex = 0){
  modalImage.classList.remove('video');
  modalImage.classList.toggle('magnesium-gallery', type === 'img-magnesium');
  modalImage.innerHTML = '';
  const gallery = images[type] || [];
  const src = gallery[imageIndex] || gallery[0] || '';
  modalImage.style.backgroundImage = src ? `url('${normalizeImageUrl(src)}')` : '';
  modalImage.style.backgroundSize = 'cover';
  modalImage.style.backgroundPosition = 'center';
  modalImage.style.backgroundRepeat = 'no-repeat';
  modalImage.style.backgroundColor = '#fff';
}
function showVideo(){ modalImage.classList.add('video'); modalImage.style.backgroundImage = 'none'; modalImage.style.backgroundSize = 'cover'; modalImage.style.backgroundPosition = 'center'; modalImage.style.backgroundRepeat = 'no-repeat'; modalImage.innerHTML = '<video controls playsinline poster="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=900&q=85"><source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">Tu navegador no puede reproducir el video.</video>'; }
document.querySelectorAll('.product').forEach(card => card.addEventListener('click', event => { if (event.target.closest('.want')) return; currentProduct = card.querySelector('h3').textContent; modalTitle.textContent = currentProduct; modalPrice.textContent = card.querySelector('strong').textContent; modalDescription.textContent = card.dataset.description; modalOrder.dataset.product = currentProduct; showImage(card.dataset.class); modal.querySelectorAll('.modal-thumbs button').forEach((button,i) => { button.classList.toggle('active', i === 0); button.onclick = () => { modal.querySelectorAll('.modal-thumbs button').forEach(b => b.classList.remove('active')); button.classList.add('active'); button.textContent === 'Video' ? showVideo() : showImage(card.dataset.class, i); }; }); renderReviews(); modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden'; }));
function closeModal(){ modal.classList.remove('show'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow = ''; }
document.querySelector('.modal-close').addEventListener('click', closeModal); modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
modalOrder.textContent = '🛒 Pedir ahora';
if (modalOrder) modalOrder.setAttribute('href', '#pedido');
modalOrder.addEventListener('click', event => { event.preventDefault(); const option = [...productSelect.options].find(o => o.text.includes(currentProduct)); if(option) option.selected = true; addToCart(currentProduct, parsePrice(modalPrice.textContent)); closeModal(); });
document.querySelectorAll('.rating-input button').forEach(button => button.addEventListener('click', () => { currentRating = Number(button.dataset.score); document.querySelectorAll('.rating-input button').forEach(star => star.classList.toggle('selected', Number(star.dataset.score) <= currentRating)); }));
document.querySelectorAll('.rating-input button').forEach(star => star.classList.add('selected'));
reviewForm.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(reviewForm); const reviewerName = String(data.get('reviewer') || '').trim(); const text = String(data.get('comment') || '').trim(); const saved = JSON.parse(localStorage.getItem(`reviews-${currentProduct}`) || '[]'); if (!reviewerName.toLowerCase().includes('kevin')) { saved.push({name:reviewerName, text, rating:currentRating}); localStorage.setItem(`reviews-${currentProduct}`, JSON.stringify(saved)); } reviewForm.reset(); currentRating = 5; document.querySelectorAll('.rating-input button').forEach(star => star.classList.add('selected')); renderReviews(); });

// Los productos creados desde el panel privado se muestran aquí para los compradores.
function renderProducts(products, selectedCategory = 'todos'){
  const grid = document.querySelector('.product-grid');
  if (!grid) return;

  const visibleProducts = (products || []).filter(product => {
    if (!product || !product.name) return false;
    const productCategory = product.category || categoriesByProduct[product.name] || 'todos';
    return selectedCategory === 'todos' || productCategory === selectedCategory;
  });

  grid.innerHTML = '';
  visibleProducts.forEach(product => {
    const card = document.createElement('article');
    card.className = 'product admin-product';
    const firstImage = (product.imageUrls && product.imageUrls[0]) || (product.imageDataUrls && product.imageDataUrls[0]) || '';
    const bg = normalizeImageUrl(firstImage);
    card.innerHTML = `<div class="product-image" style="background-image:url('${bg}');background-size:cover;background-position:center;background-repeat:no-repeat;"><span class="discount">Nuevo</span></div><div class="product-info"><div class="stars">★★★★★</div><h3>${product.name}</h3><p class="ship">🚚 Envío nacional</p><div>${product.previousPrice ? `<del>$${Number(product.previousPrice).toLocaleString('es-CO')}</del>` : ''}<strong>$${Number(product.price).toLocaleString('es-CO')}</strong></div><a href="#" class="want">Lo quiero 🔥</a></div>`;
    card.dataset.product = JSON.stringify({ name: product.name, price: product.price, description: product.description || '', category: product.category || '', imageUrls: product.imageUrls || product.imageDataUrls || [], videoUrl: product.videoUrl || product.videoDataUrl || '' });
    if (product.category) card.dataset.category = product.category;
    card.addEventListener('click', (event) => {
      if (event.target.closest('.want')) return;
      const pdata = JSON.parse(card.dataset.product);
      currentProduct = pdata.name;
      modalTitle.textContent = pdata.name;
      modalPrice.textContent = `$${Number(pdata.price).toLocaleString('es-CO')}`;
      modalDescription.textContent = pdata.description;
      modalOrder.dataset.product = pdata.name;
      const thumbs = modal.querySelector('.modal-thumbs');
      thumbs.innerHTML = '';
      (pdata.imageUrls || []).forEach((url, i) => {
        const btn = document.createElement('button'); btn.textContent = `Imagen ${i+1}`; if (i===0) btn.classList.add('active'); btn.addEventListener('click', () => { thumbs.querySelectorAll('button').forEach(b => b.classList.remove('active')); btn.classList.add('active'); showImageUrl(url); }); thumbs.appendChild(btn);
      });
      if (pdata.videoUrl) {
        const vbtn = document.createElement('button'); vbtn.textContent = 'Video'; thumbs.appendChild(vbtn); vbtn.addEventListener('click', () => { thumbs.querySelectorAll('button').forEach(b => b.classList.remove('active')); vbtn.classList.add('active'); showVideoUrl(pdata.videoUrl); });
      }
      if (pdata.imageUrls && pdata.imageUrls.length) showImageUrl(pdata.imageUrls[0]); else showImage(card.dataset.class || 'img-clean');
      renderReviews(); modal.classList.add('show'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow = 'hidden';
    });
    const wantBtn = card.querySelector('.want');
    if (wantBtn) {
      wantBtn.setAttribute('href', '#pedido');
      wantBtn.addEventListener('click', event => { event.preventDefault(); const option = new Option(`${product.name} — $${Number(product.price).toLocaleString('es-CO')}`, product.name); productSelect.add(option); option.selected = true; addToCart(product.name, Number(product.price)); });
    }
    grid.append(card);
  });
}

async function loadAndRenderProducts(selectedCategory = 'todos'){
  let products = [];
  try {
    if (!window.catalogStore) throw new Error('Firebase no está disponible');
    products = await window.catalogStore.getProducts();
  } catch(e) {
    // Solo sirve como respaldo si se abre el sitio sin conexión. El catálogo
    // oficial siempre es el que entrega el servidor, no el de este dispositivo.
    try { products = JSON.parse(localStorage.getItem('localProducts') || '[]'); } catch (_) { products = []; }
  }
  categoriesByProduct = {};
  products.forEach(p => { if (p && p.name && p.category) categoriesByProduct[p.name] = p.category; });
  renderProducts(products, selectedCategory);
  // Actualizar el select de productos del formulario de pedido con los productos creados desde el admin
  try {
    const existing = [...productSelect.options].map(o => o.text);
    products.forEach(p => {
      const label = `${p.name} — $${Number(p.price).toLocaleString('es-CO')}`;
      if (!existing.some(t => t.includes(p.name))) {
        const option = new Option(label, p.name);
        productSelect.add(option);
      }
    });
  } catch(e) { /* si no existe el select, ignorar */ }
}


// inicializar y escuchar cambios en localStorage para sincronizar admin → clientes
// inicializar y escuchar cambios en localStorage para sincronizar admin → clientes
loadAndRenderProducts();
// Consulta periódica para que un catálogo abierto en otro dispositivo se
// actualice sin tener que recargar la página.
setInterval(() => loadAndRenderProducts(), 30000);
try { window.catalogStore?.watchProducts(() => loadAndRenderProducts()); } catch (_) {}
window.addEventListener('storage', (e) => { if (e.key === 'localProducts') { showToast('Catálogo actualizado'); loadAndRenderProducts(); } });

// BroadcastChannel para sincronización en la misma página/ventana
const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('contraentrega-products') : null;
bc?.addEventListener('message', (e) => { if (e.data && e.data.type === 'update') { showToast('Catálogo actualizado'); loadAndRenderProducts(); } });

// Mostrar un toast de actualización (crea el elemento si no existe)
function showToast(text, ms = 3000){
  let el = document.getElementById('update-toast');
  if (!el){ el = document.createElement('div'); el.id = 'update-toast'; el.className = 'update-toast'; document.body.appendChild(el); }
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
}

// Helpers para mostrar imágenes y videos por URL en el modal
function showImageUrl(url){
  modalImage.classList.remove('video');
  modalImage.style.backgroundImage = url ? `url('${normalizeImageUrl(url)}')` : '';
  modalImage.style.backgroundSize = 'cover';
  modalImage.style.backgroundPosition = 'center';
  modalImage.style.backgroundRepeat = 'no-repeat';
  modalImage.style.backgroundColor = '#fff';
  modalImage.innerHTML = '';
}
function showVideoUrl(url){ modalImage.classList.add('video'); modalImage.style.backgroundImage = 'none'; modalImage.style.backgroundSize = 'cover'; modalImage.style.backgroundPosition = 'center'; modalImage.style.backgroundRepeat = 'no-repeat'; modalImage.innerHTML = '';
  // YouTube embed
  if (/youtu\.be|youtube/.test(url)){
    let id = url.includes('youtu.be') ? url.split('/').pop() : (new URL(url).searchParams.get('v') || '');
    const embed = `https://www.youtube.com/embed/${id}`;
    modalImage.innerHTML = `<iframe src="${embed}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
  } else {
    // video file
    modalImage.innerHTML = `<video controls playsinline src="${url}">Tu navegador no puede reproducir el video.</video>`;
  }
}

// Filtro de categorías para el catálogo.
// Inicialmente vacío: solo se completará con productos agregados por el administrador.
let categoriesByProduct = {};
const categoryLabels = { hogar:'Hogar', salud:'Salud & bienestar', tecnologia:'Tecnología', suplementos:'Suplementos', todos:'Catálogo' };
function filterCatalog(category) {
  document.body.classList.add('catalog-visible');
  const selectedCategory = category || 'todos';
  loadAndRenderProducts(selectedCategory);
  document.querySelector('#catalog-title').textContent = categoryLabels[selectedCategory] || 'Catálogo';
}
document.querySelectorAll('[data-filter]').forEach(link => link.addEventListener('click', event => {
  const category = link.dataset.filter;
  if (!document.body.classList.contains('catalog-page')) { event.preventDefault(); window.location.href = `catalogo.html?categoria=${encodeURIComponent(category)}`; return; }
  filterCatalog(category);
}));
document.querySelectorAll('a[href="#productos"]:not([data-filter])').forEach(link => link.addEventListener('click', event => { if (!document.body.classList.contains('catalog-page')) { event.preventDefault(); window.location.href = 'catalogo.html?categoria=todos'; return; } filterCatalog('todos'); }));
if (document.body.classList.contains('catalog-page')) filterCatalog(new URLSearchParams(window.location.search).get('categoria') || 'todos');

// Carrito de compras persistente en este dispositivo.
const cartButton = document.querySelector('#cart-button');
const cartPanel = document.querySelector('#cart-panel');
const cartOverlay = document.querySelector('#cart-overlay');
const cartCount = document.querySelector('#cart-count');
const cartItems = document.querySelector('#cart-items');
const cartTotal = document.querySelector('#cart-total');
let cart = JSON.parse(localStorage.getItem('contraentrega-cart') || '[]');
const parsePrice = value => Number((value || '').replace(/[^0-9]/g, '')) || 0;
const money = value => `$${value.toLocaleString('es-CO')}`;
function renderCart() {
  const quantity = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = quantity; cartCount.classList.toggle('has-items', quantity > 0);
  cartItems.innerHTML = cart.length ? cart.map((item, index) => `<article class="cart-item"><div><b>${item.name}</b><small>${money(item.price)} c/u</small></div><div><button data-cart-change="${index}" data-delta="-1">−</button><span>${item.quantity}</span><button data-cart-change="${index}" data-delta="1">+</button><button class="cart-remove" data-cart-remove="${index}">×</button></div></article>`).join('') : '<p class="cart-empty">Tu carrito está vacío.</p>';
  cartTotal.textContent = money(cart.reduce((sum, item) => sum + item.price * item.quantity, 0));
  localStorage.setItem('contraentrega-cart', JSON.stringify(cart));
}
function addToCart(name, price) { const item = cart.find(product => product.name === name); if (item) item.quantity += 1; else cart.push({name, price, quantity:1}); renderCart(); cartPanel.classList.add('show'); cartOverlay.classList.add('show'); }
function closeCart(){ cartPanel.classList.remove('show'); cartOverlay.classList.remove('show'); }
document.querySelectorAll('.product .want').forEach(button => button.addEventListener('click', event => { event.preventDefault(); const card = button.closest('.product'); addToCart(card.querySelector('h3').textContent, parsePrice(card.querySelector('strong')?.textContent)); }));
cartButton.addEventListener('click', event => { event.preventDefault(); cartPanel.classList.add('show'); cartOverlay.classList.add('show'); });
document.querySelector('#cart-close').addEventListener('click', closeCart); cartOverlay.addEventListener('click', closeCart);
cartItems.addEventListener('click', event => { const index = Number(event.target.dataset.cartChange ?? event.target.dataset.cartRemove); if (Number.isNaN(index)) return; if (event.target.dataset.cartRemove !== undefined) cart.splice(index, 1); else { cart[index].quantity += Number(event.target.dataset.delta); if (cart[index].quantity <= 0) cart.splice(index, 1); } renderCart(); });
const cartCheckout = document.querySelector('#cart-checkout');
if (cartCheckout) {
  cartCheckout.textContent = 'Continuar pedido';
  cartCheckout.addEventListener('click', event => {
    event.preventDefault();
    showToast('La función de pedido fue deshabilitada', 3000);
    closeCart();
  });
}
renderCart();
