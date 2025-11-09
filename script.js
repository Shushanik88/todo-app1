const API_URL = "http://localhost:3000/todos"; // Для JSON Server
const list = document.getElementById("todo-list");
const form = document.getElementById("todo-form");
const input = document.getElementById("todo-input");

let todos = [];

// Загружаем ToDo с сервера или из LocalStorage
async function loadTodos() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error("Server unavailable");
    todos = await res.json();
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch {
    todos = JSON.parse(localStorage.getItem("todos") || "[]").slice(-5);
    alert("Сервер недоступен. Показаны последние 5 задач из LocalStorage.");
  }
  render();
}

// Отображаем список задач
function render() {
  list.innerHTML = "";
  todos.forEach((todo) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <input type="checkbox" ${todo.isCompleted ? "checked" : ""}>
      <span>${todo.title}</span>
      <button>✖</button>
    `;
    const checkbox = li.querySelector("input");
    const btn = li.querySelector("button");

    checkbox.addEventListener("change", () => toggle(todo.id));
    btn.addEventListener("click", () => remove(todo.id));

    if (todo.isCompleted) li.classList.add("completed");
    list.appendChild(li);
  });
}

// Добавление новой задачи
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = input.value.trim();
  if (!title) return;
  const newTodo = { title, isCompleted: false };

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTodo),
    });
    const data = await res.json();
    todos.push(data);
  } catch {
    newTodo.id = Date.now();
    todos.push(newTodo);
  }

  localStorage.setItem("todos", JSON.stringify(todos));
  input.value = "";
  render();
});

// Изменение состояния (завершено/нет)
async function toggle(id) {
  const todo = todos.find((t) => t.id === id);
  todo.isCompleted = !todo.isCompleted;

  try {
    await fetch(`${API_URL}/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: todo.isCompleted }),
    });
  } catch {}

  localStorage.setItem("todos", JSON.stringify(todos));
  render();
}

// Удаление задачи
async function remove(id) {
  todos = todos.filter((t) => t.id !== id);

  try {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
  } catch {}

  localStorage.setItem("todos", JSON.stringify(todos));
  render();
}

// Запуск
loadTodos();
