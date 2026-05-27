// ═══════════════════════════════════════════════════
//  DrakoBets RAG — app.js
// ═══════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {

  // ── Referencias DOM ───────────────────────────────
  const btnConsultar  = document.getElementById("btnConsultar");
  const btnClear      = document.getElementById("btnClear");
  const btnCopy       = document.getElementById("btnCopy");
  const queryInput    = document.getElementById("query");
  const strategyLabel = document.getElementById("strategyLabel");
  const metaStrategy  = document.getElementById("metaStrategy");
  const metaTime      = document.getElementById("metaTime");
  const respDiv       = document.getElementById("respuesta");
  const emptyState    = document.getElementById("emptyState");
  const loadingState  = document.getElementById("loadingState");
  const loadingStep   = document.getElementById("loadingStep");
  const responseBox   = document.getElementById("responseBox");
  const refsList      = document.getElementById("refsList");
  const refsEmpty     = document.getElementById("refsEmpty");
  const toast         = document.getElementById("toast");
  const strategyGroup = document.getElementById("strategyGroup");
  const quickList     = document.getElementById("quickList");

  let currentStrategy = "";
  let lastResponse    = "";

  // ── Selector de estrategia ────────────────────────
  strategyGroup.querySelectorAll(".strategy-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      strategyGroup.querySelectorAll(".strategy-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentStrategy = btn.dataset.value;
      const labels = {
        "":               "Estrategia: Todas",
        "fixed-size":     "Estrategia: Fixed-size",
        "sentence-aware": "Estrategia: Sentence-aware",
        "semantic":       "Estrategia: Semantic",
      };
      strategyLabel.textContent = labels[currentStrategy] || "Estrategia: Todas";
    });
  });

  // ── Consultas rápidas ─────────────────────────────
  quickList.querySelectorAll(".quick-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      queryInput.value = btn.textContent.trim();
      queryInput.focus();
    });
  });

  // ── Limpiar ───────────────────────────────────────
  btnClear.addEventListener("click", () => {
    queryInput.value = "";
    showEmpty();
    queryInput.focus();
  });

  // ── Copiar respuesta ──────────────────────────────
  btnCopy.addEventListener("click", () => {
    if (!lastResponse) return;
    navigator.clipboard.writeText(lastResponse)
      .then(() => showToast("✅ Respuesta copiada al portapapeles"))
      .catch(() => showToast("❌ No se pudo copiar"));
  });

  // ── Enter para consultar (Ctrl+Enter) ─────────────
  queryInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
      e.preventDefault();
      btnConsultar.click();
    }
  });

  // ── Consultar ─────────────────────────────────────
  btnConsultar.addEventListener("click", async () => {
    const query = queryInput.value.trim();
    if (!query) {
      showToast("⚠️ Escribe una pregunta primero");
      queryInput.focus();
      return;
    }

    showLoading();
    const startTime = Date.now();

    try {
      // Paso 1: generar embedding
      updateLoadingStep("Generando embedding de la consulta...");
      await sleep(400);

      // Paso 2: búsqueda vectorial
      updateLoadingStep("Ejecutando $vectorSearch en MongoDB Atlas...");

      const body = { query };
      if (currentStrategy) body.estrategia = currentStrategy;

      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      // Paso 3: generando respuesta
      updateLoadingStep("Generando respuesta con Llama 3.3 70B...");
      await sleep(200);

      const data = await response.json();
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

      if (!data.ok) {
        showToast("❌ Error en la consulta: " + (data.error || "Error desconocido"));
        showEmpty();
        return;
      }

      // Mostrar respuesta
      lastResponse = data.respuesta;
      showResponse(data, currentStrategy, elapsed);

    } catch (err) {
      console.error("Error RAG:", err);
      showToast("❌ Error comunicándose con el servidor. ¿Está corriendo el backend?");
      showEmpty();
    }
  });

  // ── Funciones de estado ───────────────────────────

  function showEmpty() {
    emptyState.classList.remove("hidden");
    loadingState.classList.add("hidden");
    responseBox.classList.add("hidden");
    refsList.classList.add("hidden");
    refsEmpty.classList.remove("hidden");
    lastResponse = "";
  }

  function showLoading() {
    emptyState.classList.add("hidden");
    loadingState.classList.remove("hidden");
    responseBox.classList.add("hidden");
    btnConsultar.classList.add("loading");
  }

  function updateLoadingStep(text) {
    loadingStep.textContent = text;
  }

  function showResponse(data, estrategia, elapsed) {
    loadingState.classList.add("hidden");
    responseBox.classList.remove("hidden");
    btnConsultar.classList.remove("loading");

    // Meta
    const stratNames = {
      "":               "Todas las estrategias",
      "fixed-size":     "Fixed-size",
      "sentence-aware": "Sentence-aware",
      "semantic":       "Semantic",
    };
    metaStrategy.textContent = stratNames[estrategia] || "Todas las estrategias";
    metaTime.textContent = `⏱ ${elapsed}s`;

    // Respuesta
    respDiv.textContent = data.respuesta;

    // Referencias
    const refs = data.referencias || [];
    if (refs.length === 0) {
      refsList.classList.add("hidden");
      refsEmpty.classList.remove("hidden");
    } else {
      refsEmpty.classList.add("hidden");
      refsList.classList.remove("hidden");
      refsList.innerHTML = "";

      refs.forEach((ref, i) => {
        const card = buildRefCard(ref, i);
        refsList.appendChild(card);
      });
    }
  }

  function buildRefCard(ref, index) {
    const card = document.createElement("div");
    card.className = "ref-card";
    card.style.animationDelay = `${index * 0.06}s`;

    const estrategia = ref.estrategia_chunking || "unknown";
    const stratClass = {
      "fixed-size":     "strat-fixed",
      "sentence-aware": "strat-sentence",
      "semantic":       "strat-semantic",
    }[estrategia] || "strat-unknown";

    const score = ref.score ? (ref.score * 100).toFixed(1) + "%" : "—";
    const texto = ref.chunk_texto || ref.texto || "(sin texto)";
    const tokens = ref.num_tokens ? `${ref.num_tokens} tokens` : "";

    card.innerHTML = `
      <div class="ref-card-header">
        <span class="ref-strategy ${stratClass}">${estrategia}</span>
        <span class="ref-score">⭐ ${score}</span>
      </div>
      <div class="ref-text">${escapeHtml(texto)}</div>
      ${tokens ? `<div class="ref-tokens">📏 ${tokens}</div>` : ""}
    `;

    return card;
  }

  // ── Toast ─────────────────────────────────────────
  let toastTimer;
  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.remove("hidden");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add("hidden"), 3000);
  }

  // ── Utils ─────────────────────────────────────────
  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function escapeHtml(text) {
    const div = document.createElement("div");
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

});