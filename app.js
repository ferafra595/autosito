window.App = (() => {
  const fmtPrice = (n) => new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(n);
  const fmtKm = (n) => new Intl.NumberFormat("it-IT").format(n) + " km";

  const setYear = () => {
    const el = document.getElementById("year");
    if (el) el.textContent = new Date().getFullYear();
  };

  async function loadCars() {
    const res = await fetch("cars.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Impossibile caricare il catalogo");
    return await res.json();
  }

  function carCard(car) {
    const q = encodeURIComponent(`Ciao! Mi interessa: ${car.title} (${car.year}) — id: ${car.id}. È disponibile?`);
    const wa = `https://wa.me/390000000000?text=${q}`; // cambia numero WhatsApp
    const mail = `mailto:info@tuodominio.it?subject=${encodeURIComponent("Richiesta auto: " + car.title)}&body=${q}`;

    return `
      <article class="card car-card">
        <img class="car-img" src="${car.img}" alt="${car.title}" loading="lazy" />
        <div class="car-body">
          <div class="meta">
            <span>${car.brand}</span> • <span>${car.year}</span> • <span>${car.fuel}</span> • <span>${fmtKm(car.km)}</span>
          </div>
          <h3 class="h3" style="margin:10px 0 8px">${car.title}</h3>
          <div class="price">${fmtPrice(car.price)}</div>
          <div class="badges">
            <span class="badge">${car.location}</span>
            <span class="badge">ID: ${car.id}</span>
          </div>
          <p class="muted small" style="margin:10px 0 12px">${car.notes || ""}</p>
          <div style="display:flex; gap:10px; flex-wrap:wrap">
            <a class="btn small" href="${wa}" target="_blank" rel="noopener">WhatsApp</a>
            <a class="btn small ghost" href="${mail}">Email</a>
            <a class="btn small ghost" href="contatti.html#richiesta">Form</a>
          </div>
        </div>
      </article>
    `;
  }

  function render(elId, cars) {
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = cars.map(carCard).join("");
  }

  function uniqBrands(cars) {
    return [...new Set(cars.map(c => c.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  }

  async function initHome() {
    setYear();
    const cars = await loadCars();
    const featured = cars.filter(c => c.featured).slice(0, 3);
    const latest = [...cars].slice(0, 6);
    render("featured", featured);
    render("latest", latest);
  }

  async function initCatalog() {
    setYear();
    const cars = await loadCars();

    const brandSel = document.getElementById("brand");
    uniqBrands(cars).forEach(b => {
      const opt = document.createElement("option");
      opt.value = b;
      opt.textContent = b;
      brandSel.appendChild(opt);
    });

    const q = document.getElementById("q");
    const maxPrice = document.getElementById("maxPrice");
    const maxKm = document.getElementById("maxKm");
    const empty = document.getElementById("empty");

    const apply = () => {
      const query = (q.value || "").trim().toLowerCase();
      const brand = brandSel.value;
      const p = Number(maxPrice.value || 0);
      const k = Number(maxKm.value || 0);

      const filtered = cars.filter(c => {
        const hay = `${c.title} ${c.brand} ${c.fuel} ${c.year}`.toLowerCase();
        if (query && !hay.includes(query)) return false;
        if (brand && c.brand !== brand) return false;
        if (p && c.price > p) return false;
        if (k && c.km > k) return false;
        return true;
      });

      render("catalog", filtered);
      empty.style.display = filtered.length ? "none" : "block";
    };

    document.getElementById("apply").addEventListener("click", apply);
    document.getElementById("reset").addEventListener("click", () => {
      q.value = "";
      brandSel.value = "";
      maxPrice.value = "";
      maxKm.value = "";
      apply();
    });

    [q, maxPrice, maxKm].forEach(el => el.addEventListener("keydown", (e) => {
      if (e.key === "Enter") apply();
    }));

    apply();
  }

  return { initHome, initCatalog };
})();
