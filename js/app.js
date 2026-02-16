let currentTemplate = 1;

/* =============================
   FIELD CREATION
============================= */
function createField(label = "", value = "") {
  const div = document.createElement("div");
  div.className = "field";
  div.draggable = true;

  div.innerHTML = `
    <input placeholder="Label" value="${label}">
    <input placeholder="Value" value="${value}">
    <button onclick="this.parentElement.remove()">X</button>
  `;

  addDragEvents(div);
  return div;
}

function addField(section, label = "", value = "") {
  const container = document.getElementById(section + "Fields");
  container.appendChild(createField(label, value));
}

/* =============================
   DEFAULT DATA
============================= */
function loadDefaults() {
  addField("personal", "Name", "");
  addField("personal", "Date of Birth", "");
  addField("personal", "Time of Birth", "");
  addField("personal", "Complexion", "");
  addField("personal", "Height", "");
  addField("personal", "Education", "");
  addField("personal", "Occupation", "");

  addField("family", "Father", "");
  addField("family", "Father's Occupation", "");
  addField("family", "Mother", "");
  addField("family", "Mother's Occupation", "");
  addField("family", "Brother", "");
  addField("family", "Brother's Occupation", "");
  addField("family", "Sister", "");
  addField("family", "Sister's Occupation", "");

  addField("contact", "Contact Person", "");
  addField("contact", "Phone", "");
  addField("contact", "Address", "");
}

/* =============================
   PREVIEW RENDER
============================= */
function updatePreview() {
  ["personal", "family", "contact"].forEach(section => {
    const preview = document.getElementById(section + "Preview");
    if (!preview) return;

    const fields = document.querySelectorAll(`#${section}Fields .field`);
    let html = "";

    fields.forEach(f => {
      const inputs = f.querySelectorAll("input");
      const label = inputs[0].value.trim();
      const value = inputs[1].value.trim();

      if (label || value) {
        html += `
          <div class="row">
            <strong>${label}</strong>
            <span>${value}</span>
          </div>
        `;
      }
    });

    preview.innerHTML = html;
  });
}

/* =============================
   TEMPLATE SWITCH
============================= */
function changeTemplate(num) {
  currentTemplate = num;

  document.getElementById("templateStyle").href = `css/template${num}.css`;

  fetch(`templates/template${num}.html`)
    .then(res => res.text())
    .then(html => {
      document.getElementById("biodata-container").innerHTML = html;
      updatePreview();
    })
    .catch(() => {
      document.getElementById("biodata-container").innerHTML =
        "<p style='padding:20px'>Template failed to load.</p>";
    });
}

/* =============================
   DRAG & DROP
============================= */
function addDragEvents(el) {
  el.addEventListener("dragstart", () => el.classList.add("dragging"));
  el.addEventListener("dragend", () => el.classList.remove("dragging"));

  const container = el.parentElement;
  if (!container) return;

  container.addEventListener("dragover", e => {
    e.preventDefault();
    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(container, e.clientY);

    if (!dragging) return;

    if (afterElement == null) {
      container.appendChild(dragging);
    } else {
      container.insertBefore(dragging, afterElement);
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".field:not(.dragging)")
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}

/* =============================
   CREATE FIXED EXPORT CLONE
============================= */
function createExportClone() {
  const original = document.querySelector(".page");
  if (!original) {
    alert("Please update preview before downloading.");
    return null;
  }

  const clone = original.cloneNode(true);

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-9999px";
  wrapper.style.top = "0";
  wrapper.style.width = "794px";
  wrapper.style.background = "#fff";
  wrapper.style.zIndex = "-1";

  clone.style.transform = "none";
  clone.style.width = "794px";
  clone.style.maxWidth = "794px";

  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  return { wrapper, clone };
}

/* =============================
   DOWNLOAD PDF (Desktop Layout)
============================= */
function downloadPDF() {
  const exportObj = createExportClone();
  if (!exportObj) return;

  const { wrapper, clone } = exportObj;

  const opt = {
    margin: 0,
    filename: "Biodata.pdf",
    image: { type: "jpeg", quality: 1 },
    html2canvas: {
      scale: 2,
      useCORS: true
    },
    jsPDF: {
      unit: "px",
      format: [794, clone.offsetHeight],
      orientation: "portrait"
    }
  };

  html2pdf()
    .set(opt)
    .from(clone)
    .save()
    .then(() => {
      document.body.removeChild(wrapper);
    });
}

/* =============================
   DOWNLOAD IMAGE (Desktop Layout)
============================= */
function downloadImage() {
  const exportObj = createExportClone();
  if (!exportObj) return;

  const { wrapper, clone } = exportObj;

  html2canvas(clone, {
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    link.download = "Biodata.png";
    link.href = canvas.toDataURL("image/png");
    link.click();

    document.body.removeChild(wrapper);
  });
}

/* =============================
   INIT
============================= */
window.onload = () => {
  loadDefaults();
  changeTemplate(1);
};
