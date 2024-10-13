// Handle login form submission
document.getElementById('login-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Example validation and redirect logic
    if (email === "test@example.com" && password === "password123") {
        alert("Login successful!");
        window.location.href = "dashboard.html"; // Redirect to dashboard or main app page
    } else {
        alert("Invalid credentials. Please try again.");
    }
});

// Handle register form submission
document.getElementById('register-form')?.addEventListener('submit', function(event) {
    event.preventDefault();
    const fullname = document.getElementById('fullname').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Example validation and redirect logic
    if (fullname && email && password) {
        alert("Registration successful!");
        window.location.href = "login.html"; // Redirect to login after registration
    } else {
        alert("Please fill out all fields.");
    }
});

document.addEventListener('DOMContentLoaded', function() {
    document.body.style.zoom = "90%";
  });

  window.addEventListener('load', function() {
    window.scrollTo(0, 0);
  });
