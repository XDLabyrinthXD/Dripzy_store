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

fetch("https://script.google.com/macros/s/AKfycbwv1N77xg4XmhgHwXN8wpz7va8qTENT_uXAdvem4D8GLyYHECb9DvjqCoq_4Kc9kJ3I/exec")
  .then(res => res.json())
  .then(stock => {
    document.querySelectorAll(".product").forEach(card => {
      const name = card.querySelector("h3")?.innerText.trim();
      const button = card.querySelector("button");

      if (!name || !button) return;

      if (stock[name] === 0) {
        button.innerText = "Out of Stock";
        button.disabled = true;
        button.style.opacity = "0.5";
        button.style.cursor = "not-allowed";
      }
    });
  })
  .catch(err => console.error("Stock API error:", err));
