
document.addEventListener('DOMContentLoaded', function() {
    const toggleButton = document.getElementById('toggleButton');
    const additionalInfo = document.querySelector('.additional-info');

    // Hide additional information initially
    additionalInfo.style.display = 'none';

    toggleButton.addEventListener('click', function() {
        if (additionalInfo.style.display === 'none' || additionalInfo.style.display === '') {
            additionalInfo.style.display = 'block';
            toggleButton.textContent = 'Show Less';
        } else {
            additionalInfo.style.display = 'none';
            toggleButton.textContent = 'Show More';
        }
    });
});
