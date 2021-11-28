function validateName(name) {
  if (!name) {
    return 'Please enter your name';
  }

  return '';
}

function validateEmail(email) {
  const emailPattern = /\S+@\S+\.\S+/;
  if (!emailPattern.test(email)) {
    return 'Please enter a valid email address';
  }

  return '';
}

function validateMessage(message) {
  if (!message) {
    return 'Please enter a message';
  }

  return '';
}

function getValidateFunction(field) {
  if (field === 'fullName') {
    return validateName;
  } else if (field === 'email') {
    return validateEmail;
  } else if (field === 'message') {
    return validateMessage;
  }
}

export function ContactForm({
  el,
  data: {
    formControlClass = 'contact__form-control',
    formControlErrorClass = 'contact__form-control-error',
    submittingClass = 'contact__form-submitting',
    submittingShowedClass = 'contact__form-submitting--showed',
    messageClass = 'contact__form-message',
    messageShowedClass = 'contact__form-message--showed',
    messageSuccessClass = 'contact__form-message--success',
    messageErrorClass = 'contact__form-message--error',
  } = {},
}) {
  this.$el = document.querySelector(el);

  if (!this.$el) return;

  this.$message = this.$el.querySelector(`.${messageClass}`);
  this.$submitting = this.$el.querySelector(`.${submittingClass}`);
  this.$submitButton = this.$el.querySelector('button[type="submit"]');
  this.$fields = this.$el.querySelectorAll(`.${formControlClass}`);
  this.touched = {};
  this.validationErrors = {};

  this.showSubmitting = (showed) => {
    if (!this.$submitting) return;
    if (showed) {
      this.$submitting.classList.add(submittingShowedClass);
    } else {
      this.$submitting.classList.remove(submittingShowedClass);
    }
  };

  this.disableSubmit = (disabled) => {
    if (!this.$submitButton) return;
    this.$submitButton.disabled = disabled;
  };

  this.setMessage = (message, type = 'error') => {
    if (!this.$message) return;

    this.$message.textContent = message;
    if (message) {
      this.$message.classList.add(
        type === 'error' ? messageErrorClass : messageSuccessClass
      );
      this.$message.classList.remove(
        type === 'error' ? messageSuccessClass : messageErrorClass
      );
      this.$message.classList.add(messageShowedClass);
    } else {
      this.$message.classList.remove(messageShowedClass);
    }
  };

  this.resetForm = () => {
    this.$el.reset();
    this.touched = {};
    this.validationErrors = {};
  };

  this.setTouched = (name) => {
    this.touched[name] = true;
  };

  this.showValidationErrors = () => {
    Object.entries(this.validationErrors).forEach(([field, error]) => {
      if (error && this.touched[field]) {
        this.setFieldError(field, error);
      } else {
        this.setFieldError(field, '');
      }
    });
  };

  this.setFieldError = (field, error) => {
    const $fieldError = this.$el.querySelector(
      `.${formControlClass}[name="${field}"] + .${formControlErrorClass}`
    );

    if (!$fieldError) return;

    $fieldError.textContent = error;
  };

  this.validate = () => {
    const formData = new FormData(this.$el);
    for (const field of formData.keys()) {
      const validateFunction = getValidateFunction(field);
      if (validateFunction) {
        this.validationErrors[field] = validateFunction(formData.get(field));
      }
    }
    this.showValidationErrors();

    return !Object.values(this.validationErrors).some((error) => error);
  };

  this.handleSubmit = async (event) => {
    const formData = new FormData(event.target);

    for (const field of formData.keys()) {
      this.setTouched(field);
    }
    if (!this.validate()) return;

    try {
      this.setMessage('');
      this.showSubmitting(true);
      this.disableSubmit(true);
      const response = await fetch(`${process.env.API_HOST}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.fromEntries(formData.entries())),
      });
      const data = await response.json();
      if (data.verdict === 'success') {
        this.resetForm();
        this.setMessage('Your message was sent, thank you!', 'success');
      } else {
        this.setMessage(data.error);
      }
      this.showSubmitting(false);
      this.disableSubmit(false);
    } catch (error) {
      console.error(error);
      this.showSubmitting(false);
      this.disableSubmit(false);
    }
  };

  this.$el.addEventListener('submit', (event) => {
    event.preventDefault();
    this.handleSubmit(event);
  });

  this.$fields.forEach((field) => {
    field.addEventListener('blur', (event) => {
      this.setTouched(event.target.name);
      this.validate();
    });

    field.addEventListener('input', (event) => {
      this.validate();
    });
  });
}
