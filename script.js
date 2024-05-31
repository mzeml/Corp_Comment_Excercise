// --GLOBAL --
const MAX_CHARS = 150;
const BASE_API_URL = '';

const textareaEl = document.querySelector('.form__textarea');
const counterEl = document.querySelector('.counter');

const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const spinnerEl = document.querySelector('.spinner');
const hashtagListEl = document.querySelector('.hashtags');

const renderFeedbackItem = (feedbackItem) => {
  const feedbackItemHTML = `
    <li class="feedback">
      <button class="upvote">
          <i class="fa-solid fa-caret-up upvote__icon"></i>
          <span class="upvote__count">${feedbackItem.upvoteCount}</span>
      </button>
      <section class="feedback__badge">
          <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
      </section>
      <div class="feedback__content">
          <p class="feedback__company">${feedbackItem.company}</p>
          <p class="feedback__text">${feedbackItem.text}</p>
      </div>
      <p class="feedback__date">${
        feedbackItem.daysAgo === 0 ? 'NEW' : feedbackItem.daysAgo + 'd'
      }</p>
    </li>
  `;

  feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHTML);
};

// -- Counter Component --

const inputHandler = () => {
  const numCharsTyped = textareaEl.value.length;
  const charsLeft = MAX_CHARS - numCharsTyped;
  counterEl.textContent = charsLeft;
};

textareaEl.addEventListener('input', inputHandler);

// -- FORM COMPONENT --
const formEl = document.querySelector('.form');
const showVisualIndAsValid = (isValid) => {
  const className = isValid ? 'form--valid' : 'form--invalid';
  formEl.classList.add(className);
  setTimeout(() => {
    formEl.classList.remove(className);
  }, 2000);
};

const submitHandler = (event) => {
  event.preventDefault();
  const text = textareaEl.value;

  //Validate text input
  if (text.length >= 5 && text.includes('#')) {
    showVisualIndAsValid(true);
  } else {
    showVisualIndAsValid(false);
    textareaEl.focus();
    return;
  }

  //Valid text, parse user input
  const hashtag = textareaEl.value
    .split(' ')
    .find((word) => word.includes('#'));
  // const companyName = hashtag.slice(1, hashtag.length);
  const company = hashtag.substring(1);
  const badgeLetter = company.substring(0, 1).toUpperCase();
  const upvoteCount = 0;
  const daysAgo = 0;

  const feedbackItem = {
    company: company,
    badgeLetter: badgeLetter,
    upvoteCount: upvoteCount,
    daysAgo: daysAgo,
    text: text,
  };

  renderFeedbackItem(feedbackItem);

  fetch(`${BASE_API_URL}/feedbacks`, {
    method: 'POST',
    body: JSON.stringify(feedbackItem),
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        console.log('Something went wrong');
        return;
      }
      console.log('Successful submission');
    })
    .catch((error) => console.log(error));

  //Clear the form, unfocus submit button, and clear counter
  textareaEl.value = '';
  submitBtnEl.blur();
  counterEl.textContent = MAX_CHARS;
};

formEl.addEventListener('submit', submitHandler);

// -- FEEDBACK LIST COMPONENT --
const clickHandler = (event) => {
  const clickedEl = event.target;

  const upvoteIntention = clickedEl.className.includes('upvote');
  if (upvoteIntention) {
    const upvoteBtnEl = clickedEl.closest('.upvote');
    upvoteBtnEl.disabled = true;
    const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count');
    //converts string to number
    let upvoteCount = +upvoteCountEl.textContent;
    upvoteCountEl.textContent = ++upvoteCount;
  } else {
    clickedEl.closest('.feedback').classList.toggle('feedback--expand');
  }
};
feedbackListEl.addEventListener('click', clickHandler);

fetch(`${BASE_API_URL}/feedbacks`)
  .then((response) => response.json())
  .then((data) => {
    spinnerEl.remove();
    data.feedbacks.forEach((feedbackItem) => {
      renderFeedbackItem(feedbackItem);
    });
  })
  .catch((error) => {
    feedbackListEl.textContent = `Failed to fetch feedback items. Error: ${error.message}`;
  });

//-- Hashtag List
const hashTagClickHandler = (event) => {
  const clickedEl = event.target;

  if (clickedEl.className.includes('hashtags')) return;

  const companyNameFromHashTag = clickedEl.textContent
    .substring(1)
    .toLowerCase()
    .trim();
  feedbackListEl.childNodes.forEach((childNode) => {
    //if text node, stop current iteration
    if (childNode.nodeType === 3) return;

    //extract company name from li element
    const companyNameFromFeedbackItem = childNode
      .querySelector('.feedback__company')
      .textContent.toLowerCase()
      .trim();

    //keep only matched items
    if (companyNameFromFeedbackItem !== companyNameFromHashTag) {
      childNode.remove();
    }
  });
};
hashtagListEl.addEventListener('click', hashTagClickHandler);
