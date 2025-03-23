let rightClickedCard = null;

document.addEventListener("DOMContentLoaded", loadTasksFromLocalStorage);

function addTask(boardId) {
  const input = document.getElementById(`${boardId}-input`);
  const taskText = input.value.trim();

  if (!taskText) {
    alert("Task cannot be empty!");
    return;
  }

  const taskDate = new Date().toLocaleString();
  const taskElement = createTaskElement(taskText, taskDate);

  document.getElementById(`${boardId}-tasks`).appendChild(taskElement);
  updateTasksCount(boardId);
  saveTasksToLocalStorage(boardId, taskText, taskDate);
  input.value = "";
}

function createTaskElement(taskText, taskDate) {
  const element = document.createElement("div");
  element.innerHTML = `<span>${taskText}</span><br>
                      <small class="time">${taskDate}</small>`;

  element.classList.add("card");

  element.draggable = true;

  element.addEventListener("dragstart", dragStart);

  element.addEventListener("dragend", dragEnd);

  element.addEventListener("contextmenu", function (event) {
    event.preventDefault();
    rightClickedCard = this;
    console.log(event.pageX, event.pageY);
    showContextMenu(event.pageX, event.pageY);
  });
  return element;
}

function dragStart() {
  this.classList.add("dragging");
}

function dragEnd() {
  this.classList.remove("dragging");

  ["todo", "doing", "done"].forEach((boardId) => {
    updateTasksCount(boardId);
    updateLocalStorage();
  });
}

const boards = document.querySelectorAll(".tasks");

boards.forEach((board) => {
  board.addEventListener("dragover", dragOver);
});

function dragOver(event) {
  event.preventDefault();

  const draggedCard = document.querySelector(".dragging");

  const afterDraggedElement = getElementAfterDragging(this, event.pageY);

  if (afterDraggedElement === null) {
    this.appendChild(draggedCard);
  } else {
    this.insertBefore(draggedCard, afterDraggedElement);
  }
  updateTasksCount(this.closest(".kan-board").id);
  updateLocalStorage();
}

function getElementAfterDragging(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".card:not(.dragging)"),
  ]; // Nodelist => Array

  const result = draggableElements.reduce(
    (closestElementUnderMouse, currentTask) => {
      // had to take help solving this;
      // read medium article to solve this issue !!
      const box = currentTask.getBoundingClientRect();

      const offset = y - (box.top + box.height / 2);

      if (offset < 0 && offset > closestElementUnderMouse.offset) {
        return { offset: offset, element: currentTask };
      } else {
        return closestElementUnderMouse;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  );
  return result.element;
}

const popupMenu = document.querySelector(".popup-menu");
function showContextMenu(x, y) {
  popupMenu.style.left = `${x}px`;
  popupMenu.style.top = `${y}px`;
  popupMenu.style.display = "block";
}

document.addEventListener("click", () => {
  popupMenu.style.display = "none";
});

function editTask() {
  if (rightClickedCard !== null) {
    const taskTextElement = rightClickedCard.querySelector("span");
    const oldTaskText = taskTextElement.textContent;
    const newTaskText = prompt("Edit task - ", oldTaskText);

    if (newTaskText !== null && newTaskText.trim() !== "") {
      taskTextElement.textContent = newTaskText;
      updateLocalStorage();
    }
  }
}

function deleteTask() {
  if (rightClickedCard !== null) {
    const boardId = rightClickedCard.closest(".kan-board").id;
    rightClickedCard.remove();
    updateLocalStorage();
    updateTasksCount(boardId);
  }
}

function updateTasksCount(boardId) {
  console.log(`#${boardId}-tasks .card`);

  const count = document.querySelectorAll(`#${boardId}-tasks .card`).length;
  document.getElementById(`${boardId}-counter`).textContent = count;
}

function saveTasksToLocalStorage(boardId, taskText, taskDate) {
  const tasks = JSON.parse(localStorage.getItem(boardId)) || [];
  tasks.push({ text: taskText, date: taskDate });
  localStorage.setItem(boardId, JSON.stringify(tasks));
}

function loadTasksFromLocalStorage() {
  ["todo", "doing", "done"].forEach((boardId) => {
    const tasks = JSON.parse(localStorage.getItem(boardId)) || [];
    tasks.forEach(({ text, date }) => {
      const taskElement = createTaskElement(text, date);
      document.getElementById(`${boardId}-tasks`).appendChild(taskElement);
    });
    updateTasksCount(boardId);
  });
}

function updateLocalStorage() {
  ["todo", "doing", "done"].forEach((boardId) => {
    const tasks = [];
    document.querySelectorAll(`#${boardId}-tasks .card`).forEach((card) => {
      const taskText = card.querySelector("span").textContent;
      const taskDate = card.querySelector("small").textContent;
      tasks.push({ text: taskText, date: taskDate });
    });
    localStorage.setItem(boardId, JSON.stringify(tasks));
  });
}
