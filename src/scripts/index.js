/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getCardList, getUserInfo, setUserInfo, setAvatar, addNewCard } from "./components/api.js";
import { createCardElement, deleteCard, likeCard } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { enableValidation, clearValidation } from "./components/validation.js";

// Создание объекта с настройками валидации
const validationSettings = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

// включение валидации вызовом enableValidation
// все настройки передаются при вызове
enableValidation(validationSettings);

// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};


const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.log(err);
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  const newAvatarUrl = avatarInput.value;

  // Отправляем запрос на сервер
  setAvatar({ avatar: newAvatarUrl })
    .then((userData) => {
      // Обновляем аватар на странице
      profileAvatar.style.backgroundImage = url(`${userData.avatar}`);
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара:", err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  // Получаем значения из формы
  const cardName = cardNameInput.value;
  const cardLink = cardLinkInput.value;

  // Отправляем на сервер
  addNewCard({ name: cardName, link: cardLink })
    .then((newCardData) => {
      // Создаём элемент карточки и передаём currentUserId
      const cardElement = createCardElement(
        newCardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: deleteCard,
        },
        currentUserId // передаём ID текущего пользователя
      );

      // Добавляем в начало списка
      placesWrap.prepend(cardElement);

      // Закрываем модальное окно
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при добавлении карточки:', err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

// отображение карточек
/*
initialCards.forEach((data) => {
  placesWrap.append(
    createCardElement(data, {
      onPreviewPicture: handlePreviewPicture,
      onLikeIcon: likeCard,
      onDeleteCard: deleteCard,
    })
  );
});
*/

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});


// Загружаем данные с сервера и отображаем их
let currentUserId;
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // Сохраняем ID текущего пользователя
    currentUserId = userData._id; // ← вот здесь!

    // Обновляем профиль
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url(${userData.avatar})`;

    // Очищаем контейнер
    placesWrap.innerHTML = '';

    // Рендерим карточки
    cards.forEach((cardData) => {
      const cardElement = createCardElement(
        cardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: deleteCard,
        },
        currentUserId // передаём userId
      );
      placesWrap.append(cardElement);
    });
  })
  .catch(console.log);
