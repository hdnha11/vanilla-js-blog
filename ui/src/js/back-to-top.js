export function BackToTopButton({
  el,
  data: { showedClass = 'back-to-top--showed' } = {},
}) {
  this.$el = document.querySelector(el);

  if (!this.$el) return;

  this.$el.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  });

  document.addEventListener('scroll', () => {
    if (!showedClass) return;

    if (window.scrollY > 0) {
      this.$el.classList.add(showedClass);
    } else {
      this.$el.classList.remove(showedClass);
    }
  });
}
