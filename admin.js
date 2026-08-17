const form = document.querySelector('#admin-form');
const statusText = document.querySelector('#admin-status');
const list = document.querySelector('#admin-list');
const money = value => `$${Number(value).toLocaleString('es-CO')}`;
const ADMIN_PRODUCTS_KEY = 'localProducts';
const ADMIN_PRODUCTS_BACKUP_KEY = 'localProductsBackup';
const bc = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('contraentrega-products') : null;

function getLocalProducts(){
  try {
    const saved = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_KEY) || '[]');
    if (Array.isArray(saved) && saved.length) return saved;
    const backup = JSON.parse(localStorage.getItem(ADMIN_PRODUCTS_BACKUP_KEY) || '[]');
    if (Array.isArray(backup) && backup.length) {
      localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(backup));
      return backup;
    }
    return [];
  } catch (error) {
    return [];
  }
}
function saveLocalProducts(products){
  const safeProducts = Array.isArray(products) ? products : [];
  localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(safeProducts));
  localStorage.setItem(ADMIN_PRODUCTS_BACKUP_KEY, JSON.stringify(safeProducts));
  // bump images version so clients know to refresh remote images
  try { localStorage.setItem('imagesVersion', String(Date.now())); } catch(e) {}
  try { bc?.postMessage({ type: 'update' }); } catch(e) {}
}

async function getProducts(){
  if (!window.catalogStore) throw new Error('No se pudo conectar con Firebase');
  const products = await window.catalogStore.getProducts();
  saveLocalProducts(products);
  return products;
}

async function createProduct(product){
  return window.catalogStore.createProduct(product);
}

async function replaceProduct(id, product){
  return window.catalogStore.updateProduct(id, product);
}

async function removeProduct(id){
  return window.catalogStore.removeProduct(id);
}

function renderAdminList(){
  const products = getLocalProducts();
  if (!products.length) {
    list.innerHTML = '<p>No hay productos todavía.</p>';
    return;
  }

  list.innerHTML = products.map(p => `
    <div class="row-product" data-id="${p.id}">
      <div style="display:flex; flex-direction:column; gap:4px;">
        <b>${p.name}</b>
        <input type="number" min="1" value="${Number(p.price) || 0}" data-price-input="${p.id}" aria-label="Editar precio de ${p.name}">
      </div>
      <div class="row-actions">
        <button type="button" data-save="${p.id}">Guardar</button>
        <button type="button" data-delete="${p.id}">Eliminar</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-save]').forEach(button => {
    button.addEventListener('click', () => {
      const id = button.getAttribute('data-save');
      const input = list.querySelector(`[data-price-input="${id}"]`);
      if (!input) return;
      const newPrice = Number(input.value) || 0;
      updateProductPrice(id, newPrice).catch(error => { statusText.textContent = error.message; });
    });
  });

  list.querySelectorAll('[data-delete]').forEach(button => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const id = button.getAttribute('data-delete');
      deleteLocalProduct(id).catch(error => { statusText.textContent = error.message; });
    });
  });
}

async function updateProductPrice(id, newPrice) {
  const products = await getProducts();
  const updated = products.map(product => {
    if (String(product.id) === String(id)) {
      return { ...product, price: Number(newPrice) || 0 };
    }
    return product;
  });
  const product = updated.find(item => String(item.id) === String(id));
  await replaceProduct(id, product);
  saveLocalProducts(updated);
  renderAdminList();
  statusText.textContent = 'Precio actualizado.';
}


async function deleteLocalProduct(id){
  let products = await getProducts();
  products = products.filter(p => String(p.id) !== String(id));
  await removeProduct(id);
  saveLocalProducts(products);
  renderAdminList();
  statusText.textContent = 'Producto eliminado.';
}

function fileToDataUrl(file){
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function imageToCompactDataUrl(file){
  const source = await createImageBitmap(file);
  const scale = Math.min(1, 1000 / Math.max(source.width, source.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(source.width * scale));
  canvas.height = Math.max(1, Math.round(source.height * scale));
  canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
  let quality = 0.78;
  let dataUrl = canvas.toDataURL('image/jpeg', quality);
  while (dataUrl.length > 300000 && quality > 0.35) { quality -= 0.1; dataUrl = canvas.toDataURL('image/jpeg', quality); }
  source.close?.();
  return dataUrl;
}

// Mostrar un toast pequeño en el admin
function showAdminToast(text, ms = 2200){
  let el = document.getElementById('admin-toast');
  if (!el){ el = document.createElement('div'); el.id = 'admin-toast'; el.className = 'admin-toast'; document.body.appendChild(el); }
  el.textContent = text;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), ms);
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  statusText.textContent = 'Guardando…';
  const formData = new FormData(form);
  const name = formData.get('name');
  const price = Number(formData.get('price')) || 0;
  const description = formData.get('description') || '';
  const category = formData.get('category') || 'suplementos';
  // images files
  const imagesInput = form.querySelector('input[name="images"]');
  const imageFiles = imagesInput ? [...imagesInput.files] : [];
  // Use allSettled so a single bad file doesn't block saving
  let imageDataUrls = [];
  if (imageFiles.length){
    try {
      const settled = await Promise.allSettled(imageFiles.slice(0, 2).map(f => imageToCompactDataUrl(f)));
      imageDataUrls = settled.filter(s => s.status === 'fulfilled').map(s => s.value);
    } catch(e){ imageDataUrls = []; }
  }
  // Los videos no se guardan en Firestore porque exceden el límite del catálogo.
  const videoDataUrl = null;
  const product = { id: Date.now().toString(), name, price, description, category, imageDataUrls, videoDataUrl };
  try {
    await createProduct(product);
    const products = await getProducts();
    saveLocalProducts(products);
  } catch (error) {
    statusText.textContent = error.message || 'No se pudo guardar. Verifica la conexión.';
    return;
  }
  form.reset(); statusText.textContent = 'Producto guardado correctamente.';
  // re-render list and highlight new item
  renderAdminList();
  // Asegurar que la sección de productos esté visible cuando guardamos
  const section = document.querySelector('#admin-list-box');
  if (section) section.style.display = 'block';
  // mostrar toast de confirmación
  try { showAdminToast('Producto guardado correctamente.'); } catch(e){}
  // highlight the new product and scroll into view
  const el = list.querySelector(`.row-product[data-id="${product.id}"]`);
  if (el){
    el.classList.add('new');
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setTimeout(() => el.classList.remove('new'), 2200);
  }
});

// Export / Import catálogo (permite mover cambios entre dispositivos)
const exportBtn = document.getElementById('export-catalog');
const importInput = document.getElementById('import-catalog');
if (exportBtn){
  exportBtn.addEventListener('click', () => {
    const products = getLocalProducts();
    const blob = new Blob([JSON.stringify(products, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `catalogo-contraentrega-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });
}
if (importInput){
  importInput.addEventListener('change', async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)){
        await Promise.all(parsed.map(product => createProduct({ ...product, id: product.id || Date.now().toString() })));
        saveLocalProducts(await getProducts());
        renderAdminList();
        showAdminToast('Catálogo importado correctamente');
      } else {
        showAdminToast('Archivo inválido');
      }
    } catch(err){
      showAdminToast('Error al importar el archivo');
    }
    importInput.value = '';
  });
}

// Inicializar desde la fuente compartida. Si hay productos antiguos solo en
// este navegador, se suben una vez para no perder el catálogo existente.
(async () => {
  const localBeforeConnection = getLocalProducts();
  try {
    const remote = await getProducts();
    if (!remote.length && localBeforeConnection.length) {
      await Promise.all(localBeforeConnection.map(product => createProduct({ ...product, id: product.id || Date.now().toString() })));
        await getProducts();
    }
  } catch (error) {
    statusText.textContent = 'Sin conexión al catálogo compartido. ' + error.message;
  }
  renderAdminList();
})();

// Sincronizar cambios realizados en otras pestañas/ventanas y mostrar la lista
window.addEventListener('storage', (e) => {
  if (e.key === 'localProducts') {
    renderAdminList();
    try { showAdminToast('Catálogo actualizado'); } catch(e){}
    const section = document.querySelector('#admin-list-box');
    if (section) section.style.display = 'block';
    list.classList.add('highlight'); setTimeout(() => list.classList.remove('highlight'), 1800);
  }
});

// BroadcastChannel: recibir notificaciones en la misma sesión
try {
  bc?.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'update'){
      renderAdminList();
      try { showAdminToast('Catálogo actualizado'); } catch(e){}
      const section = document.querySelector('#admin-list-box');
      if (section) section.style.display = 'block';
      list.classList.add('highlight'); setTimeout(() => list.classList.remove('highlight'), 1800);
    }
  });
} catch(e) {}

// No hay productos de ejemplo: los productos se crean con el formulario "Guardar producto"
