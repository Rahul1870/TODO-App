const todoList = document.getElementById("todoList");
const pagination = document.getElementById("pagination");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const addTodoForm = document.getElementById("addTodoForm");
const todoText = document.getElementById("todoText");
const searchInput = document.getElementById("searchInput");
const fromDate = document.getElementById("fromDate");
const toDate = document.getElementById("toDate");
const filterBtn = document.getElementById("filterBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageIndicator = document.getElementById("pageIndicator");

let todosData = [];
let currentPage = 1;
const limit = 5;

async function fetchTodos(page = 1) {
  loading.style.display = "block";
  error.classList.add("d-none");
  todoList.innerHTML = "";

  const skip = (page - 1) * limit;
  try {
    const res = await fetch(
      `https://dummyjson.com/todos?limit=${limit}&skip=${skip}`
    );
    if (!res.ok) throw new Error("Failed to fetch todos");
    const data = await res.json();

    todosData = data.todos.map((todo) => ({
      ...todo,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 1e10)),
    }));

    renderTodos(todosData);
    pageIndicator.textContent = `Page ${page}`;
  } catch (err) {
    error.classList.remove("d-none");
    console.error(err);
  } finally {
    loading.style.display = "none";
  }
}

function renderTodos(todos) {
  if (todos.length === 0) {
    todoList.innerHTML =
      "<div class='text-center text-muted'>No todos found.</div>";
    return;
  }

  todoList.innerHTML = "";
  todos.forEach((todo) => {
    const item = document.createElement("div");
    item.className =
      "list-group-item d-flex justify-content-between align-items-center";
    item.innerHTML = `
      <span>${todo.todo}</span>
      <small>
        <span class="me-2 text-muted">${todo.createdAt.toDateString()}</span>
        <span class="badge bg-${todo.completed ? "success" : "secondary"}">
          ${todo.completed ? "Done" : "Pending"}
        </span>
      </small>
    `;
    todoList.appendChild(item);
  });
}

addTodoForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newTodo = todoText.value.trim();
  if (!newTodo) return;

  try {
    const res = await fetch("https://dummyjson.com/todos/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ todo: newTodo, completed: false, userId: 1 }),
    });

    if (!res.ok) throw new Error("Failed to add todo");

    const result = await res.json();
    result.createdAt = new Date();
    todosData.unshift(result);
    renderTodos(todosData);
    todoText.value = "";
  } catch (err) {
    alert("Error adding todo");
    console.error(err);
  }
});

searchInput.addEventListener("input", () => {
  const searchTerm = searchInput.value.toLowerCase();
  const filtered = todosData.filter((todo) =>
    todo.todo.toLowerCase().includes(searchTerm)
  );
  renderTodos(filtered);
});

filterBtn.addEventListener("click", () => {
  const from = new Date(fromDate.value);
  const to = new Date(toDate.value);
  const filtered = todosData.filter((todo) => {
    const created = new Date(todo.createdAt);
    return (
      (!isNaN(from) ? created >= from : true) &&
      (!isNaN(to) ? created <= to : true)
    );
  });
  renderTodos(filtered);
});

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    fetchTodos(currentPage);
  }
});

nextBtn.addEventListener("click", () => {
  currentPage++;
  fetchTodos(currentPage);
});

fetchTodos();
