/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { getCardList, getUserInfo, setUserInfo, setAvatar, addNewCard, changeLikeCardStatus } from "./components/api.js";
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

const removeCardModalWindow = document.querySelector(".popup_type_remove-card");
const removeCardForm = removeCardModalWindow.querySelector(".popup__form");

// Модальное окно статистики
const statsModal = document.querySelector('.popup_type_info');
const statsInfoList = document.querySelector('.popup__info'); // это <dl>
const statsUserList = document.querySelector('.popup__list'); // это <ul>

// Шаблоны
const statsItemTemplate = document.querySelector('#popup-info-definition-template').content;
const userItemTemplate = document.querySelector('#popup-info-user-preview-template').content;

const logo = document.querySelector('.header__logo');

let currentCardToDelete = null; // Переменная для хранения ссылки на удаляемую карточку и её ID

const handleRemoveCardSubmit = (evt) => {
  evt.preventDefault();

  // Получаем кнопку из формы
  const submitButton = evt.target.querySelector('.popup__button');

  // Меняем текст и блокируем кнопку
  submitButton.textContent = 'Удаление...';
  submitButton.disabled = true;

  if (!currentCardToDelete || !currentCardToDelete.cardId) {
    console.error("Не удалось определить карточку для удаления.");
    closeModalWindow(removeCardModalWindow);
    return;
  }

  deleteCard(currentCardToDelete.element, currentCardToDelete.cardId);

  closeModalWindow(removeCardModalWindow);
  currentCardToDelete = null;

  // Возвращаем исходный текст и разблокируем кнопку
  submitButton.textContent = 'Да';
  submitButton.disabled = false;
};

removeCardForm.addEventListener("submit", handleRemoveCardSubmit);

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};


const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();

  // Получаем кнопку из формы
  const submitButton = evt.target.querySelector('.popup__button');

  // Меняем текст и блокируем кнопку
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

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
    })
    .finally(() => {
      // Возвращаем исходный текст и разблокируем кнопку
      submitButton.textContent = 'Сохранить';
      submitButton.disabled = false;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();

  // Получаем кнопку из формы
  const submitButton = evt.target.querySelector('.popup__button');

  // Меняем текст и блокируем кнопку
  submitButton.textContent = 'Сохранение...';
  submitButton.disabled = true;

  const newAvatarUrl = avatarInput.value;

  setAvatar({ avatar: newAvatarUrl })
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url(${userData.avatar})`;
      closeModalWindow(avatarFormModalWindow);
    })
    .catch((err) => {
      console.error("Ошибка при обновлении аватара: ", err);
    })
    .finally(() => {
      // Возвращаем исходный текст и разблокируем кнопку
      submitButton.textContent = 'Сохранить';
      submitButton.disabled = false;
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();

  // Получаем кнопку из формы
  const submitButton = evt.target.querySelector('.popup__button');

  // Меняем текст и блокируем кнопку
  submitButton.textContent = 'Создание...';
  submitButton.disabled = true;

  const cardName = cardNameInput.value;
  const cardLink = cardLinkInput.value;

  addNewCard({ name: cardName, link: cardLink })
    .then((newCardData) => {
      const cardElement = createCardElement(
        newCardData,
        {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          onDeleteCard: deleteCard,
        },
        currentUserId
      );
      placesWrap.prepend(cardElement);
      closeModalWindow(cardFormModalWindow);
    })
    .catch((err) => {
      console.log('Ошибка при добавлении карточки:', err);
    })
    .finally(() => {
      // Возвращаем исходный текст и разблокируем кнопку
      submitButton.textContent = 'Создать';
      submitButton.disabled = false;
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

// Форматирование даты: "17 января 2026"
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Обработчик клика по логотипу — открытие статистики
const handleLogoClick = () => {
  getCardList()
    .then((cards) => {
      // Находим модальное окно и его элементы
      const statsModal = document.querySelector('.popup_type_info');
      const infoList = statsModal.querySelector('.popup__info');
      const userList = statsModal.querySelector('.popup__list');

      // Очищаем содержимое
      infoList.innerHTML = '';
      userList.innerHTML = '';

      // Устанавливаем заголовок модального окна
      statsModal.querySelector('.popup__title').textContent = 'Статистика пользователей';

      // Устанавливаем заголовок для списка пользователей
      statsModal.querySelector('.popup__text').textContent = 'Все пользователи'; // Добавлено: Заголовок "Все пользователи"

      // Собираем уникальных пользователей и считаем их карточки
      const userCardCounts = new Map(); // Карта: ID пользователя -> количество карточек

      cards.forEach(card => {
        if (card.owner?._id) {
          const userId = card.owner._id;
          const currentCount = userCardCounts.get(userId) || 0;
          userCardCounts.set(userId, currentCount + 1);
        }
      });

      // Вспомогательная функция: создаёт строку статистики (термин + значение)
      const createInfoItem = (term, description) => {
        const template = document
          .getElementById('popup-info-definition-template')
          .content
          .cloneNode(true);
        template.querySelector('.popup__info-term').textContent = term;
        template.querySelector('.popup__info-description').textContent = description;
        return template;
      };

      // Вспомогательная функция: создаёт бейдж пользователя (только имя)
      const createUserBadge = (name) => {
        const template = document
          .getElementById('popup-info-user-preview-template')
          .content
          .cloneNode(true);
        template.querySelector('.popup__list-item').textContent = name;
        return template;
      };

      // === Заполняем статистику ===
      infoList.append(createInfoItem('Всего карточек:', cards.length));

      // Правильный расчет первой и последней карточки
      const firstCard = cards[cards.length - 1]; // Первая создана (самая старая)
      const lastCard = cards[0];                 // Последняя создана (самая новая)

      infoList.append(createInfoItem('Первая создана:', formatDate(firstCard.createdAt)));
      infoList.append(createInfoItem('Последняя создана:', formatDate(lastCard.createdAt)));

      infoList.append(createInfoItem('Всего пользователей:', userCardCounts.size));

      // Расчет "Максимум карточек от одного"
      let maxCardsFromOneUser = 0;
      if (userCardCounts.size > 0) {
        maxCardsFromOneUser = Math.max(...Array.from(userCardCounts.values()));
      }
      infoList.append(createInfoItem('Максимум карточек от одного:', maxCardsFromOneUser)); // Добавлено: Пункт "Максимум карточек от одного"

      // === Заполняем список пользователей ===
      // Используем карту userCardCounts для получения имен пользователей
      userCardCounts.forEach((count, userId) => {
        // Найдем имя пользователя по его ID в списке карточек (или используйте другую логику, если есть доступ к данным пользователей)
        // Здесь мы просто берем имя из первой карточки, которую он создал (это может быть не идеально, но работает для примера)
        const userName = cards.find(card => card.owner?._id === userId)?.owner?.name || 'Неизвестный';
        userList.append(createUserBadge(userName));
      });

      // Открываем модальное окно
      openModalWindow(statsModal);
    })
    .catch((err) => {
      console.error('Ошибка при загрузке статистики:', err);
    });
};

// Назначаем обработчик на логотип
if (logo) {
  logo.addEventListener('click', handleLogoClick);
}

// Загружаем данные с сервера и отображаем их
let currentUserId;
Promise.all([getCardList(), getUserInfo()])
  .then(([cards, userData]) => {
    // Сохраняем ID текущего пользователя
    currentUserId = userData._id; 

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
          onDeleteCard: (element, id) => {
            // Сохраняем данные о карточке для удаления
            currentCardToDelete = {
              element: element,
              cardId: id,
            };

            // Открываем модальное окно подтверждения
            openModalWindow(removeCardModalWindow);
          },
        },
        currentUserId
      );
      placesWrap.append(cardElement);
    });
  })
  .catch(console.log);

  


