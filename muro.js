// ====== 1) Imports Firebase (v9 modular) ======
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp,
  query, orderBy, limit, startAfter, getDocs
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import {
  getStorage, ref, uploadBytes, getDownloadURL
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";
import {
  getAuth, signInAnonymously, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

// ====== 2) TU CONFIG ======
const firebaseConfig = {
  apiKey: "AIzaSyDoNLrN4nppoIpFSZl5FDKvpmKp8V0L2G8",
  authDomain: "subsuelo-1c909.firebaseapp.com",
  projectId: "subsuelo-1c909",
  storageBucket: "subsuelo-1c909.appspot.com",
  messagingSenderId: "237934487615",
  appId: "1:237934487615:web:1ec3a4e09be966c18cb08a",
  measurementId: "G-2E3WHZK2W2"
};

// ====== 3) Init (una sola vez) ======
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);
const auth = getAuth(firebaseApp);

// (quitado Analytics, no lo usamos aquí)

// ====== 4) Referencias DOM ======
const form = document.getElementById("muroForm");
const fileInput = document.getElementById("fileInput");
const tituloInput = document.getElementById("tituloInput");
const textoInput = document.getElementById("textoInput");
const autorInput = document.getElementById("autorInput");
const estado = document.getElementById("estado");
const galeria = document.getElementById("galeria");
const btnMas = document.getElementById("cargarMas");

let lastDoc = null; // para paginar

// ====== 5) Auth anónimo y habilitar botón cuando esté listo ======
const btn = document.querySelector('#muroForm button[type="submit"]');
btn.disabled = true;
btn.textContent = 'Conectando…';

signInAnonymously(auth).catch(console.error);
onAuthStateChanged(auth, (user) => {
  if (user) {
    btn.disabled = false;
    btn.textContent = 'Subir al Muro';
  }
});

// ====== 6) Subir imagen + guardar metadata ======
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  estado.textContent = "Subiendo…";

  const file = fileInput.files[0];
  if (!file) { estado.textContent = "Subí una imagen."; return; }
  if (file.size > 8 * 1024 * 1024) { estado.textContent = "Archivo > 8MB"; return; }

  try {
    const safeName = file.name.replace(/\s+/g, "_").toLowerCase();
    const path = `muro/${Date.now()}_${safeName}`;
    const fileRef = ref(storage, path);

    await uploadBytes(fileRef, file);
    const url = await getDownloadURL(fileRef);

    await addDoc(collection(db, "muro"), {
      url,
      titulo: tituloInput.value.trim(),
      texto: textoInput.value.trim(),
      autor: autorInput.value.trim() || "Anónimo",
      createdAt: serverTimestamp()
    });

    estado.textContent = "¡Listo! Tu aporte está en el Muro.";
    form.reset();
    galeria.innerHTML = "";
    lastDoc = null;
    cargarLote();
  } catch (err) {
    console.error(err);
    estado.textContent = "Error al subir. Intenta de nuevo.";
  }
});

// ====== 7) Listar galería (por lotes) ======
async function cargarLote() {
  let q = query(collection(db, "muro"), orderBy("createdAt", "desc"), limit(8));
  if (lastDoc) {
    q = query(collection(db, "muro"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(8));
  }

  const snap = await getDocs(q);
  if (snap.empty && !lastDoc) {
    galeria.innerHTML = `<p style="color:#bbb">Aún no hay publicaciones. Sé el primero en pintar el Muro ✨</p>`;
    btnMas.style.display = "none";
    return;
  }

  const frag = document.createDocumentFragment();
  snap.forEach(doc => {
    const d = doc.data();
    const card = document.createElement("article");
    card.className = "muro-card";
    card.innerHTML = `
      <img src="${d.url}" alt="${d.titulo || 'Aporte al Muro'}">
      <div class="muro-card__body">
        <div class="muro-card__title">${escapeHTML(d.titulo || 'Sin título')}</div>
        ${d.texto ? `<p>${escapeHTML(d.texto)}</p>` : ""}
        <div class="muro-card__meta">por ${escapeHTML(d.autor || 'Anónimo')}</div>
      </div>
    `;
    frag.appendChild(card);
  });
  galeria.appendChild(frag);

  const docs = snap.docs;
  lastDoc = docs.length ? docs[docs.length - 1] : lastDoc;
  btnMas.style.display = docs.length === 8 ? "block" : "none";
}

btnMas?.addEventListener("click", cargarLote);
cargarLote();

// ====== 8) Saneador básico ======
function escapeHTML(str="") {
  return str.replace(/[&<>"'`=\/]/g, s =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[s])
  );
}

[
  {
    "origin": ["http://127.0.0.1:5500"],
    "method": ["GET", "POST", "PUT"],
    "maxAgeSeconds": 3600
  }
]
