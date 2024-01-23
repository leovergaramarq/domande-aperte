import {
  getQuestions,
  isApiRemote,
  migrateQuestions,
  useLocalApi,
  useRemoteApi,
} from "./api.js";
import { shuffle } from "./utils.js";

const ASSET_CLOUD = "assets/icons/cloud.svg";
const ASSET_FOLDER = "assets/icons/folder.svg";

window.addEventListener("DOMContentLoaded", async () => {
  // try {
  //   await migrateQuestions();
  // } catch (err) {
  //   console.log(err);
  // }

  const $question = document.querySelector(".question");
  const $questionInfo = document.querySelector(".question-info");
  const $category = document.querySelector(".category");
  const $nextBtn = document.querySelector(".next-btn");
  const $apiType = document.querySelector(".api-type");
  let $apiTypeImg;

  let categoryIndex;
  let questionIndex;
  let questionsLists;
  let categories;

  setApiTypeImg();
  await init();

  $nextBtn.addEventListener("click", nextQuestion);
  $apiType.addEventListener("click", toggleApiTypeImg);

  function setApiTypeImg() {
    if (!$apiTypeImg) {
      $apiTypeImg = document.createElement("img");
      $apiTypeImg.src = isApiRemote() ? ASSET_CLOUD : ASSET_FOLDER;
      $apiType.appendChild($apiTypeImg);
    } else {
      toggleApiTypeImg();
    }
  }

  function toggleApiTypeImg() {
    if (isApiRemote()) {
      useLocalApi();
    } else {
      useRemoteApi();
    }

    $apiTypeImg.src = isApiRemote() ? ASSET_CLOUD : ASSET_FOLDER;
    init().catch(console.log);
  }

  async function init() {
    let questions;
    try {
      questions = await getQuestions();
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
    questionsLists = getQuestionsLists(questions);
    categories = Object.keys(questionsLists);

    nextQuestion();
  }

  function getQuestionsLists(questions) {
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

    if (questionIndex >= questionsLists[category].length - 1) {
      categoryIndex++;
      questionIndex = 0;
      nextQuestion();
      return;
    } else if (questionObj.alreadyAsked) {
      questionIndex++;
      nextQuestion();
      return;
    }

    $category.textContent = `${category} (${categoryIndex + 1}/${
      categories.length
    })`;
    $questionInfo.textContent = `Question (${questionIndex + 1}/${
      questionsLists[category].length
    })`;
    $question.textContent = questionObj.question;
    questionObj.alreadyAsked = true;
  }
});
