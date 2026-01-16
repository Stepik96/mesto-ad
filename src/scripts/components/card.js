import { deleteCard as deleteCardApi } from './api.js';

export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement, cardId) => {
  // Отправляем запрос на удаление карточки с сервера
  deleteCardApi(cardId)
    .then(() => {
      // Если удаление прошло успешно, удаляем элемент из DOM
      cardElement.remove();
    })
    .catch((err) => {
      console.error('Ошибка при удалении карточки:', err);
      // В случае ошибки можно показать пользователю сообщение
    });
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard },
  userId
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const cardImage = cardElement.querySelector(".card__image");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  // Обработчик лайка
  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id));
  }

  // ПРОВЕРКА ВЛАДЕЛЬЦА
  if (onDeleteCard && data.owner && data.owner._id === userId) {
    // Если карточка моя — оставляем кнопку и навешиваем обработчик
    deleteButton.addEventListener("click", () => {
      // Вместо открытия модального окна здесь, мы просто вызываем функцию-колбэк
      // Эта функция будет реализована в index.js и будет открывать модальное окно
      onDeleteCard(cardElement, data._id);
    });
  } else {
    // Если не моя (или нет данных) — удаляем кнопку из DOM
    deleteButton.remove();
  }

  // Обработчик просмотра
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};