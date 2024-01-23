import json from "../json/questions.json" assert { type: "json" };

const API_URL = "https://retoolapi.dev/5WH3sb/domande-aperte";
let isApiLocal = false;

export function useLocalApi() {
  isApiLocal = true;
}

export function useRemoteApi() {
  isApiLocal = false;
}

export function isApiRemote() {
  return !isApiLocal;
}

function getQuestionsLocal() {
  return json;
}

async function getQuestionsRemote() {
  const response = await fetch(API_URL);
  return await response.json();
}

export async function getQuestions() {
  if (isApiLocal) return getQuestionsLocal();
  else return await getQuestionsRemote();
}

export async function migrateQuestions() {
  if (isApiLocal) {
    let questionsLocal = getQuestionsLocal();
    try {
      const questionsRemote = await getQuestionsRemote();
      questionsLocal = questionsLocal.filter(
        (questionLocal) =>
          !questionsRemote.find(
            ({ question, category }) =>
              question === questionLocal.question &&
              category === questionLocal.category
          )
      );
    } catch (err) {
      console.log(err);
    }

    const post = async ({ question, category }) => {
      await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question, category }),
      });
    };
    for (const question of questionsLocal) {
      await post(question);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } else {
    alert("Non puoi migrare le domande in remoto!");
  }
}

export async function deleteAll() {
  if (isApiLocal) {
    alert("Non puoi cancellare le domande in locale!");
  } else {
    const questions = await getQuestions();
    questions.forEach(async ({ id }) => {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
    });
  }
}

export async function deleteById(id) {
  if (isApiLocal) return;
  console.log(`${API_URL}/${id}`);
  await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });
}
