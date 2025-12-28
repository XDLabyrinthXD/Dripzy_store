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

  // 🔒 STOCK CHECK BEFORE OPENING MODAL
  if (stockMap[product] === 0) {
    alert("Sorry, this product is out of stock.");
    return;
  }

  selectedProduct = product;
  selectedAmount = amount;

  const modal = document.getElementById("addressModal");
  if (!modal) {
    console.error("addressModal not found in DOM");
    return;
  }

  modal.style.display = "flex";
}

function closeModal() {
  const modal = document.getElementById("addressModal");
  if (modal) modal.style.display = "none";
}

function startPayment() {
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
   STOCK CHECK
================================ */

const STOCK_API_URL = "https://script.google.com/macros/s/AKfycbwJFKfqpzPNmr1AiRjQvkHZQwMOA6VhlVf-Gb5s6xoI3x-5MskyMg_0QyHhg5uHr772Sw/exec";

fetch(STOCK_API_URL)
  .then(res => res.json())
  .then(data => {
    const stockMap = {};

    // Convert array → object
    data.forEach(item => {
      stockMap[item.Product.trim()] = Number(item.Stock);
    });

    document.querySelectorAll(".product").forEach(card => {
      const name = card.querySelector("h3")?.innerText.trim();
      const button = card.querySelector("button");

      if (!name || !button) return;

      if (stockMap[name] === 0) {
        button.innerText = "Out of Stock";
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      }
    });
  })
  .catch(err => console.error("Stock API error:", err));

