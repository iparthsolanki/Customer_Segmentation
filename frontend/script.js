/* ==========================================================
   RFM Insight — Customer Intelligence Dashboard
   Vanilla JS: navigation, scroll reveal, prediction form
========================================================== */

// ------------------------------------------------------------
// Config — FastAPI Production Backend
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

    toggle.setAttribute(
      "aria-expanded",
      String(isOpen)
    );

  });


  links.querySelectorAll("a").forEach((link) => {

    link.addEventListener("click", () => {

      links.classList.remove("is-open");

      toggle.setAttribute(
        "aria-expanded",
        "false"
      );

    });

  });

})();


// ------------------------------------------------------------
// Fade-in on scroll
// ------------------------------------------------------------

(function initScrollReveal() {

  const targets = document.querySelectorAll(".fade-in");

  if (
    !("IntersectionObserver" in window) ||
    targets.length === 0
  ) {

    targets.forEach((el) =>
      el.classList.add("is-visible")
    );

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

    {
      threshold: 0.15
    }

  );


  targets.forEach((el) =>
    observer.observe(el)
  );

})();


// ------------------------------------------------------------
// Prediction Form
// ------------------------------------------------------------

(function initPredictForm() {

  const form =
    document.getElementById("predictForm");

  const btn =
    document.getElementById("predictBtn");

  const statusEl =
    document.getElementById("formStatus");


  const resultEmpty =
    document.getElementById("resultEmpty");

  const resultCard =
    document.getElementById("resultCard");

  const resultCluster =
    document.getElementById("resultCluster");

  const resultSegment =
    document.getElementById("resultSegment");

  const resultMetrics =
    document.getElementById("resultMetrics");

  const resultRecommendation =
    document.getElementById("resultRecommendation");


  if (!form) return;


  // ----------------------------------------------------------
  // Input Fields
  // ----------------------------------------------------------

  const fields = {

    Recency: {

      input:
        document.getElementById("recency"),

      error:
        document.getElementById("recencyError"),

      min: 0,

      label: "Recency"

    },


    Frequency: {

      input:
        document.getElementById("frequency"),

      error:
        document.getElementById("frequencyError"),

      min: 1,

      label: "Frequency"

    },


    Monetary: {

      input:
        document.getElementById("monetary"),

      error:
        document.getElementById("monetaryError"),

      min: 0,

      label: "Monetary"

    }

  };


  // ----------------------------------------------------------
  // Clear Field Error
  // ----------------------------------------------------------

  function clearFieldError(field) {

    const fieldContainer =
      field.input.closest(".field");

    if (fieldContainer) {

      fieldContainer.classList.remove(
        "has-error"
      );

    }


    if (field.error) {

      field.error.textContent = "";

    }

  }


  // ----------------------------------------------------------
  // Set Field Error
  // ----------------------------------------------------------

  function setFieldError(field, message) {

    const fieldContainer =
      field.input.closest(".field");

    if (fieldContainer) {

      fieldContainer.classList.add(
        "has-error"
      );

    }


    if (field.error) {

      field.error.textContent = message;

    }

  }


  // ----------------------------------------------------------
  // Validate Input
  // ----------------------------------------------------------

  function validate() {

    let valid = true;

    const payload = {};


    Object.entries(fields).forEach(
      ([key, field]) => {

        clearFieldError(field);


        const raw =
          field.input.value.trim();


        if (raw === "") {

          setFieldError(
            field,
            `${field.label} is required.`
          );

          valid = false;

          return;

        }


        const num =
          Number(raw);


        if (!Number.isFinite(num)) {

          setFieldError(
            field,
            `${field.label} must be a valid number.`
          );

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

      }
    );


    return valid
      ? payload
      : null;

  }


  // ----------------------------------------------------------
  // Loading State
  // ----------------------------------------------------------

  function setLoading(isLoading) {

    btn.disabled = isLoading;

    btn.classList.toggle(
      "is-loading",
      isLoading
    );


    const label =
      btn.querySelector(".btn__label");


    if (label) {

      label.textContent = isLoading

        ? "Analyzing customer behavior..."

        : "Predict Customer Segment";

    }

  }


  // ----------------------------------------------------------
  // Status Message
  // ----------------------------------------------------------

  function setStatus(message, isError) {

    if (!statusEl) return;


    statusEl.textContent =
      message || "";


    statusEl.classList.toggle(
      "is-error",
      Boolean(isError)
    );

  }


  // ----------------------------------------------------------
  // Render Prediction Result
  // ----------------------------------------------------------

  function renderResult(
    data,
    submittedPayload
  ) {

    if (resultCluster) {

      resultCluster.textContent =
        `Cluster ${data.cluster}`;

    }


    if (resultSegment) {

      resultSegment.textContent =
        data.segment;

    }


    if (resultRecommendation) {

      resultRecommendation.textContent =
        data.recommendation;

    }


    // --------------------------------------------------------
    // Display Submitted RFM Metrics
    // --------------------------------------------------------

    if (resultMetrics) {

      resultMetrics.innerHTML = "";


      Object.entries(
        submittedPayload
      ).forEach(([key, value]) => {

        const wrap =
          document.createElement("div");

        wrap.className =
          "result-metric";


        const label =
          document.createElement("span");

        label.className =
          "result-metric__label";

        label.textContent =
          key;


        const val =
          document.createElement("span");

        val.className =
          "result-metric__value";

        val.textContent =
          value;


        wrap.appendChild(label);

        wrap.appendChild(val);

        resultMetrics.appendChild(
          wrap
        );

      });

    }


    if (resultEmpty) {

      resultEmpty.hidden = true;

    }


    if (resultCard) {

      resultCard.hidden = false;

    }

  }


  // ==========================================================
  // FASTAPI PREDICTION REQUEST
  // ==========================================================

  async function submitPrediction(
    payload
  ) {

    let response;


    try {

      /*
        IMPORTANT:

        FastAPI endpoint is:

        POST /predict

        Therefore we MUST call:

        ${API_URL}/predict

        NOT just API_URL
      */

      response = await fetch(
        `${API_URL}/predict`,
        {

          method: "POST",

          headers: {

            "Content-Type":
              "application/json"

          },

          body:
            JSON.stringify(payload)

        }
      );

    }

    catch (networkErr) {

      console.error(
        "Network Error:",
        networkErr
      );


      throw new Error(
        "Unable to reach the prediction server. Please try again."
      );

    }


    // --------------------------------------------------------
    // Parse Server Response
    // --------------------------------------------------------

    let body = null;


    try {

      body =
        await response.json();

    }

    catch (parseErr) {

      body = null;

    }


    // --------------------------------------------------------
    // Handle HTTP Errors
    // --------------------------------------------------------

    if (!response.ok) {

      let message =
        "Prediction request failed. Please try again.";


      // FastAPI standard error
      if (
        body &&
        typeof body.detail === "string"
      ) {

        message =
          body.detail;

      }


      // Pydantic validation error
      else if (
        body &&
        Array.isArray(body.detail) &&
        body.detail.length > 0
      ) {

        message =
          body.detail

            .map(
              (error) =>
                error.msg ||
                "Invalid input"
            )

            .join(" ");

      }


      throw new Error(
        message
      );

    }


    // --------------------------------------------------------
    // Validate Successful Response
    // --------------------------------------------------------

    if (
      !body ||
      typeof body.cluster !== "number" ||
      typeof body.segment !== "string" ||
      typeof body.recommendation !== "string"
    ) {

      throw new Error(
        "The server returned an unexpected response."
      );

    }


    return body;

  }


  // ==========================================================
  // FORM SUBMISSION
  // ==========================================================

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      setStatus(
        "",
        false
      );


      // ------------------------------------------------------
      // Validate Form
      // ------------------------------------------------------

      const payload =
        validate();


      if (!payload) {

        setStatus(
          "Please fix the highlighted fields.",
          true
        );

        return;

      }


      // ------------------------------------------------------
      // Start Loading
      // ------------------------------------------------------

      setLoading(
        true
      );


      try {

        // ----------------------------------------------------
        // Call FastAPI
        // ----------------------------------------------------

        const data =
          await submitPrediction(
            payload
          );


        // ----------------------------------------------------
        // Display Result
        // ----------------------------------------------------

        renderResult(
          data,
          payload
        );


        setStatus(
          "Prediction complete.",
          false
        );


      }

      catch (err) {

        console.error(
          "Prediction Error:",
          err
        );


        setStatus(
          err.message ||
          "Something went wrong. Please try again.",
          true
        );

      }


      finally {

        setLoading(
          false
        );

      }

    }
  );


  // ------------------------------------------------------------
  // Clear Errors While Typing
  // ------------------------------------------------------------

  Object.values(fields)
    .forEach((field) => {

      if (!field.input) return;


      field.input.addEventListener(
        "input",
        () =>
          clearFieldError(field)
      );

    });

})();