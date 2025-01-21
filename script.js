document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('listing-form');
  const horseList = document.getElementById('horse-list');

  // Event listener for form submission
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('name').value;
    const breed = document.getElementById('breed').value;
    const age = document.getElementById('age').value;
    const price = document.getElementById('price').value;
    const description = document.getElementById('description').value;

    // Create a new horse card
    const horseCard = document.createElement('div');
    horseCard.classList.add('horse-card');
    horseCard.innerHTML = `
      <h3>${name}</h3>
      <p><strong>Breed:</strong> ${breed}</p>
      <p><strong>Age:</strong> ${age}</p>
      <p><strong>Price:</strong> $${price}</p>
      <p>${description}</p>
    `;

    // Add the new card to the horse list
    horseList.appendChild(horseCard);

    // Clear the form
    form.reset();
  });
});
