const checkboxes = document.querySelectorAll('input[type="checkbox"]');

checkboxes.forEach(checkbox => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      console.log(`Session for ${checkbox.id} completed!`);
    } else {
      console.log(`Session for ${checkbox.id} reset.`);
    }
  });
});
