import json from "../json/questions.json" assert { type: "json" };

const API_URL = "https://retoolapi.dev/5WH3sb/domande-aperte";
// const API_URL_LOCAL = "/assets/json/questions.json";

export async function getQuestions() {
  return json;
  try {
    return await fetch(API_URL).then((response) => response.json());
  } catch (err) {
    return json;
  }
}
