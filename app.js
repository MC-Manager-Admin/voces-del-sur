(function () {
  const cfg = window.VDS_CONFIG;
  const sb = window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY);

  const venido = (a) => a.nacio_rg === false;

  const STEPS = [
    { id: "nacio_rg", type: "single", q: "¿Naciste en Río Gallegos?",
      options: [["Sí, nací acá", true], ["No, nací en otro lugar", false]] },
    { id: "origen", type: "text", q: "¿De qué ciudad o provincia sos?", hint: "Ej: Buenos Aires, Comodoro Rivadavia, Chile…", show: venido, max: 80 },
    { id: "edad_llegada", type: "single", q: "¿A qué edad llegaste a Río Gallegos?", show: venido,
      options: ["Bebé o antes de los 5 años", "Entre 5 y 12 años", "Entre 13 y 17 años", "Entre 18 y 30 años", "Después de los 30"] },
    { id: "trajeron_de_chico", type: "single", q: "¿Te trajeron de chico/a o viniste por decisión propia?", show: venido,
      options: ["Me trajeron mi familia", "Vine por decisión propia"] },
    { id: "motivo_llegada", type: "single", q: "¿Cuál fue el motivo principal de la mudanza?", show: venido,
      options: ["Trabajo", "Estudio", "Familia", "Petróleo, minería o industria", "Estado o fuerzas de seguridad", "Calidad de vida", "Otro"] },
    { id: "anios_en_ciudad", type: "single", q: "¿Hace cuánto vivís en Río Gallegos?",
      options: ["Menos de 1 año", "1 a 5 años", "5 a 10 años", "10 a 20 años", "Más de 20 años"] },
    { id: "gusta_ciudad", type: "scale", q: "¿Te gusta la ciudad?", low: "Nada", high: "Muchísimo" },
    { id: "lo_mejor", type: "multi", max: 3, q: "¿Qué es lo que más te gusta de Río Gallegos?", hint: "Elegí hasta 3.",
      options: ["La tranquilidad", "La gente", "El paisaje y la costa", "La seguridad", "Las oportunidades laborales", "La naturaleza cerca", "La vida cultural", "El costo de vida"] },
    { id: "lo_peor", type: "multi", max: 3, q: "¿Qué es lo que menos te gusta?", hint: "Elegí hasta 3.",
      options: ["El viento", "El frío y el clima", "La distancia con otras ciudades", "El costo de vida", "Pocas oportunidades", "Poca oferta de ocio y cultura", "Transporte y servicios", "El estado de las calles"] },
    { id: "se_siente_riogalleguense", type: "scale", q: "¿Cuánto te sentís riogalleguense?", low: "Nada", high: "Totalmente" },
    { id: "futuro", type: "single", q: "¿Pensás seguir viviendo acá?",
      options: ["Quiero quedarme", "Quiero irme", "Todavía no lo sé"] },
    { id: "grupo_edad", type: "single", q: "¿En qué rango de edad estás?",
      options: ["Menos de 18", "18 a 25", "26 a 35", "36 a 50", "Más de 50"] },
    { id: "comentario", type: "text", multiline: true, optional: true, max: 500,
      q: "¿Querés contarnos algo más?", hint: "Opcional. Una anécdota, una opinión, lo que quieras." }
  ];

  const answers = {};
  let idx = 0;
  const $ = (id) => document.getElementById(id);

  const visible = () => STEPS.filter((s) => !s.show || s.show(answers));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  function render() {
    const list = visible();
    const s = list[idx];
    $("bar").style.width = Math.round((idx / list.length) * 100) + "%";
    $("label").textContent = "Pregunta " + (idx + 1) + " de " + list.length;
    $("err").textContent = "";
    $("back").style.visibility = idx === 0 ? "hidden" : "visible";
    $("next").textContent = idx === list.length - 1 ? "Enviar respuestas" : "Siguiente →";

    let html = '<h2 class="q">' + esc(s.q) + "</h2>" + (s.hint ? '<div class="hint">' + esc(s.hint) + "</div>" : "");
    const cur = answers[s.id];

    if (s.type === "single") {
      html += '<div class="opts">' + s.options.map((o, i) => {
        const val = Array.isArray(o) ? o[1] : o, lab = Array.isArray(o) ? o[0] : o;
        return '<button type="button" class="opt' + (cur === val ? " sel" : "") + '" data-i="' + i + '">' + esc(lab) + "</button>";
      }).join("") + "</div>";
    } else if (s.type === "multi") {
      const c = cur || [];
      html += '<div class="opts">' + s.options.map((o, i) =>
        '<button type="button" class="opt' + (c.includes(o) ? " sel" : "") + '" data-i="' + i + '">' + esc(o) + "</button>").join("") + "</div>";
    } else if (s.type === "scale") {
      html += '<div class="scale">' + [1, 2, 3, 4, 5].map((n) =>
        '<button type="button" class="opt' + (cur === n ? " sel" : "") + '" data-n="' + n + '">' + n + "</button>").join("") +
        '</div><div class="scale-legend"><span>1 · ' + esc(s.low) + "</span><span>5 · " + esc(s.high) + "</span></div>";
    } else {
      html += s.multiline
        ? '<textarea id="txt" maxlength="' + s.max + '">' + esc(cur || "") + "</textarea>"
        : '<input id="txt" type="text" maxlength="' + s.max + '" value="' + esc(cur || "") + '">';
    }
    $("step").innerHTML = html;

    $("step").querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
      if (s.type === "single") {
        const o = s.options[+b.dataset.i];
        answers[s.id] = Array.isArray(o) ? o[1] : o;
        render();
      } else if (s.type === "scale") {
        answers[s.id] = +b.dataset.n;
        render();
      } else {
        const o = s.options[+b.dataset.i], c = answers[s.id] || [];
        if (c.includes(o)) answers[s.id] = c.filter((x) => x !== o);
        else if (c.length < s.max) answers[s.id] = c.concat(o);
        else $("err").textContent = "Podés elegir hasta " + s.max + " opciones.";
        if (c.length < s.max || c.includes(o)) render();
      }
    }));
  }

  function validate(s) {
    if (s.type === "text") {
      const el = $("txt");
      const v = el.value.trim();
      answers[s.id] = v || undefined;
      if (!v && !s.optional) return "Completá este campo para continuar.";
      return null;
    }
    const v = answers[s.id];
    if (s.type === "multi") return v && v.length ? null : "Elegí al menos una opción.";
    return v === undefined ? "Elegí una opción para continuar." : null;
  }

  async function submit() {
    $("next").disabled = true;
    $("next").textContent = "Enviando…";
    const row = {
      nacio_rg: answers.nacio_rg,
      origen: answers.origen || null,
      edad_llegada: answers.edad_llegada || null,
      trajeron_de_chico: answers.trajeron_de_chico || null,
      motivo_llegada: answers.motivo_llegada || null,
      anios_en_ciudad: answers.anios_en_ciudad,
      gusta_ciudad: answers.gusta_ciudad,
      lo_mejor: answers.lo_mejor,
      lo_peor: answers.lo_peor,
      se_siente_riogalleguense: answers.se_siente_riogalleguense,
      futuro: answers.futuro,
      grupo_edad: answers.grupo_edad,
      comentario: answers.comentario || null
    };
    const { error } = await sb.from("respuestas").insert(row);
    if (error) {
      $("err").textContent = "No se pudo enviar. Probá de nuevo en unos segundos.";
      $("next").disabled = false;
      $("next").textContent = "Enviar respuestas";
      console.error(error);
      return;
    }
    done();
  }

  function done() {
    let left = 12;
    $("app").innerHTML = '<div class="thanks"><div class="big">🎙️</div><h2 class="q">¡Gracias por tu voz!</h2>' +
      '<p>Tu respuesta ya forma parte del estudio.</p>' +
      '<p><button class="btn primary" id="again">Responder otra vez</button></p>' +
      '<p class="hint">La encuesta se reinicia sola en <b id="cd">' + left + '</b> s para la siguiente persona.</p>' +
      '<p><a href="resultados.html">Ver resultados</a></p></div>';
    const restart = () => location.reload();
    $("again").addEventListener("click", restart);
    const t = setInterval(() => {
      left--;
      const el = $("cd");
      if (el) el.textContent = left;
      if (left <= 0) { clearInterval(t); restart(); }
    }, 1000);
  }

  $("next").addEventListener("click", () => {
    if ($("hp").value) return; // honeypot anti-bots
    const list = visible();
    const e = validate(list[idx]);
    if (e) { $("err").textContent = e; return; }
    if (idx === list.length - 1) submit(); else { idx++; render(); }
  });
  $("back").addEventListener("click", () => { if (idx > 0) { idx--; render(); } });

  render();
})();
