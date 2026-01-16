import { deleteCard as deleteCardApi } from './api.js';
import { changeLikeCardStatus } from './api.js';

export const likeCard = (likeButton, cardId) => {
  // Находим карточку и элемент счётчика лайков
  const cardElement = likeButton.closest('.card');
  const likeCountElement = cardElement.querySelector('.card__like-count');

  // Проверяем, стоит ли уже лайк
  const isLiked = likeButton.classList.contains('card__like-button_is-active');

  // Отправляем запрос на сервер
  changeLikeCardStatus(cardId, isLiked)
    .then((updatedCard) => {
      // Обновляем состояние кнопки
      likeButton.classList.toggle('card__like-button_is-active', !isLiked);

      // Обновляем счётчик лайков
      if (likeCountElement) {
        likeCountElement.textContent = updatedCard.likes.length;
      }
    })
    .catch((err) => {
      console.error('Ошибка при изменении лайка:', err);
      // Опционально: можно показать пользователю уведомление об ошибке
    });
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
  const likeCountElement = cardElement.querySelector(".card__like-count");

  // Устанавливаем данные из сервера
  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  // обновляем состояние лайка при рендере
  if (likeCountElement) {
    likeCountElement.textContent = data.likes.length;
  }

  // Проверяем, поставил ли текущий пользователь лайк
  const isLikedByMe = data.likes.some(like => like._id === userId);
  if (isLikedByMe) {
    likeButton.classList.add("card__like-button_is-active");
  } else {
    likeButton.classList.remove("card__like-button_is-active");
  }

  // Обработчик лайка
  if (onLikeIcon) {
    likeButton.addEventListener("click", () => onLikeIcon(likeButton, data._id));
  }

  // Проверка владельца для удаления
  if (onDeleteCard && data.owner && data.owner._id === userId) {
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
  } else {
    deleteButton.remove();
  }

  // Обработчик просмотра
  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));
  }

  return cardElement;
};