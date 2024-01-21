import { getQuestions } from "./api.js";

window.addEventListener("DOMContentLoaded", async () => {
  const $question = document.querySelector("#question");
  const $questionInfo = document.querySelector("#question-info");
  const $category = document.querySelector("#category");

  const questions = await getQuestions();
  if (!questions.length) return;

  const questionsLists = {};

  questions.forEach(({ category, question }) => {
    if (!questionsLists[category]) questionsLists[category] = [];
    questionsLists[category].push({
      question,
      alreadyAsked: false,
    });
  });

  const categories = Object.keys(questionsLists);
  let categoryIndex = 0;
  let questionIndex = 0;

  categories.forEach((category) => {
    questionsLists[category] = shuffle(questionsLists[category]);
  });
  nextQuestion();

  document.querySelector("#next-btn").addEventListener("click", nextQuestion);

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

// https://stackoverflow.com/a/2450976/20250972
function shuffle(array) {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}
