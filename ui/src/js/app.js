import { Header } from './header';
import { BackToTopButton } from './back-to-top';

window.addEventListener('DOMContentLoaded', () => {
  new Header({ el: '.header' });
  new BackToTopButton({ el: '.back-to-top' });
});
