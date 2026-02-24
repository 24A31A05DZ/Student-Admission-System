// Smooth scroll for navbar links
document.querySelectorAll('.navbar a').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelector(this.getAttribute('href'))
      .scrollIntoView({ behavior: 'smooth' });
  });
});

// Login button action
document.querySelector('.login-btn').addEventListener('click', () => {
  alert("Login functionality coming soon!");
});