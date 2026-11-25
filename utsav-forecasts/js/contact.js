/* Contact page: client-side form validation */
(() => {
  'use strict';

  const form = document.getElementById('contact-form');
  const status = document.getElementById('form-status');
  if (!form) return;

  const rules = {
    name: (v) => v.trim().length >= 2 || 'Please enter your name (at least 2 characters).',
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
    subject: (v) => v.trim().length >= 3 || 'Please enter a subject.',
    message: (v) => v.trim().length >= 10 || 'Your message should be at least 10 characters.'
  };

  function validateField(name) {
    const input = form.elements[name];
    const field = input.closest('.field');
    const result = rules[name](input.value);
    const ok = result === true;
    field.classList.toggle('invalid', !ok);
    field.querySelector('.error').textContent = ok ? '' : result;
    input.setAttribute('aria-invalid', String(!ok));
    return ok;
  }

  Object.keys(rules).forEach((name) => {
    form.elements[name].addEventListener('blur', () => validateField(name));
    form.elements[name].addEventListener('input', () => {
      if (form.elements[name].closest('.field').classList.contains('invalid')) validateField(name);
    });
  });

  const counter = document.getElementById('msg-count');
  form.elements.message.addEventListener('input', (e) => {
    if (counter) counter.textContent = `${e.target.value.length} / 500`;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    status.hidden = true;
    const allOk = Object.keys(rules).map(validateField).every(Boolean);
    if (!allOk) {
      const firstBad = form.querySelector('.invalid input, .invalid textarea');
      if (firstBad) firstBad.focus();
      return;
    }
    const name = form.elements.name.value.trim();
    status.textContent = `Thank you, ${name}! Your message has been received. We'll get back to you soon.`;
    status.hidden = false;
    form.reset();
    if (counter) counter.textContent = '0 / 500';
  });
})();
