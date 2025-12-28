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
  const normalizedProduct = selectedProduct.trim().toLowerCase();
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

  // 🔒 FINAL STOCK CHECK BEFORE PAYMENT
  if (stockMap[selectedProduct] === 0) {
    alert("This product just went out of stock.");
    closeModal();
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

  var rzp = new Razorpay(options);
  rzp.open();
}




/* ===============================
   STOCK CHECK (ARRAY FIXED)
================================ */

fetch("https://script.google.com/macros/s/AKfycbwJFKfqpzPNmr1AiRjQvkHZQwMOA6VhlVf-Gb5s6xoI3x-5MskyMg_0QyHhg5uHr772Sw/exec")
  .then(res => res.json())
  .then(data => {

    console.log("STOCK API DATA:", data);

    // RESET map
    stockMap = {};

    // HANDLE ARRAY RESPONSE
    data.forEach(item => {
      if (!item.Product || item.Stock === undefined) return;

      const key = item.Product.trim().toLowerCase();
      stockMap[key] = Number(item.Stock);
    });

    document.querySelectorAll(".product").forEach(card => {
      const nameEl = card.querySelector("h3");
      const button = card.querySelector("button");

      if (!nameEl || !button) return;

      const productName = nameEl.innerText.trim().toLowerCase();

      if (stockMap[productName] === 0) {
        button.innerText = "Out of Stock";
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      }
    });

  })
  .catch(err => console.error("Stock API error:", err));

