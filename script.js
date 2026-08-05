const STORAGE_KEYS = {
  subjects: "attendwise_subjects",
  target: "attendwise_target",
  theme: "attendwise_theme"
};

const demoSubjects = [
  { id: crypto.randomUUID(), name: "Data Structures", total: 28, attended: 24 },
  { id: crypto.randomUUID(), name: "Database Systems", total: 25, attended: 18 },
  { id: crypto.randomUUID(), name: "Computer Networks", total: 22, attended: 15 },
  { id: crypto.randomUUID(), name: "Software Engineering", total: 20, attended: 17 }
];

let subjects = loadSubjects();
let deleteTargetId = null;

const elements = {
  form: document.getElementById("subjectForm"),
  subjectId: document.getElementById("subjectId"),
  subjectName: document.getElementById("subjectName"),
  totalClasses: document.getElementById("totalClasses"),
  attendedClasses: document.getElementById("attendedClasses"),
  minimumAttendance: document.getElementById("minimumAttendance"),
  subjectsGrid: document.getElementById("subjectsGrid"),
  emptyState: document.getElementById("emptyState"),
  totalSubjects: document.getElementById("totalSubjects"),
  safeSubjects: document.getElementById("safeSubjects"),
  riskSubjects: document.getElementById("riskSubjects"),
  overallAttendance: document.getElementById("overallAttendance"),
  formTitle: document.getElementById("formTitle"),
  submitButtonText: document.getElementById("submitButtonText"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  resetDataBtn: document.getElementById("resetDataBtn"),
  notificationBtn: document.getElementById("notificationBtn"),
  themeToggle: document.getElementById("themeToggle"),
  themeIcon: document.getElementById("themeIcon"),
  toast: document.getElementById("toast"),
  confirmModal: document.getElementById("confirmModal"),
  cancelDeleteBtn: document.getElementById("cancelDeleteBtn"),
  confirmDeleteBtn: document.getElementById("confirmDeleteBtn"),
  nameError: document.getElementById("nameError"),
  totalError: document.getElementById("totalError"),
  attendedError: document.getElementById("attendedError")
};

initialize();

function initialize() {
  const savedTarget = Number(localStorage.getItem(STORAGE_KEYS.target));
  elements.minimumAttendance.value = isValidTarget(savedTarget) ? savedTarget : 75;

  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
  if (savedTheme === "dark") {
    document.documentElement.dataset.theme = "dark";
  }
  updateThemeIcon();

  elements.form.addEventListener("submit", handleFormSubmit);
  elements.minimumAttendance.addEventListener("change", handleTargetChange);
  elements.cancelEditBtn.addEventListener("click", resetForm);
  elements.resetDataBtn.addEventListener("click", resetDemoData);
  elements.notificationBtn.addEventListener("click", enableNotifications);
  elements.themeToggle.addEventListener("click", toggleTheme);
  elements.cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  elements.confirmDeleteBtn.addEventListener("click", confirmDelete);
  elements.confirmModal.addEventListener("click", event => {
    if (event.target === elements.confirmModal) closeDeleteModal();
  });

  render();
}

function loadSubjects() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.subjects));
    return Array.isArray(saved) && saved.length ? saved : [...demoSubjects];
  } catch {
    return [...demoSubjects];
  }
}

function saveSubjects() {
  localStorage.setItem(STORAGE_KEYS.subjects, JSON.stringify(subjects));
}

function getTarget() {
  const target = Number(elements.minimumAttendance.value);
  return isValidTarget(target) ? target : 75;
}

function isValidTarget(value) {
  return Number.isFinite(value) && value >= 1 && value <= 100;
}

function calculatePercentage(subject) {
  if (subject.total === 0) return 0;
  return (subject.attended / subject.total) * 100;
}

function getStatus(percentage, target) {
  if (percentage >= target) {
    return {
      label: "SAFE",
      color: "var(--green)",
      background: "var(--green-bg)",
      icon: "✓"
    };
  }

  if (percentage >= Math.max(0, target - 10)) {
    return {
      label: "WARNING",
      color: "var(--yellow)",
      background: "var(--yellow-bg)",
      icon: "⚠"
    };
  }

  return {
    label: "SHORTAGE",
    color: "var(--red)",
    background: "var(--red-bg)",
    icon: "!"
  };
}

function classesNeeded(subject, target) {
  const targetRatio = target / 100;

  if (targetRatio >= 1) {
    return subject.attended === subject.total ? 0 : Infinity;
  }

  const currentPercentage = calculatePercentage(subject);
  if (currentPercentage >= target) return 0;

  return Math.ceil(
    (targetRatio * subject.total - subject.attended) / (1 - targetRatio)
  );
}

function render() {
  renderSubjects();
  renderSummary();
  saveSubjects();
}

function renderSubjects() {
  const target = getTarget();
  elements.subjectsGrid.innerHTML = "";

  elements.emptyState.classList.toggle("hidden", subjects.length > 0);
  elements.resetDataBtn.classList.toggle("hidden", subjects.length === 0);

  subjects.forEach((subject, index) => {
    const percentage = calculatePercentage(subject);
    const status = getStatus(percentage, target);
    const needed = classesNeeded(subject, target);

    const predictionText = needed === 0
      ? `You are on track. You can miss ${classesCanMiss(subject, target)} upcoming class(es) and remain at or above ${target}%.`
      : Number.isFinite(needed)
        ? `Attend the next ${needed} class(es) continuously to reach ${target}%.`
        : `A 100% target cannot be recovered after missing a class.`;

    const card = document.createElement("article");
    card.className = "subject-card";
    card.style.setProperty("--status-color", status.color);
    card.style.setProperty("--status-bg", status.background);
    card.style.animationDelay = `${index * 55}ms`;

    card.innerHTML = `
      <div class="card-header">
        <h3>${escapeHtml(subject.name)}</h3>
        <span class="status-badge">${status.label}</span>
      </div>

      <div class="percentage-row">
        <strong>${percentage.toFixed(1)}%</strong>
        <span>Target: ${target}%</span>
      </div>

      <div class="progress-track" aria-label="${escapeHtml(subject.name)} attendance progress">
        <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%"></div>
      </div>

      <div class="class-stats">
        <div class="stat-box">
          <small>ATTENDED</small>
          <strong>${subject.attended} classes</strong>
        </div>
        <div class="stat-box">
          <small>TOTAL</small>
          <strong>${subject.total} classes</strong>
        </div>
      </div>

      <div class="prediction">
        <strong>${status.icon}</strong>
        <span>${predictionText}</span>
      </div>

      <div class="card-actions">
        <button type="button" data-action="edit" data-id="${subject.id}">✎ Edit</button>
        <button type="button" class="delete-action" data-action="delete" data-id="${subject.id}">⌫ Delete</button>
      </div>
    `;

    card.querySelector('[data-action="edit"]').addEventListener("click", () => editSubject(subject.id));
    card.querySelector('[data-action="delete"]').addEventListener("click", () => openDeleteModal(subject.id));

    elements.subjectsGrid.appendChild(card);
  });
}

function renderSummary() {
  const target = getTarget();
  const safeCount = subjects.filter(subject => calculatePercentage(subject) >= target).length;
  const riskCount = subjects.length - safeCount;
  const totals = subjects.reduce(
    (sum, subject) => ({
      total: sum.total + subject.total,
      attended: sum.attended + subject.attended
    }),
    { total: 0, attended: 0 }
  );
  const overall = totals.total ? (totals.attended / totals.total) * 100 : 0;

  elements.totalSubjects.textContent = subjects.length;
  elements.safeSubjects.textContent = safeCount;
  elements.riskSubjects.textContent = riskCount;
  elements.overallAttendance.textContent = `${overall.toFixed(1)}%`;
}

function classesCanMiss(subject, target) {
  if (target <= 0) return Infinity;

  const targetRatio = target / 100;
  return Math.max(
    0,
    Math.floor(subject.attended / targetRatio - subject.total)
  );
}

function handleFormSubmit(event) {
  event.preventDefault();
  clearErrors();

  const id = elements.subjectId.value;
  const name = elements.subjectName.value.trim();
  const total = Number(elements.totalClasses.value);
  const attended = Number(elements.attendedClasses.value);

  if (!validateForm(name, total, attended)) return;

  if (id) {
    subjects = subjects.map(subject =>
      subject.id === id ? { ...subject, name, total, attended } : subject
    );
    showToast("Subject updated successfully.");
  } else {
    subjects.unshift({
      id: crypto.randomUUID(),
      name,
      total,
      attended
    });
    showToast("Subject added successfully.");
  }

  resetForm();
  render();
  sendRiskNotification();
}

function validateForm(name, total, attended) {
  let valid = true;

  if (!name) {
    elements.nameError.textContent = "Please enter a subject name.";
    valid = false;
  }

  if (!Number.isInteger(total) || total < 0) {
    elements.totalError.textContent = "Enter a valid whole number.";
    valid = false;
  }

  if (!Number.isInteger(attended) || attended < 0) {
    elements.attendedError.textContent = "Enter a valid whole number.";
    valid = false;
  } else if (Number.isInteger(total) && attended > total) {
    elements.attendedError.textContent = "Attended classes cannot exceed total classes.";
    valid = false;
  }

  return valid;
}

function clearErrors() {
  elements.nameError.textContent = "";
  elements.totalError.textContent = "";
  elements.attendedError.textContent = "";
}

function editSubject(id) {
  const subject = subjects.find(item => item.id === id);
  if (!subject) return;

  elements.subjectId.value = subject.id;
  elements.subjectName.value = subject.name;
  elements.totalClasses.value = subject.total;
  elements.attendedClasses.value = subject.attended;
  elements.formTitle.textContent = "Edit subject";
  elements.submitButtonText.textContent = "Update Subject";
  elements.cancelEditBtn.classList.remove("hidden");
  elements.subjectName.focus();

  if (window.innerWidth < 920) {
    document.querySelector(".form-panel").scrollIntoView({ behavior: "smooth" });
  }
}

function resetForm() {
  elements.form.reset();
  elements.subjectId.value = "";
  elements.formTitle.textContent = "Add a subject";
  elements.submitButtonText.textContent = "Add Subject";
  elements.cancelEditBtn.classList.add("hidden");
  clearErrors();
}

function openDeleteModal(id) {
  deleteTargetId = id;
  elements.confirmModal.classList.remove("hidden");
}

function closeDeleteModal() {
  deleteTargetId = null;
  elements.confirmModal.classList.add("hidden");
}

function confirmDelete() {
  if (!deleteTargetId) return;

  subjects = subjects.filter(subject => subject.id !== deleteTargetId);
  closeDeleteModal();
  resetForm();
  render();
  showToast("Subject deleted.");
}

function handleTargetChange() {
  let target = Number(elements.minimumAttendance.value);

  if (!isValidTarget(target)) {
    target = 75;
    elements.minimumAttendance.value = target;
    showToast("Target must be between 1% and 100%.");
  }

  localStorage.setItem(STORAGE_KEYS.target, String(target));
  render();
  sendRiskNotification();
}

function resetDemoData() {
  subjects = [...demoSubjects].map(subject => ({
    ...subject,
    id: crypto.randomUUID()
  }));
  resetForm();
  render();
  showToast("Demo data restored.");
}

async function enableNotifications() {
  if (!("Notification" in window)) {
    showToast("Notifications are not supported in this browser.");
    return;
  }

  if (Notification.permission === "granted") {
    showToast("Attendance reminders are already enabled.");
    sendRiskNotification(true);
    return;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    showToast("Attendance reminders enabled.");
    sendRiskNotification(true);
  } else {
    showToast("Notification permission was not granted.");
  }
}

function sendRiskNotification(force = false) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const target = getTarget();
  const risky = subjects.filter(subject => calculatePercentage(subject) < target);

  if (risky.length > 0) {
    new Notification("AttendWise shortage alert", {
      body: `${risky.length} subject${risky.length > 1 ? "s are" : " is"} below your ${target}% target: ${risky.map(s => s.name).join(", ")}.`,
      icon: "data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>"
    });
  } else if (force) {
    new Notification("AttendWise", {
      body: `Great work! All subjects are at or above your ${target}% target.`
    });
  }
}

function toggleTheme() {
  const isDark = document.documentElement.dataset.theme === "dark";
  document.documentElement.dataset.theme = isDark ? "light" : "dark";
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? "light" : "dark");
  updateThemeIcon();
}

function updateThemeIcon() {
  const isDark = document.documentElement.dataset.theme === "dark";
  elements.themeIcon.textContent = isDark ? "☀️" : "🌙";
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    elements.toast.classList.remove("show");
  }, 2400);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[character]));
}
