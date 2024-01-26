import * as api from "./api.js";
import { shuffle } from "./utils.js";

const ASSET_CLOUD = "assets/icons/cloud.svg";
const ASSET_FOLDER = "assets/icons/folder.svg";

window.addEventListener("DOMContentLoaded", async () => {
  // api.deleteById(103); // debug

  const $question = document.querySelector(".question");
  const $questionInfo = document.querySelector(".question-info");
  const $category = document.querySelector(".category");
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
  window.addEventListener("keydown", onKeyPressed);

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

    questions.forEach(({ category, question }) => {
      if (!questionsLists[category]) questionsLists[category] = [];
      questionsLists[category].push({
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
    if (categoryIndex <= 0) return;

    categoryIndex--;
    questionIndex = 0;

    questionsLists = getQuestionsLists(questionsLists);
    renderQuestion();
  }

  function onNextCategory() {
    if (categoryIndex >= categories.length - 1) return;

    categoryIndex++;
    questionIndex = 0;

    questionsLists = getQuestionsLists(questionsLists);
    renderQuestion();
  }

  function onKeyPressed(e) {
    if (e.key === "ArrowLeft") onPrevCategory();
    else if (e.key === "ArrowRight") onNextCategory();
    else if (e.code === "Space") nextQuestion();
  }
});
