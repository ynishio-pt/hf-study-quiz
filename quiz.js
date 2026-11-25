const byId = (id) => document.getElementById(id);
const home = byId("home");
const quiz = byId("quiz");
const form = byId("answer-form");
const choices = byId("choices");
const submit = byId("submit");
const feedback = byId("feedback");
const next = byId("next");
let queue = [];
let index = 0;
let mode = "";

function addMode(label, className, getQuestions) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.textContent = label;
  button.addEventListener("click", () => {
    queue = getQuestions();
    index = 0;
    mode = label;
    home.hidden = true;
    quiz.hidden = false;
    showQuestion();
  });
  byId("modes").append(button);
}

function randomQuestions() {
  const pool = [...questions];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, 10);
}

function showQuestion() {
  const question = queue[index];
  byId("position").textContent = mode + " ／ " + (index + 1) + " / " + queue.length;
  byId("progress").max = queue.length;
  byId("progress").value = index + 1;
  byId("prompt").textContent = question.prompt;
  choices.replaceChildren();
  question.options.forEach((option, optionIndex) => {
    const label = document.createElement("label");
    label.className = "option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "option";
    input.value = optionIndex;
    label.append(input, (optionIndex + 1) + "．" + option);
    choices.append(label);
  });
  choices.disabled = false;
  submit.hidden = false;
  submit.disabled = true;
  feedback.hidden = true;
  next.hidden = true;
  byId("prompt").focus();
  window.scrollTo(0, 0);
}

form.addEventListener("change", () => { submit.disabled = false; });
form.addEventListener("submit", (event) => {
  event.preventDefault();
  const selected = choices.querySelector("input:checked");
  if (!selected || choices.disabled) return;
  const question = queue[index];
  const correct = Number(selected.value) === question.answer;
  choices.disabled = true;
  submit.hidden = true;
  feedback.classList.toggle("wrong", !correct);
  byId("result").textContent = correct ? "正解" : "不正解";
  byId("correct").textContent = "正解 " + (question.answer + 1) + "．" + question.options[question.answer];
  byId("explanation").textContent = question.explanation;
  byId("reference").textContent = question.reference;
  feedback.hidden = false;
  next.textContent = index + 1 < queue.length ? "次の問題" : "出題方法に戻る";
  next.hidden = false;
  feedback.focus();
});

next.addEventListener("click", () => {
  if (next.hidden) return;
  index += 1;
  if (index < queue.length) {
    showQuestion();
    return;
  }
  quiz.hidden = true;
  home.hidden = false;
  byId("home-heading").focus();
  window.scrollTo(0, 0);
});

const chapters = [...new Set(questions.map((question) => question.chapter))].sort((a, b) => a - b);
for (const chapter of chapters) {
  const chapterQuestions = questions.filter((question) => question.chapter === chapter);
  addMode("第" + chapter + "章（" + chapterQuestions.length + "問）", "secondary", () => chapterQuestions);
}
addMode("全章からランダム出題", "primary", randomQuestions);
