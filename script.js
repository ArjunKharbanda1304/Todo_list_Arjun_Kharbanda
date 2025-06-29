// Global variables
let tasks = JSON.parse(localStorage.getItem("todoTasks")) || []
let currentFilter = "todo"
let currentUser = null

// Initialize app
document.addEventListener("DOMContentLoaded", async () => {
  // Check if user is logged in
  const userData = localStorage.getItem("taskflowUser")
  if (!userData) {
    window.location.href = "index.html"
    return
  }

  currentUser = JSON.parse(userData)

  // Set user info in navbar
  document.getElementById("userName").textContent = currentUser.name
  document.getElementById("userAvatar").src =
    `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${encodeURIComponent(currentUser.name)}`

  // Load initial data if no tasks exist
  if (tasks.length === 0) {
    await loadInitialTasks()
  }

  renderTasks()
  updateCounts()
})

// Load initial dummy tasks from API
async function loadInitialTasks() {
  try {
    const response = await fetch("https://dummyjson.com/todos")
    const data = await response.json()

    // Transform API data to our task structure
    const initialTasks = data.todos.slice(0, 10).map((apiTodo) => ({
      id: Date.now() + Math.random(), // Ensure unique IDs
      text: apiTodo.todo,
      status: "todo", // All start as todo regardless of API completed status
      createdAt: new Date(),
      lastModified: new Date(),
    }))

    tasks = initialTasks
    saveTasks()
    showToast("Welcome! Initial tasks loaded from API.")
  } catch (error) {
    console.error("Failed to load initial tasks:", error)
    showToast("Welcome to TaskFlow! Start by adding your first task.")
  }
}

// Add new task
function addTask(event) {
  event.preventDefault()

  const taskInput = document.getElementById("taskInput")
  const taskText = taskInput.value.trim()

  if (taskText === "") return

  const newTask = {
    id: Date.now(),
    text: taskText,
    status: "todo",
    createdAt: new Date(),
    lastModified: new Date(),
  }

  tasks.push(newTask)
  saveTasks()
  taskInput.value = ""

  renderTasks()
  updateCounts()
  showToast("Task added successfully!")
}

// Filter tasks
function filterTasks(filter) {
  currentFilter = filter

  // Update active button
  document.querySelectorAll(".control-btn").forEach((btn) => {
    btn.classList.remove("active")
  })
  document.querySelector(`[data-filter="${filter}"]`).classList.add("active")

  renderTasks()
}

// Render tasks based on current filter and search
function renderTasks() {
  const taskList = document.getElementById("taskList")
  const searchTerm = document.getElementById("searchInput").value.toLowerCase()

  let filteredTasks = tasks.filter((task) => task.status === currentFilter)

  // Apply search filter
  if (searchTerm) {
    filteredTasks = filteredTasks.filter((task) => task.text.toLowerCase().includes(searchTerm))
  }

  if (filteredTasks.length === 0) {
    const emptyMessage = searchTerm
      ? `No ${currentFilter} tasks found matching "${searchTerm}".`
      : `No ${currentFilter} tasks yet.`

    taskList.innerHTML = `
            <div class="empty-state">
                <p>${emptyMessage}</p>
                ${currentFilter === "todo" && !searchTerm ? "<p>Add a new task above to get started!</p>" : ""}
            </div>
        `
    return
  }

  taskList.innerHTML = filteredTasks
    .map(
      (task) => `
        <div class="task-item">
            <div class="task-content">
                <div class="task-text">${escapeHtml(task.text)}</div>
                <div class="task-timestamp">
                    Last modified at:<br>
                    ${formatDate(task.lastModified)}
                </div>
            </div>
            <div class="task-actions">
                ${
                  task.status === "todo"
                    ? `
                    <button class="action-btn complete-btn" onclick="markAsCompleted(${task.id})">
                        Mark it as completed
                    </button>
                `
                    : ""
                }
                ${
                  task.status === "archived"
                    ? `
                    <button class="action-btn unarchive-btn" onclick="unarchiveTask(${task.id})">
                        📤 Unarchive
                    </button>
                `
                    : `
                    <button class="action-btn archive-btn" onclick="archiveTask(${task.id})">
                        📁 Archive
                    </button>
                `
                }
                <button class="action-btn delete-btn" onclick="deleteTask(${task.id})">
                    🗑️ Delete
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Mark task as completed
function markAsCompleted(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.status = "completed"
    task.lastModified = new Date()
    saveTasks()
    renderTasks()
    updateCounts()
    showToast("Task moved to Completed.")
  }
}

// Archive task
function archiveTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.status = "archived"
    task.lastModified = new Date()
    saveTasks()
    renderTasks()
    updateCounts()
    showToast("Task moved to Archived.")
  }
}

// Unarchive task
function unarchiveTask(taskId) {
  const task = tasks.find((t) => t.id === taskId)
  if (task) {
    task.status = "todo"
    task.lastModified = new Date()
    saveTasks()
    renderTasks()
    updateCounts()
    showToast("Task moved back to Todo.")
  }
}

// Delete task
function deleteTask(taskId) {
  if (confirm("Are you sure you want to delete this task? This action cannot be undone.")) {
    tasks = tasks.filter((t) => t.id !== taskId)
    saveTasks()
    renderTasks()
    updateCounts()
    showToast("Task deleted successfully.")
  }
}

// Search tasks
function searchTasks() {
  const searchInput = document.getElementById("searchInput")
  const clearBtn = document.getElementById("clearSearchBtn")

  if (searchInput.value.trim()) {
    clearBtn.style.display = "block"
  } else {
    clearBtn.style.display = "none"
  }

  renderTasks()
}

// Clear search
function clearSearch() {
  document.getElementById("searchInput").value = ""
  document.getElementById("clearSearchBtn").style.display = "none"
  renderTasks()
}

// Update task counts
function updateCounts() {
  const todoCounts = tasks.filter((t) => t.status === "todo").length
  const completedCounts = tasks.filter((t) => t.status === "completed").length
  const archivedCounts = tasks.filter((t) => t.status === "archived").length

  document.getElementById("todo-count").textContent = todoCounts
  document.getElementById("completed-count").textContent = completedCounts
  document.getElementById("archived-count").textContent = archivedCounts
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.classList.add("show")

  setTimeout(() => {
    toast.classList.remove("show")
  }, 3000)
}

// Save tasks to localStorage
function saveTasks() {
  localStorage.setItem("todoTasks", JSON.stringify(tasks))
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem("taskflowUser")
    localStorage.removeItem("todoTasks")
    window.location.href = "index.html"
  }
}

// Utility functions
function formatDate(date) {
  const d = new Date(date)
  return d.toLocaleString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Keyboard shortcuts
document.addEventListener("keydown", (event) => {
  // Enter key to focus on input when not already focused
  if (event.key === "Enter" && document.activeElement !== document.getElementById("taskInput")) {
    document.getElementById("taskInput").focus()
  }
})
