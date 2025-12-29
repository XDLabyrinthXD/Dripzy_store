// Initialize Firebase
firebase.initializeApp({
  apiKey: "AIzaSyARIYaMb--RSKu_x4PWidybaBrjuX-9gb8",
  authDomain: "dripzy-store.firebaseapp.com",
  projectId: "dripzy-store",
  storageBucket: "dripzy-store.firebasestorage.app",
  messagingSenderId: "663133645300",
  appId: "1:663133645300:web:9040e3ed4db6bf6bc4b1a1"
});

// Firebase Auth reference
const auth = firebase.auth();





let stockMap = {};

/* ===============================
   SCROLL ANIMATION
================================ */

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("show");
    }
  });
});

document.querySelectorAll(".hidden").forEach(el => observer.observe(el));

/* ===============================
   RAZORPAY PAYMENT
================================ */

let selectedProduct = "";
let selectedAmount = 0;

function payNow(product, amount) {

  if (!product) return;

  const normalized = product.trim().toLowerCase();

  if (stockMap[normalized] === 0) {
    alert("Sorry, this product is out of stock.");
    return;
  }

  selectedProduct = product;
  selectedAmount = amount;

  document.getElementById("addressModal").style.display = "flex";
}





function closeModal() {
  const modal = document.getElementById("addressModal");
  if (modal) modal.style.display = "none";
}

function startPayment() {


  if (!selectedProduct){
    alert("No Product Selected.");
    return;
  }

  const normalized = selectedProduct.trim().toLowerCase();

  if (stockMap[normalized] === 0) {
    alert("This product is out of stock.");
    closeModal();
    return;
  }

  const name = document.getElementById("custName").value;
  const phone = document.getElementById("custPhone").value;
  const address = document.getElementById("custAddress").value;
  const size = document.getElementById("custSize").value;

  if (!name || !phone || !address || !size) {
    alert("Please fill all details including size");
    return;
  }

  var options = {
    key: "rzp_live_Rwi4QfRTCE6kAN",
    amount: selectedAmount * 100,
    currency: "INR",
    name: "Dripzy Store",
    description: selectedProduct,

    handler: function (response) {
      fetch("https://script.google.com/macros/s/AKfycbwsB8Qh_h721E1P0pW4xiT4UYKIoAcZdy-4ylMEZESXO25wiSY-TEaghtP30vN7DHAUAA/exec", {
        method: "POST",
        body: JSON.stringify({
          product: selectedProduct,
          size: size,
          name: name,
          phone: phone,
          address: address,
          payment_id: response.razorpay_payment_id
        })
      });

      window.location.href = "thankyou.html";
    },

    prefill: {
      name: name,
      contact: phone
    },

    theme: {
      color: "#7c3aed"
    }
  };

  new Razorpay(options).open();
}





/* ===============================
   STOCK CHECK (FINAL FIX)
================================ */

fetch("https://script.google.com/macros/s/AKfycbwJFKfqpzPNmr1AiRjQvkHZQwMOA6VhlVf-Gb5s6xoI3x-5MskyMg_0QyHhg5uHr772Sw/exec")
  .then(res => res.json())
  .then(data => {

    console.log("STOCK API DATA:", data);

    stockMap = {}; // reset

    data.forEach(item => {
      if (!item.product || item.stock === undefined) return;

      const key = item.product.trim().toLowerCase();
      stockMap[key] = Number(item.stock);
    });

    document.querySelectorAll(".product").forEach(card => {
      const nameEl = card.querySelector("h3");
      const button = card.querySelector("button");

      if (!nameEl || !button) return;

      const key = nameEl.innerText.trim().toLowerCase();

      if (stockMap[key] === 0) {
        button.innerText = "Out of Stock";
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
        button.onclick = null; // 💥 critical
      }
    });
  })
  .catch(err => console.error("Stock API error:", err));

// LOGIN MODAL CONTROLS
const loginBtn = document.getElementById("loginBtn");
const loginModal = document.getElementById("loginModal");
const closeLoginBtn = document.getElementById("closeLogin");

// Open modal
if (loginBtn) {
  loginBtn.addEventListener("click", () => {
    loginModal.style.display = "flex";
  });
}

// Close modal
if (closeLoginBtn) {
  closeLoginBtn.addEventListener("click", () => {
    loginModal.style.display = "none";
  });
}

// Optional functions (for checkout trigger later)
function openLogin() {
  loginModal.style.display = "flex";
}

function closeLogin() {
  loginModal.style.display = "none";
}

const googleLoginBtn = document.getElementById("googleLogin");

googleLoginBtn.addEventListener("click", () => {
  const provider = new firebase.auth.GoogleAuthProvider();

  auth.signInWithPopup(provider)
    .then((result) => {
      const user = result.user;
      alert(`Welcome ${user.displayName}`);
      closeLogin();
    })
    .catch((error) => {
      alert(error.message);
    });
});

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const auth = getAuth();
const provider = new GoogleAuthProvider();

// LOGIN
document.getElementById("googleLogin").addEventListener("click", () => {
  signInWithPopup(auth, provider)
    .then(() => {
      closeLogin();
    })
    .catch(err => {
      alert(err.message);
    });
});

// AUTH STATE CHANGE
onAuthStateChanged(auth, (user) => {
  const loginBtn = document.getElementById("loginBtn");
  const userBox = document.getElementById("userBox");

  if (user) {
    // User logged in
    loginBtn.style.display = "none";
    userBox.style.display = "flex";

    document.getElementById("userName").innerText = user.displayName;
    document.getElementById("userPhoto").src = user.photoURL;
  } else {
    // User logged out
    loginBtn.style.display = "inline-block";
    userBox.style.display = "none";
  }
});

// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", () => {
  signOut(auth);
});
