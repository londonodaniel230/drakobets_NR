document.addEventListener("DOMContentLoaded", () => {

    const btn = document.getElementById("btnConsultar");
    const queryInput = document.getElementById("query");
    const respDiv = document.getElementById("respuesta");
    const refDiv = document.getElementById("referencias");

    btn.addEventListener("click", async () => {
        const query = queryInput.value.trim();

        if (!query) {
            respDiv.innerHTML = "⚠️ Escribe una pregunta primero.";
            return;
        }

        respDiv.innerHTML = "⏳ Procesando consulta...";
        refDiv.innerHTML = "";

        try {
            const response = await fetch("/api/rag", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query })
            });

            const data = await response.json();

            if (!data.ok) {
                respDiv.innerHTML = "❌ Error en la consulta.";
                return;
            }

            respDiv.innerHTML = data.respuesta;

            // Mostrar referencias
            refDiv.innerHTML = data.referencias
                .map(ref => JSON.stringify(ref, null, 2))
                .join("\n\n");

        } catch (err) {
            respDiv.innerHTML = "❌ Error comunicándose con el servidor.";
            console.error(err);
        }
    });

});
