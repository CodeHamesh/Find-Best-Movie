let cards = document.querySelectorAll('.card');
console.log(cards);
cards.forEach(card => {
    let layer = card.querySelector('.layer');
    card.addEventListener('mouseenter', () => {
        layer.style.zIndex = 9;
    });
    card.addEventListener('mouseleave', () => {
        layer.style.zIndex = -1;
    });
});