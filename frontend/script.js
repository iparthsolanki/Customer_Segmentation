/* ==========================================================
   RFM Insight — Customer Intelligence Dashboard
   Vanilla JS: navigation, scroll reveal, prediction form
========================================================== */

// ------------------------------------------------------------
// Config — matches the FastAPI backend's exact contract
// ------------------------------------------------------------
const API_URL = "https://customer-segmentation-vb34.onrender.com";

// ------------------------------------------------------------
// Mobile navigation toggle
// ------------------------------------------------------------
(function initNav() {
  const toggle = document.getElementById("navToggle");
  const links = document.querySelector(".navlinks");
  if (!toggle || !links) return;

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      links.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();

// ------------------------------------------------------------
// Fade-in on scroll
// ------------------------------------------------------------
(function initScrollReveal() {
  const targets = document.querySelectorAll(".fade-in");
  if (!("IntersectionObserver" in window) || targets.length === 0) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
})();

// ------------------------------------------------------------
// Prediction form
// ------------------------------------------------------------
(function initPredictForm() {
  const form = document.getElementById("predictForm");
  const btn = document.getElementById("predictBtn");
  const statusEl = document.getElementById("formStatus");

  const resultEmpty = document.getElementById("resultEmpty");
  const resultCard = document.getElementById("resultCard");
  const resultCluster = document.getElementById("resultCluster");
  const resultSegment = document.getElementById("resultSegment");
  const resultMetrics = document.getElementById("resultMetrics");
  const resultRecommendation = document.getElementById("resultRecommendation");

  if (!form) return;

  const fields = {
    Recency: {
      input: document.getElementById("recency"),
      error: document.getElementById("recencyError"),
      min: 0,
      label: "Recency",
    },
    Frequency: {
      input: document.getElementById("frequency"),
      error: document.getElementById("frequencyError"),
      min: 1,
      label: "Frequency",
    },
    Monetary: {
      input: document.getElementById("monetary"),
      error: document.getElementById("monetaryError"),
      min: 0,
      label: "Monetary",
    },
  };

  function clearFieldError(field) {
    field.input.closest(".field").classList.remove("has-error");
    field.error.textContent = "";
  }

  function setFieldError(field, message) {
    field.input.closest(".field").classList.add("has-error");
    field.error.textContent = message;
  }

  // Validate all fields, return parsed payload or null if invalid.
  function validate() {
    let valid = true;
    const payload = {};

    Object.entries(fields).forEach(([key, field]) => {
      clearFieldError(field);
      const raw = field.input.value.trim();

      if (raw === "") {
        setFieldError(field, `${field.label} is required.`);
        valid = false;
        return;
      }

      const num = Number(raw);

      if (Number.isNaN(num)) {
        setFieldError(field, `${field.label} must be a number.`);
        valid = false;
        return;
      }

      if (num < field.min) {
        setFieldError(
          field,
          field.min === 0
            ? `${field.label} cannot be negative.`
            : `${field.label} must be at least ${field.min}.`
        );
        valid = false;
        return;
      }

      payload[key] = num;
    });

    return valid ? payload : null;
  }

  function setLoading(isLoading) {
    btn.disabled = isLoading;
    btn.classList.toggle("is-loading", isLoading);
    btn.querySelector(".btn__label").textContent = isLoading
      ? "Analyzing customer behavior..."
      : "Predict Customer Segment";
  }

  function setStatus(message, isError) {
    statusEl.textContent = message || "";
    statusEl.classList.toggle("is-error", Boolean(isError));
  }

  function renderResult(data, submittedPayload) {
    resultCluster.textContent = `Cluster ${data.cluster}`;
    resultSegment.textContent = data.segment;
    resultRecommendation.textContent = data.recommendation;

    resultMetrics.innerHTML = "";
    Object.entries(submittedPayload).forEach(([key, value]) => {
      const wrap = document.createElement("div");
      wrap.className = "result-metric";

      const label = document.createElement("span");
      label.className = "result-metric__label";
      label.textContent = key;

      const val = document.createElement("span");
      val.className = "result-metric__value";
      val.textContent = value;

      wrap.appendChild(label);
      wrap.appendChild(val);
      resultMetrics.appendChild(wrap);
    });

    resultEmpty.hidden = true;
    resultCard.hidden = false;
  }

  async function submitPrediction(payload) {
    let response;

    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch (networkErr) {
      throw new Error(
        "Couldn't reach the prediction server. Make sure the FastAPI backend is running on http://127.0.0.1:8000."
      );
    }

    let body = null;
    try {
      body = await response.json();
    } catch (parseErr) {
      body = null;
    }

    if (!response.ok) {
      // FastAPI validation errors (422) come back as { detail: [...] }
      // Other errors come back as { detail: "message" }.
      let message = "The prediction request failed. Please check your inputs and try again.";

      if (body && typeof body.detail === "string") {
        message = body.detail;
      } else if (body && Array.isArray(body.detail) && body.detail.length > 0) {
        message = body.detail
          .map((d) => d.msg || "Invalid input")
          .join(" ");
      }

      throw new Error(message);
    }

    if (!body || typeof body.cluster !== "number" || !body.segment || !body.recommendation) {
      throw new Error("The server returned an unexpected response.");
    }

    return body;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    setStatus("", false);

    const payload = validate();
    if (!payload) {
      setStatus("Please fix the highlighted fields.", true);
      return;
    }

    setLoading(true);

    try {
      const data = await submitPrediction(payload);
      renderResult(data, payload);
      setStatus("Prediction complete.", false);
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      setLoading(false);
    }
  });

  // Clear a field's error as soon as the user edits it.
  Object.values(fields).forEach((field) => {
    field.input.addEventListener("input", () => clearFieldError(field));
  });
})();
