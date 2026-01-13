export const likeCard = (likeButton) => {
  likeButton.classList.toggle("card__like-button_is-active");
};

export const deleteCard = (cardElement) => {
  cardElement.remove();
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
  userId // ← добавили ID текущего пользователя
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
    deleteButton.addEventListener("click", () => onDeleteCard(cardElement, data._id));
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