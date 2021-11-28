function sortByCreatedAt(messages) {
  const sorted = messages.slice();
  return sorted.sort((m1, m2) => {
    const d1 = new Date(m1.createdAt).getTime();
    const d2 = new Date(m2.createdAt).getTime();
    return d2 - d1;
  });
}

function formatDate(date) {
  return new Date(date).toLocaleString();
}

function buildTable(messages) {
  const sortedMessages = sortByCreatedAt(messages);

  return `
    <table class="contact-list__table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Email</th>
          <th>Message</th>
          <th>Created At</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${sortedMessages
          .map((message) => {
            const rowClass = message.read
              ? 'contact-list__row contact-list__row--disabled'
              : 'contact-list__row';
            return `
              <tr class="${rowClass}">
                <td>${message.id}</td>
                <td>${message.fullName}</td>
                <td>${message.email}</td>
                <td>${message.message}</td>
                <td>${formatDate(message.createdAt)}</td>
                <td class="contact-list__actions">
                  <i class="far fa-envelope-open contact-list__action-item" data-id="${
                    message.id
                  }"></i>
                </td>
              </tr>
            `;
          })
          .join('')}
      </tbody>
    </table>
  `;
}

export function ContactList({ parent }) {
  this.messages = [];
  this.$parent = document.querySelector(parent);

  if (!this.$parent) return;

  const $template = document.createElement('template');
  $template.innerHTML = `
    <div class="contact-list"></div>
  `;
  this.$el = $template.content.querySelector('.contact-list');

  this.fetchMessages = async () => {
    const response = await fetch(`${process.env.API_HOST}/messages`);
    const data = await response.json();
    return data.data;
  };

  this.setText = (text) => {
    this.$el.textContent = text;
  };

  this.setHTML = (html) => {
    this.$el.innerHTML = html;
  };

  this.delegateClickEventToTable = () => {
    const $table = this.$el.querySelector('table');
    if (!$table) return;

    $table.addEventListener('click', async (event) => {
      const { target } = event;
      if (
        target.classList.contains('contact-list__action-item') &&
        typeof target.dataset.id !== 'undefined'
      ) {
        const id = target.dataset.id;
        if (await this.readMessage(id)) {
          const $row = target.closest('tr');
          if ($row) {
            $row.classList.add('contact-list__row--disabled');
          }
        }
      }
    });
  };

  this.readMessage = async (id) => {
    try {
      const response = await fetch(
        `${process.env.API_HOST}/messages/${id}/read`,
        {
          method: 'PATCH',
        }
      );
      const data = await response.json();
      return data.verdict === 'success';
    } catch (error) {
      console.error(error);
    }
    return false;
  };

  this.init = async () => {
    this.$parent.appendChild(this.$el);
    this.setText('Fetching...');

    try {
      this.messages = await this.fetchMessages();

      if (this.messages.length === 0) {
        this.setText('No Activity, yet');
      } else {
        this.setHTML(buildTable(this.messages));
        this.delegateClickEventToTable();
      }
    } catch (error) {
      console.error(error);
      this.setText('Failed to fetch');
    }
  };

  this.init();
}
