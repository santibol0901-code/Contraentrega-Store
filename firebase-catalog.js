firebase.initializeApp({
  apiKey: 'AIzaSyB17aFlrNFyRmnLceojXc0BcF0L5B8Qzfg',
  authDomain: 'contraentrega-store.firebaseapp.com',
  projectId: 'contraentrega-store',
  storageBucket: 'contraentrega-store.firebasestorage.app',
  messagingSenderId: '726488067962',
  appId: '1:726488067962:web:c9790c6c50606f28f0c3',
  measurementId: 'G-M3NMJZ41XE'
});

const productsCollection = firebase.firestore().collection('products');
window.catalogStore = {
  async getProducts() {
    const snapshot = await productsCollection.get();
    return snapshot.docs.map(document => ({ id: document.id, ...document.data() }));
  },
  async createProduct(product) {
    const id = String(product.id || Date.now());
    await productsCollection.doc(id).set({ ...product, id, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    return { ...product, id };
  },
  async updateProduct(id, product) {
    await productsCollection.doc(String(id)).set({ ...product, id: String(id), updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
  },
  async removeProduct(id) { await productsCollection.doc(String(id)).delete(); },
  watchProducts(callback) {
    return productsCollection.onSnapshot(snapshot => callback(snapshot.docs.map(document => ({ id: document.id, ...document.data() }))));
  }
};
