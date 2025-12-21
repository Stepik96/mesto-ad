export const showInputError = (
  formElement,
  inputElement,
  errorMessage,
  settings
) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  errorElement.textContent = errorMessage;
  inputElement.classList.add(settings.inputErrorClass);
  errorElement.classList.add(settings.errorClass);

  disableSubmitButton(formElement, settings);
};

export const hideInputError = (formElement, inputElement, settings) => {
  const errorElement = formElement.querySelector(`#${inputElement.id}-error`);
  inputElement.classList.remove(settings.inputErrorClass);
  errorElement.classList.remove(settings.errorClass);
  errorElement.textContent = '';

  enableSubmitButton(formElement, settings);
};

export const checkInputValidity = (formElement, inputElement, settings) => {
  if (inputElement.validity.valid) {
    hideInputError(formElement, inputElement, settings);
  } else {
    const message = inputElement.validity.patternMismatch
      ? inputElement.dataset.errorMessage
      : inputElement.validationMessage;

    showInputError(formElement, inputElement, message, settings);
  }
};

export const hasInvalidInput = (formElement, settings) => {
  return Array.from(formElement.querySelectorAll(settings.inputSelector))
    .some((field) => !field.validity.valid);
};

export const disableSubmitButton = (formElement, settings) => {
  const submitBtn = formElement.querySelector(settings.submitButtonSelector);
  submitBtn.disabled = true;
  submitBtn.classList.add(settings.inactiveButtonClass);
};

export const enableSubmitButton = (formElement, settings) => {
  const submitBtn = formElement.querySelector(settings.submitButtonSelector);
  submitBtn.classList.remove(settings.inactiveButtonClass);
  submitBtn.disabled = false;
};

export const toggleButtonState = (formElement, settings) => {
  if (hasInvalidInput(formElement, settings)) {
    disableSubmitButton(formElement, settings);
  } else {
    enableSubmitButton(formElement, settings);
  }
};

export const setEventListeners = (formElement, settings) => {
  Array.from(formElement.querySelectorAll(settings.inputSelector))
    .forEach((input) => {
      input.addEventListener('input', () => {
        checkInputValidity(formElement, input, settings);
        toggleButtonState(formElement, settings);
      });
    });
};

export const clearValidation = (formElement, settings) => {
  Array.from(formElement.querySelectorAll(settings.inputSelector))
    .forEach((input) => hideInputError(formElement, input, settings));
  toggleButtonState(formElement, settings);
};

export const enableValidation = (settings) => {
  Array.from(document.querySelectorAll(settings.formSelector))
    .forEach((form) => setEventListeners(form, settings));
};