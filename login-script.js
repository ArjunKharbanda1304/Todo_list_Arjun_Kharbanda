// Check if user is already logged in
document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("taskflowUser")
  if (userData) {
    const user = JSON.parse(userData)
    // Verify the user data is still valid
    if (user.name && user.dateOfBirth && isValidAge(user.dateOfBirth)) {
      // Add loading animation before redirect
      showLoadingState()
      setTimeout(() => {
        window.location.href = "app.html"
      }, 1500)
      return
    } else {
      // Clear invalid data
      localStorage.removeItem("taskflowUser")
    }
  }
})

// Handle form submission
document.getElementById("loginForm").addEventListener("submit", (e) => {
  e.preventDefault()

  const fullName = document.getElementById("fullName").value.trim()
  const dateOfBirth = document.getElementById("dateOfBirth").value
  const errorMessage = document.getElementById("errorMessage")
  const verifyBtn = document.getElementById("verifyBtn")

  // Clear previous errors
  errorMessage.classList.remove("show")

  // Validate inputs
  if (!fullName || !dateOfBirth) {
    showError("Please fill in all fields.")
    return
  }

  // Validate name length
  if (fullName.length < 2) {
    showError("Please enter a valid full name.")
    return
  }

  // Validate age
  if (!isValidAge(dateOfBirth)) {
    showError("You must be over 10 years old to access TaskFlow.")
    return
  }

  // Show loading state
  showLoadingState()

  // Simulate processing time for better UX
  setTimeout(() => {
    // Store user data
    const userData = {
      name: fullName,
      dateOfBirth: dateOfBirth,
      loginDate: new Date().toISOString(),
    }

    localStorage.setItem("taskflowUser", JSON.stringify(userData))

    // Redirect to app
    window.location.href = "app.html"
  }, 2000)
})

// Show loading state
function showLoadingState() {
  const verifyBtn = document.getElementById("verifyBtn")
  verifyBtn.disabled = true
  verifyBtn.innerHTML = '<div class="loading"></div> Verifying...'
}

// Age validation function
function isValidAge(dateOfBirth) {
  const today = new Date()
  const birthDate = new Date(dateOfBirth)
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  // Adjust age if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 > 10
  }

  return age > 10
}

// Show error message
function showError(message) {
  const errorMessage = document.getElementById("errorMessage")
  errorMessage.textContent = message
  errorMessage.classList.add("show")
}

// Real-time validation feedback
document.getElementById("fullName").addEventListener("input", (e) => {
  const input = e.target
  const label = input.previousElementSibling

  if (input.value.trim().length >= 2) {
    input.style.borderColor = "#10b981"
    input.style.boxShadow = "0 0 0 4px rgba(16, 185, 129, 0.1)"
    label.style.color = "#10b981"
  } else {
    input.style.borderColor = "rgba(255, 255, 255, 0.2)"
    input.style.boxShadow = "none"
    label.style.color = "rgba(255, 255, 255, 0.9)"
  }
})

document.getElementById("dateOfBirth").addEventListener("change", (e) => {
  const input = e.target
  const label = input.previousElementSibling

  if (isValidAge(input.value)) {
    input.style.borderColor = "#10b981"
    input.style.boxShadow = "0 0 0 4px rgba(16, 185, 129, 0.1)"
    label.style.color = "#10b981"
  } else {
    input.style.borderColor = "#ef4444"
    input.style.boxShadow = "0 0 0 4px rgba(239, 68, 68, 0.1)"
    label.style.color = "#ef4444"
  }
})

// Add some interactive particles on click
document.addEventListener("click", (e) => {
  createClickEffect(e.clientX, e.clientY)
})

function createClickEffect(x, y) {
  const effect = document.createElement("div")
  effect.style.position = "fixed"
  effect.style.left = x + "px"
  effect.style.top = y + "px"
  effect.style.width = "10px"
  effect.style.height = "10px"
  effect.style.background = "rgba(255, 255, 255, 0.8)"
  effect.style.borderRadius = "50%"
  effect.style.pointerEvents = "none"
  effect.style.zIndex = "9999"
  effect.style.animation = "clickEffect 0.6s ease-out forwards"

  document.body.appendChild(effect)

  setTimeout(() => {
    document.body.removeChild(effect)
  }, 600)
}

// Add CSS for click effect
const style = document.createElement("style")
style.textContent = `
  @keyframes clickEffect {
    0% {
      transform: scale(1);
      opacity: 1;
    }
    100% {
      transform: scale(4);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)
