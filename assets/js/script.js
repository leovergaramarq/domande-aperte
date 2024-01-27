import * as api from "./api.js";
import { shuffle } from "./utils.js";

const ASSET_CLOUD = "assets/icons/cloud.svg";
const ASSET_FOLDER = "assets/icons/folder.svg";

window.addEventListener("DOMContentLoaded", async () => {
  // api.deleteById(103); // debug

  const $questionSection = document.querySelector(".question-section");
  const $question = document.querySelector(".question-content");
  const $questionInfo = document.querySelector(".question-info-content");
  const $btnDeleteQuestion = document.querySelector(".btn-delete-question");
  const $category = document.querySelector(".category-content");
  const $btnNext = document.querySelector(".btn-next");
  const $apiType = document.querySelector(".api-type");
  let $apiTypeImg;
  const $btnAddQuestion = document.querySelector(".btn-add-question");
  const $modalAddQuestion = document.querySelector(".modal-add-question");
  const $btnCloseModal = document.querySelector(".btn-close-modal");
  const $btnSubmitForm = document.querySelector(".btn-submit-form");
  const $checkStatus = document.querySelector(
    ".form-submit-area .check-status"
  );
  const $categoryLeft = document.querySelector(".category-left");
  const $categoryRight = document.querySelector(".category-right");

  let categoryIndex;
  let questionIndex;
  let questions;
  let questionsLists;
  let categories;

  setApiTypeImg();
  await init();

  $btnNext.addEventListener("click", nextQuestion);
  $apiType.addEventListener("click", toggleApiTypeImg);
  $btnAddQuestion.addEventListener("click", onAddQuestion);
  $btnCloseModal.addEventListener("click", onCloseModal);
  $btnSubmitForm.addEventListener("click", onSubmitForm);
  $categoryLeft.addEventListener("click", onPrevCategory);
  $categoryRight.addEventListener("click", onNextCategory);
  $btnDeleteQuestion.addEventListener("click", onDeleteQuestion);
  $questionSection.addEventListener("click", toggleBtnDeleteQuestion);
  document.addEventListener("keydown", onKeyPressed);
  document.addEventListener("touchstart", handleTouchStart, false);
  document.addEventListener("touchmove", handleTouchMove, false);

  function setApiTypeImg() {
    if (!$apiTypeImg) {
      $apiTypeImg = document.createElement("img");
      $apiTypeImg.src = api.isApiRemote() ? ASSET_CLOUD : ASSET_FOLDER;
      $apiTypeImg.alt = "api type";
      $apiType.appendChild($apiTypeImg);
    } else {
      toggleApiTypeImg();
    }
  }

  function toggleApiTypeImg() {
    if (api.isApiRemote()) {
      api.useLocalApi();
    } else {
      api.useRemoteApi();
    }

    $apiTypeImg.src = api.isApiRemote() ? ASSET_CLOUD : ASSET_FOLDER;
    init().catch(console.log);
  }

  async function init() {
    try {
      questions = await api.getQuestions();
    } catch (err) {
      alert("Errore nel caricamento delle domande!");
      return;
    }

    if (!questions.length) {
      alert("Non ci sono domande nel database!");
      return;
    }

    categoryIndex = 0;
    questionIndex = 0;
    questionsLists = getQuestionsLists();
    categories = Object.keys(questionsLists);

    nextQuestion();
  }

  function getQuestionsLists() {
    const questionsLists = {};

    questions.forEach(({ category, question, id }) => {
      if (!questionsLists[category]) questionsLists[category] = [];
      questionsLists[category].push({
        id,
        question,
        alreadyAsked: false,
      });
    });

    Object.keys(questionsLists).forEach((category) => {
      questionsLists[category] = shuffle(questionsLists[category]);
    });

    return questionsLists;
  }

  function nextQuestion() {
    if (categoryIndex >= categories.length) {
      alert("Hai finito le domande!");
      return;
    }

    const category = categories[categoryIndex];
    const questionObj = questionsLists[category][questionIndex];

    if (questionIndex > questionsLists[category].length - 1) {
      categoryIndex++;
      questionIndex = 0;
      nextQuestion();
      return;
    } else if (questionObj.alreadyAsked) {
      questionIndex++;
      nextQuestion();
      return;
    }

    renderQuestion(category, questionObj);
  }

  function nextCategory() {
    if (categoryIndex >= categories.length - 1) return;

    categoryIndex++;
    questionIndex = 0;

    questionsLists = getQuestionsLists(questionsLists);
    renderQuestion();
  }

  function prevCategory() {
    if (categoryIndex <= 0) return;

    categoryIndex--;
    questionIndex = 0;

    questionsLists = getQuestionsLists(questionsLists);
    renderQuestion();
  }

  function renderQuestion(category, questionObj) {
    if (!category) {
      category = categories[categoryIndex];
    }
    if (!questionObj) {
      questionObj = questionsLists[category][questionIndex];
    }

    $category.textContent = `${category} (${categoryIndex + 1}/${
      categories.length
    })`;
    $questionInfo.textContent = `Question (${questionIndex + 1}/${
      questionsLists[category].length
    })`;
    $question.textContent = questionObj.question;
    questionObj.alreadyAsked = true;

    if (categoryIndex === 0) {
      $categoryLeft.classList.add("hidden");
    } else {
      $categoryLeft.classList.remove("hidden");
    }

    if (categoryIndex === categories.length - 1) {
      $categoryRight.classList.add("hidden");
    } else {
      $categoryRight.classList.remove("hidden");
    }

    $btnDeleteQuestion.classList.add("hidden");
  }

  function onAddQuestion() {
    $modalAddQuestion.showModal();
  }

  function onCloseModal() {
    $modalAddQuestion.close();
  }

  async function onSubmitForm(e) {
    e.preventDefault();

    const $form = document.querySelector(".form-add-question");
    const $inputQuestion = $form.querySelector(".input-question input");
    const $inputCategory = $form.querySelector(".input-category input");

    const question = $inputQuestion.value;
    const category = $inputCategory.value;
    console.log($inputQuestion, category);

    if (!question || !category) {
      alert("Compila tutti i campi!");
      return;
    }

    try {
      await api.addQuestion(question, category);
    } catch (err) {
      alert("Errore nell'aggiunta della domanda!");
      return;
    }

    if (!$checkStatus.classList.contains("success")) {
      $checkStatus.classList.add("success");
      setTimeout(() => {
        if ($checkStatus.classList.contains("success")) {
          $checkStatus.classList.remove("success");
        }
      }, 1000);
    }

    $form.reset();
    // onCloseModal();

    // if (!questionsLists[category]) questionsLists[category] = [];
    // questionsLists[category].push({
    //   question,
    //   alreadyAsked: false,
    // });
    // categories = Object.keys(questionsLists);

    init().catch(console.log);
  }

  function onPrevCategory() {
    prevCategory();
  }

  function onNextCategory() {
    nextCategory();
  }

  async function onDeleteQuestion() {
    if (!confirm("Sei sicuro di voler cancellare questa domanda?")) return;
    console.log("Confirm asked!");
    return;

    const id = questionsLists[categories[categoryIndex]][questionIndex].id;
    if (id === undefined) {
      alert("Errore nella cancellazione della domanda!");
      return;
    }

    try {
      await api.deleteById(id);
    } catch (err) {
      alert("Errore nella cancellazione della domanda! Blame the developer!");
      return;
    }

    init().catch(console.log);
  }

  function toggleBtnDeleteQuestion(e) {
    if (isParentOf($btnDeleteQuestion, e.target)) return;
    $btnDeleteQuestion.classList.toggle("hidden");
  }

  function onKeyPressed(e) {
    if (e.key === "ArrowLeft") onPrevCategory();
    else if (e.key === "ArrowRight") nextCategory();
    else if (e.code === "Space") nextQuestion();
  }

  var xDown = null;
  var yDown = null;

  function handleTouchStart(e) {
    const firstTouch = e.touches[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
  }

  function handleTouchMove(e) {
    if (!xDown || !yDown) {
      return;
    }

    var xUp = e.touches[0].clientX;
    var yUp = e.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
      if (xDiff > 0) {
        nextCategory();
      } else {
        prevCategory();
      }
    } else {
    }
    xDown = null;
    yDown = null;
  }
});

function isParentOf($parent, $child) {
  while ($child !== document.body.parentElement) {
    if ($child === $parent) return true;
    $child = $child.parentElement;
  }
  return false;
}
