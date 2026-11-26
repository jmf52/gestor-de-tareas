const STORAGE_KEY = "gestorAcademicoTasks";
const $ = (selector) => document.querySelector(selector);

const taskList = $("#taskList");
const emptyState = $("#emptyState");
const dialog = $("#taskDialog");
const form = $("#taskForm");

// Fotografías temáticas por categoría (Unsplash)
const CATEGORY_META = {
  code: {
    label: "💻 Programación",
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80"
  },
  science: {
    label: "🔬 Ciencias",
    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80"
  },
  reading: {
    label: "📚 Lectura / Ensayo",
    image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=600&q=80"
  },
  project: {
    label: "🎨 Proyecto",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80"
  },
  exam: {
    label: "📝 Examen",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80"
  },
  general: {
    label: "📌 General",
    image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=600&q=80"
  }
};

let tasks = loadTasks();
let currentFilter = "all";
let searchTerm = "";

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // Tareas de bienvenida la primera vez
      const starter = [
        {
          id: "demo-1",
          title: "Entregar prototipo de aplicación web",
          category: "code",
          description: "Revisar diseño responsivo, subir repositorio y preparar presentación final.",
          date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
          priority: "high",
          status: "progress",
          createdAt: Date.now()
        },
        {
          id: "demo-2",
          title: "Resumen de lectura: Metodología de la investigación",
          category: "reading",
          description: "Elaborar mapa conceptual de los capítulos 3 y 4.",
          date: new Date(Date.now() + 86400000 * 6).toISOString().split("T")[0],
          priority: "medium",
          status: "pending",
          createdAt: Date.now() - 1000
        }
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(starter));
      return starter;
    }
    const saved = JSON.parse(raw);
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function formatDate(date) {
  if (!date) return "Sin fecha límite";
  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? "Fecha no válida" :
    parsed.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
}

function statusLabel(status) {
  return ({ pending: "Pendiente", progress: "En progreso", done: "Completada" })[status] || "Pendiente";
}

function priorityLabel(priority) {
  return ({ high: "Alta", medium: "Media", low: "Baja" })[priority] || "Media";
}

function render() {
  const visible = tasks.filter(task => {
    const catInfo = CATEGORY_META[task.category] || CATEGORY_META.general;
    const matchesFilter = currentFilter === "all" || task.status === currentFilter;
    const text = `${task.title} ${task.description || ""} ${catInfo.label}`.toLowerCase();
    return matchesFilter && text.includes(searchTerm);
  });

  const sort = $("#sortSelect").value;
  visible.sort((a, b) => {
    if (sort === "date") return (a.date || "9999").localeCompare(b.date || "9999");
    if (sort === "priority") return ({ high: 0, medium: 1, low: 2 })[a.priority] - ({ high: 0, medium: 1, low: 2 })[b.priority];
    return b.createdAt - a.createdAt;
  });

  taskList.innerHTML = visible.map(task => {
    const cat = CATEGORY_META[task.category] || CATEGORY_META.general;
    return `
      <article class="task-card ${task.status === "done" ? "is-done" : ""}">
        <div class="task-cover">
          <img src="${cat.image}" alt="${escapeHTML(cat.label)}" loading="lazy">
          <div class="task-cover-overlay">
            <span class="category-badge">${cat.label}</span>
          </div>
        </div>
        <div class="task-body">
          <div class="task-pills">
            <span class="pill priority-${task.priority}">Prioridad ${priorityLabel(task.priority)}</span>
            <span class="pill status-${task.status}">${statusLabel(task.status)}</span>
          </div>
          <h3 class="task-title">${escapeHTML(task.title)}</h3>
          <p class="task-description">${task.description ? escapeHTML(task.description) : "Sin descripción adicional."}</p>
          <div class="task-footer">
            <span class="task-date">📅 ${formatDate(task.date)}</span>
            <div class="task-actions">
              <button class="icon-btn" data-action="edit" data-id="${task.id}" aria-label="Editar ${escapeHTML(task.title)}" title="Editar">✎</button>
              <button class="icon-btn" data-action="cycle" data-id="${task.id}" aria-label="Cambiar estado" title="Avanzar estado">↻</button>
              <button class="icon-btn delete-btn" data-action="delete" data-id="${task.id}" aria-label="Eliminar ${escapeHTML(task.title)}" title="Eliminar">⌫</button>
            </div>
          </div>
        </div>
      </article>
    `;
  }).join("");

  emptyState.classList.toggle("visible", visible.length === 0);
  taskList.style.display = visible.length === 0 ? "none" : "grid";

  const total = tasks.length;
  const done = tasks.filter(t => t.status === "done").length;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  $("#totalCount").textContent = total;
  $("#pendingCount").textContent = tasks.filter(t => t.status === "pending").length;
  $("#progressCount").textContent = tasks.filter(t => t.status === "progress").length;
  $("#doneCount").textContent = done;

  $("#progressPercentText").textContent = `${percent}% completado`;
  $("#progressBarFill").style.width = `${percent}%`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2300);
}

function openNewTask() {
  form.reset();
  $("#taskId").value = "";
  $("#taskCategory").value = "code";
  $("#dialogTitle").textContent = "Nueva tarea";
  dialog.showModal();
  $("#taskTitle").focus();
}

function openEditTask(id) {
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  $("#taskId").value = task.id;
  $("#taskTitle").value = task.title;
  $("#taskCategory").value = task.category || "general";
  $("#taskDescription").value = task.description || "";
  $("#taskDate").value = task.date || "";
  $("#taskPriority").value = task.priority;
  $("#taskStatus").value = task.status;
  $("#dialogTitle").textContent = "Editar tarea";
  dialog.showModal();
}

$("#newTaskBtn").addEventListener("click", openNewTask);
$("#emptyNewBtn").addEventListener("click", openNewTask);
$("#closeDialog").addEventListener("click", () => dialog.close());
$("#cancelDialog").addEventListener("click", () => dialog.close());

form.addEventListener("submit", event => {
  event.preventDefault();
  const id = $("#taskId").value;
  const title = $("#taskTitle").value.trim();
  if (!title) return;

  const data = {
    title,
    category: $("#taskCategory").value,
    description: $("#taskDescription").value.trim(),
    date: $("#taskDate").value,
    priority: $("#taskPriority").value,
    status: $("#taskStatus").value
  };

  if (id) {
    tasks = tasks.map(task => task.id === id ? { ...task, ...data } : task);
    showToast("Tarea actualizada correctamente");
  } else {
    tasks.unshift({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      ...data,
      createdAt: Date.now()
    });
    showToast("Tarea creada correctamente");
  }
  saveTasks();
  render();
  dialog.close();
});

taskList.addEventListener("click", event => {
  const button = event.target.closest("button[data-action]");
  if (!button) return;
  const { action, id } = button.dataset;
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (action === "edit") openEditTask(id);
  if (action === "delete") {
    if (!confirm(`¿Deseas eliminar la tarea "${task.title}"?`)) return;
    tasks = tasks.filter(item => item.id !== id);
    saveTasks();
    render();
    showToast("Tarea eliminada");
  }
  if (action === "cycle") {
    const next = ({ pending: "progress", progress: "done", done: "pending" })[task.status];
    task.status = next;
    saveTasks();
    render();
    showToast(`Estado cambiado a: ${statusLabel(next)}`);
  }
});

document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    currentFilter = button.dataset.filter;
    document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
    render();
  });
});

$("#searchInput").addEventListener("input", event => {
  searchTerm = event.target.value.trim().toLowerCase();
  render();
});

$("#sortSelect").addEventListener("change", render);

render();