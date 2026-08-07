// Mobile nav toggle
const navToggle = document.getElementById('nav-toggle');
const siteHeader = document.querySelector('.site-header');

if (navToggle && siteHeader) {
  navToggle.addEventListener('click', () => {
    const isOpen = siteHeader.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });

  document.querySelectorAll('.nav-links a, .nav-actions a').forEach((link) => {
    link.addEventListener('click', () => {
      siteHeader.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// Scroll reveal
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window && revealEls.length) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// Signup form
const signupForm = document.getElementById('signup-form');
const signupStatus = document.getElementById('signup-status');

if (signupForm && signupStatus) {
  signupForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const emailInput = document.getElementById('signup-email');
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!isValid) {
      signupStatus.textContent = 'Please enter a valid email address.';
      signupStatus.classList.add('error');
      return;
    }

    signupStatus.classList.remove('error');
    signupStatus.textContent = `Thanks! We'll be in touch at ${email}.`;
    signupForm.reset();
  });
}
