document.addEventListener("DOMContentLoaded", () => {
  if (typeof EMAILJS_PUBLIC_KEY === "undefined") {
    console.warn("EMAILJS_PUBLIC_KEY not set in config.js");
  }

  if (window.emailjs && typeof emailjs.init === "function") {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  // set max DOB to today
  const todayStr = new Date().toISOString().split("T")[0];
  const dobInput = document.getElementById("dob");
  dobInput.setAttribute("max", todayStr);

  const countrySelect = document.getElementById("countrySelect");
  const flagImage = document.getElementById("flagImage");
  const ageDisplay = document.getElementById("ageDisplay");

  // fetching countries (only name + flags)
  fetch("https://restcountries.com/v3.1/all?fields=name,flags")
    .then((r) => r.json())
    .then((data) => {
      data.sort((a, b) =>
        (a.name.common || "").localeCompare(b.name.common || "")
      );
      data.forEach((c) => {
        const opt = document.createElement("option");
        opt.value = c.name.common || "";
        opt.textContent = c.name.common || "";
        opt.dataset.flag = c.flags && c.flags.png ? c.flags.png : "";
        countrySelect.appendChild(opt);
      });

      if (countrySelect.options.length) {
        flagImage.src = countrySelect.options[0].dataset.flag || "";
        flagImage.alt = countrySelect.options[0].value || "flag";
      }
    })
    .catch((err) => {
      console.error("Countries fetch failed", err);
      const fallback = document.createElement("option");
      fallback.value = "Unknown";
      fallback.textContent = "Unknown";
      countrySelect.appendChild(fallback);
    });

  // updating flag when country changes
  countrySelect.addEventListener("change", (e) => {
    const opt = e.target.selectedOptions[0];
    flagImage.src = opt.dataset.flag || "";
    flagImage.alt = opt.value || "flag";
  });

  // age calculation (years, months, days)
  dobInput.addEventListener("change", () => {
    const val = dobInput.value;
    if (!val) {
      ageDisplay.textContent = "";
      return;
    }
    const dob = new Date(val);
    const today = new Date();

    let years = today.getFullYear() - dob.getFullYear();
    let months = today.getMonth() - dob.getMonth();
    let days = today.getDate() - dob.getDate();

    if (days < 0) {
      months--;
      const prevMonthLastDay = new Date(
        today.getFullYear(),
        today.getMonth(),
        0
      ).getDate();
      days += prevMonthLastDay;
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    ageDisplay.textContent = `Age: ${years} years, ${months} months, ${days} days`;
    ageDisplay.dataset.years = String(years);
  });

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", (ev) => {
    ev.preventDefault();

    const name = (document.getElementById("firstName").value || "").trim();
    const dob = (document.getElementById("dob").value || "").trim();
    const genderInput = document.querySelector('input[name="gender"]:checked');
    const gender = genderInput ? genderInput.value : "";
    const country = (countrySelect.value || "").trim();
    const flag = flagImage.src || "";

    // Validation for name: at least 2 letters at the start

    if (!name || !dob || !gender || !country) {
      // SweetAlert2 for a big emoji
      Swal.fire({
        title: "Don't You Think You Should Fill All Fields",
        html: '<div style="font-size:3.2rem;">😡 😡</div>',
        confirmButtonText: "OK",
        confirmButtonColor: "#3dc5daff",
        background: "#434e5fff",
        color: "#fff",
      });
      return;
    }

    if (!/^[A-Za-z]{2,}/.test(name)) {
      Swal.fire("Please Enter a Valid Name");
      return;
    }

    const dobDate = new Date(dob);
    const diff = Date.now() - dobDate.getTime();
    const yearsOnly = Math.abs(new Date(diff).getUTCFullYear() - 1970);

    const params = {
      name: name,
      dob: dob,
      age: yearsOnly,
      gender: gender,
      country: country,
      flag: flag,
    };

    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, params)
      .then(() => {
        Swal.fire({
          title: "Great!",
          html: '<div style="font-size:1.4rem;">Let\'s move to the game 🎮</div>',
          confirmButtonText: "Let's go!",
        }).then(() => {
          window.location.href = "game_info.html";
        });
      })
      .catch((err) => {
        console.error("EmailJS error", err);
        Swal.fire(
          "Error",
          "Could not send email. Check console for details.",
          "error"
        );
      });
  });
});
