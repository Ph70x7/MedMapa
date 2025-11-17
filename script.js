 const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQxEAhAtwIyP7usayf7uwx8F3A71WzwF2OrrEOEgdUxKehG39i79oRtrHAYYCqD2TQZBuOB6aqraHCb/pub?output=csv&gid=1554106736";
    
    function parseCSV(text) {
      return text.split("\n").map(row =>
        row.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(cell =>
          cell.replace(/^"|"$/g, "").trim()
        )
      );
    }

    async function loadClinics() {
      try {
        const response = await fetch(SHEET_URL);
        if (!response.ok) throw new Error("Erro ao buscar planilha");
        const data = await response.text();
        const rows = parseCSV(data);
        const clinics = rows.slice(1).map(row => {
          const lat = parseFloat((row[8] || "").replace(",", "."));
          const lng = parseFloat((row[9] || "").replace(",", "."));
          return {
            name: row[0],
            city: row[1],
            exams: row[2] ? row[2].split(";") : [],
            phone: row[3],
            email: row[4],
            instagram: row[5],
            website: row[6],
            address: row[7],
            location: (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : null
          };
        });
        console.log("Clinics carregadas:", clinics);
        return clinics;
      } catch (err) {
        console.error(err);
        alert("⚠️ Não foi possível carregar os dados da planilha.");
        return [];
      }
    }

    let map = L.map('map', { zoomControl: false }).setView([-6.07, -49.9], 13);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19, attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    let markersLayer = L.layerGroup().addTo(map);

async function searchClinics() {
  const clinics = await loadClinics();
  const city = document.querySelector("#citySelect .selected").dataset.value || "";
  const exam = (document.querySelector("#examSelect .selected").dataset.value || "").toLowerCase();
  const plan = (document.querySelector("#planSelect .selected").dataset.value || "").toLowerCase();

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";
  markersLayer.clearLayers();

  // 🔥 Validação (incluindo plano)
  if (!city || !exam || !plan) {
    resultsDiv.innerHTML = "<p style='text-align:center'>⚠️ Selecione a cidade, exame e o plano.</p>";
    return;
  }

  // 🔥 Filtro com múltiplos exames e múltiplos planos
  const filtered = clinics.filter(c => {
    const examsArray = c.exams.split(";").map(e => e.trim().toLowerCase());
    const plansArray = c.plans.split(";").map(p => p.trim().toLowerCase());

    return (
      c.city === city &&
      examsArray.some(e => e.includes(exam)) &&
      plansArray.some(p => p.includes(plan))
    );
  });

  // 🔥 Caso não encontre nada
  if (filtered.length === 0) {
    resultsDiv.innerHTML = "<p style='text-align:center'>❌ Nenhuma clínica encontrada.</p>";
    return;
  }

  // 🔥 Exibe resultados (igual ao seu original)
  filtered.forEach(c => {
    const item = document.createElement("div");
    item.className = "result-item";
    item.innerHTML = `
      <h3>${c.name}</h3>
      <p><strong>Endereço:</strong> ${c.address}</p>
      <p><strong>Exames:</strong> ${c.exams}</p>
      <p><strong>Planos:</strong> ${c.plans}</p>
    `;
    resultsDiv.appendChild(item);

    if (c.lat && c.lng) {
      L.marker([c.lat, c.lng]).addTo(markersLayer).bindPopup(c.name);
    }
  });
}


      const bounds = [];

      filtered.forEach(clinic => {
        const div = document.createElement("div");
        div.className = "clinic";
        div.innerHTML = `
          <h2>${clinic.name}</h2>
          <p><i class="fa-solid fa-map-marker-alt"></i> 
            <a href="https://www.google.com/maps?q=${clinic.location?.lat || ""},${clinic.location?.lng || ""}" target="_blank">${clinic.address}</a>
          </p>
          <p><i class="fa-solid fa-phone"></i> ${clinic.phone}</p>
          ${clinic.email ? `<p><i class="fa-solid fa-envelope"></i> ${clinic.email}</p>` : ""}
          ${clinic.instagram ? `<p><i class="fa-brands fa-instagram"></i> ${clinic.instagram}</p>` : ""}
          ${clinic.website ? `<p><i class="fa-solid fa-globe"></i> <a href="${clinic.website}" target="_blank">${clinic.website}</a></p>` : ""}
        `;
        resultsDiv.appendChild(div);

        if (clinic.location) {
          const marker = L.marker([clinic.location.lat, clinic.location.lng])
            .bindPopup(`<strong>${clinic.name}</strong><br>${clinic.address}`);
          markersLayer.addLayer(marker);
          bounds.push([clinic.location.lat, clinic.location.lng]);
        }
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    }

    // Custom select behavior
    document.querySelectorAll(".custom-select").forEach(select => {
      const selected = select.querySelector(".selected");
      const options = select.querySelector(".options");
      selected.addEventListener("click", () => {
        document.querySelectorAll(".custom-select").forEach(s => {
          if (s !== select) s.classList.remove("open");
        });
        select.classList.toggle("open");
      });
      options.querySelectorAll("div[data-value]").forEach(option => {
        option.addEventListener("click", () => {
          selected.textContent = option.textContent;
          selected.dataset.value = option.dataset.value;
          select.classList.remove("open");
        });
      });
    });
    document.addEventListener("click", e => {
      if (!e.target.closest(".custom-select")) {
        document.querySelectorAll(".custom-select").forEach(s => s.classList.remove("open"));
      }
    });
    document.querySelectorAll(".custom-select .search-input").forEach(input => {
      input.addEventListener("input", e => {
        const term = e.target.value.toLowerCase();
        const optionsDiv = e.target.closest(".options");
        optionsDiv.querySelectorAll("div[data-value]").forEach(opt => {
          opt.style.display = opt.textContent.toLowerCase().includes(term) ? "block" : "none";
        });
      });

    });

