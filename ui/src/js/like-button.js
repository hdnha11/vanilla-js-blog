import clapIcon from '../images/clap.svg';

export function LikeButton({
  parent,
  data: { disabledClass = 'like-button--disabled' } = {},
}) {
  this.count = undefined;
  this.$parent = document.querySelector(parent);

  if (!this.$parent) return;

  const $template = document.createElement('template');
  $template.innerHTML = `
    <section class="like-button">
      <span class="like-button__count">0</span>
      <div class="like-button__icon">
        <img src="${clapIcon}" alt="Clap" />
      </div>
    </section>`;

  this.$el = $template.content.querySelector('.like-button');

  if (!this.$el) return;

  this.blogID = this.$parent.dataset.id;

  this.fetchLikeCount = async () => {
    try {
      const response = await fetch(
        `${process.env.API_HOST}/blog/${this.blogID}/total-like`
      );
      const data = await response.json();
      if (data) {
        this.count = data.data;
        this.updateCount();
      }
    } catch (error) {
      console.error(error);
    }
  };

  this.like = async () => {
    this.$el.classList.add(disabledClass);
    try {
      const response = await fetch(
        `${process.env.API_HOST}/blog/${this.blogID}/like`,
        {
          method: 'POST',
        }
      );
      const data = await response.json();
      if (data) {
        this.fetchLikeCount();
      }
    } catch (error) {
      console.error(error);
      this.$el.classList.remove(disabledClass);
    }
  };

  this.updateCount = () => {
    const $count = this.$el.querySelector('.like-button__count');
    if ($count) {
      $count.textContent = this.count;
    }
  };

  this.init = async () => {
    this.$el.addEventListener('click', this.like);

    await this.fetchLikeCount();
    if (typeof this.count !== 'undefined') {
      this.$parent.appendChild(this.$el);
    }
  };

  this.init();
}
