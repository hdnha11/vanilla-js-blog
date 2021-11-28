export function Header({
  el,
  data: {
    hamburgerClass = 'header__hamburger',
    closeButtonClass = 'header__nav-close-burger',
    showedClass = 'header--mobile-nav-showed',
  } = {},
}) {
  this.$el = document.querySelector(el);

  if (!this.$el) return;

  const burgerButton = this.$el.querySelector(`.${hamburgerClass}`);
  const closeButton = this.$el.querySelector(`.${closeButtonClass}`);

  if (burgerButton) {
    burgerButton.addEventListener('click', () => {
      this.$el.classList.add(showedClass);
    });
  }

  if (closeButton) {
    closeButton.addEventListener('click', () => {
      this.$el.classList.remove(showedClass);
    });
  }
}
