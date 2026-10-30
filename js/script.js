
/* =========================================
   1. SELECT HTML ELEMENTS
========================================= */

const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskPriority = document.getElementById("taskPriority");

const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");
const emptyMessage = document.getElementById("emptyMessage");

const searchInput = document.getElementById("searchInput");
const clearCompletedBtn = document.getElementById("clearCompleted");

const totalTasksElement = document.getElementById("totalTasks");
const completedTasksElement = document.getElementById("completedTasks");
const remainingTasksElement = document.getElementById("remainingTasks");

const progressBar = document.getElementById("progressBar");
const progressPercentage = document.getElementById("progressPercentage");

const todayDateElement = document.getElementById("todayDate");

const filterButtons = document.querySelectorAll(".filter-btn");


/* =========================================
   2. APPLICATION DATA
========================================= */

// Load previously saved tasks safely.

function loadTasks() {

    try {
        const savedTasks = localStorage.getItem("taskFlowTasks");

        if (!savedTasks) {
            return [];
        }

        const parsedTasks = JSON.parse(savedTasks);

        return Array.isArray(parsedTasks) ? parsedTasks : [];

    } catch (error) {
        console.error("Unable to load tasks:", error);
        return [];
    }
}

let tasks = loadTasks();

let currentFilter = "all";


/* =========================================
   3. SAVE TASKS
========================================= */

function saveTasks() {

    try {

        localStorage.setItem(
            "taskFlowTasks",
            JSON.stringify(tasks)
        );

    } catch (error) {

        console.error("Unable to save tasks:", error);

        alert("Your tasks could not be saved. Check browser storage.");
    }
}


/* =========================================
   4. GENERATE TASK ID
========================================= */

function generateId() {

    if (window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }

    return Date.now().toString() +
        Math.random().toString(16).slice(2);
}


/* =========================================
   5. DISPLAY TODAY'S DATE
========================================= */

function displayTodayDate() {

    const today = new Date();

    todayDateElement.textContent =
        today.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        });
}


/* =========================================
   6. UPDATE STATISTICS
========================================= */

function updateStatistics() {

    const total = tasks.length;

    const completed = tasks.filter(
        task => task.completed
    ).length;

    const remaining = total - completed;

    const percentage = total === 0
        ? 0
        : Math.round((completed / total) * 100);

    totalTasksElement.textContent = total;

    completedTasksElement.textContent = completed;

    remainingTasksElement.textContent = remaining;

    progressPercentage.textContent = percentage + "%";

    progressBar.style.width = percentage + "%";

}


/* =========================================
   7. FORMAT DUE DATE
========================================= */

function formatDueDate(dateString) {

    if (!dateString) {
        return "No due date";
    }

    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}


/* =========================================
   8. CREATE TASK ELEMENT
========================================= */

function createTaskElement(task) {

    const li = document.createElement("li");

    li.className = "task-item";

    li.dataset.id = task.id;

    if (task.completed) {
        li.classList.add("completed");
    }

    // Task content

    const content = document.createElement("div");

    content.className = "task-content";

    // Checkbox

    const checkbox = document.createElement("input");

    checkbox.type = "checkbox";

    checkbox.className = "task-checkbox";

    checkbox.checked = task.completed;

    checkbox.setAttribute(
        "aria-label",
        "Mark " + task.text + " as completed"
    );

    // Task details

    const details = document.createElement("div");

    details.className = "task-details";

    const title = document.createElement("p");

    title.className = "task-text";

    title.textContent = task.text;

    // Priority

    const priority = document.createElement("span");

    priority.className = "priority " + task.priority;

    priority.textContent =
        task.priority.charAt(0).toUpperCase() +
        task.priority.slice(1) + " priority";

    // Due date

    const dueDate = document.createElement("span");

    dueDate.textContent = formatDueDate(task.dueDate);

    // Check overdue tasks

    if (
        task.dueDate &&
        task.dueDate < getTodayString() &&
        !task.completed
    ) {

        dueDate.className = "overdue";

        dueDate.textContent =
            "Overdue: " + formatDueDate(task.dueDate);

    } else {

        dueDate.className = "";
    }

    // Task metadata

    const meta = document.createElement("div");

    meta.className = "task-meta";

    meta.appendChild(priority);

    meta.appendChild(dueDate);

    details.appendChild(title);

    details.appendChild(meta);

    content.appendChild(checkbox);

    content.appendChild(details);


    // Action buttons

    const actions = document.createElement("div");

    actions.className = "task-actions";

    const editButton = document.createElement("button");

    editButton.type = "button";

    editButton.className = "action-btn edit-btn";

    editButton.textContent = "Edit";

    editButton.setAttribute("aria-label", "Edit task");


    const deleteButton = document.createElement("button");

    deleteButton.type = "button";

    deleteButton.className = "action-btn delete-btn";

    deleteButton.textContent = "Delete";

    deleteButton.setAttribute("aria-label", "Delete task");


    actions.appendChild(editButton);

    actions.appendChild(deleteButton);


    li.appendChild(content);

    li.appendChild(actions);

    return li;
}


/* =========================================
   9. DISPLAY TASKS
========================================= */

function displayTasks() {

    taskList.innerHTML = "";

    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    // Apply selected filter and search.

    const filteredTasks = tasks.filter(task => {

        const matchesSearch = task.text
            .toLowerCase()
            .includes(searchTerm);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });

    // Display matching tasks.

    filteredTasks.forEach(task => {

        const taskElement = createTaskElement(task);

        taskList.appendChild(taskElement);
    });

    // Empty state.

    emptyMessage.style.display =
        filteredTasks.length === 0 ? "block" : "none";

    // Display matching task count.

    taskCount.textContent =
        `${filteredTasks.length} ${
            filteredTasks.length === 1 ? "task" : "tasks"
        }`;

    // Update statistics.

    updateStatistics();

    // Show clear completed button only when needed.

    const hasCompletedTasks = tasks.some(
        task => task.completed
    );

    clearCompletedBtn.style.display =
        hasCompletedTasks ? "inline-block" : "none";

}


/* =========================================
   10. ADD NEW TASK
========================================= */

taskForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const text = taskInput.value.trim();

    if (!text) {
        alert("Please enter a task name.");
        return;
    }

    const newTask = {

        id: generateId(),

        text: text,

        completed: false,

        priority: taskPriority.value,

        dueDate: taskDate.value,

        createdAt: new Date().toISOString()

    };

    tasks.unshift(newTask);

    saveTasks();

    taskForm.reset();

    taskPriority.value = "medium";

    // Return to All Tasks after adding.

    currentFilter = "all";

    updateFilterButtons();

    displayTasks();

    taskInput.focus();

});


/* =========================================
   11. COMPLETE OR UNCOMPLETE TASK
========================================= */

taskList.addEventListener("change", function(event) {

    if (!event.target.classList.contains("task-checkbox")) {
        return;
    }

    const li = event.target.closest(".task-item");

    if (!li) return;

    const id = li.dataset.id;

    tasks = tasks.map(task => {

        if (task.id === id) {

            return {
                ...task,
                completed: event.target.checked
            };

        }

        return task;
    });

    saveTasks();

    displayTasks();

});


/* =========================================
   12. EDIT AND DELETE TASKS
========================================= */

taskList.addEventListener("click", function(event) {

    const li = event.target.closest(".task-item");

    if (!li) return;

    const id = li.dataset.id;

    // Edit task.

    if (event.target.classList.contains("edit-btn")) {

        const task = tasks.find(
            task => task.id === id
        );

        if (!task) return;

        const updatedText = prompt(
            "Edit your task:",
            task.text
        );

        if (updatedText === null) return;

        const newText = updatedText.trim();

        if (!newText) {
            alert("Task name cannot be empty.");
            return;
        }

        tasks = tasks.map(item => {

            if (item.id === id) {

                return {
                    ...item,
                    text: newText
                };

            }

            return item;
        });

        saveTasks();

        displayTasks();
    }


    // Delete task.

    if (event.target.classList.contains("delete-btn")) {

        const confirmed = confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmed) return;

        tasks = tasks.filter(
            task => task.id !== id
        );

        saveTasks();

        displayTasks();
    }

});


/* =========================================
   13. SEARCH TASKS
========================================= */

searchInput.addEventListener("input", function() {

    displayTasks();

});


/* =========================================
   14. FILTER TASKS
========================================= */

function updateFilterButtons() {

    filterButtons.forEach(button => {

        const isActive =
            button.dataset.filter === currentFilter;

        button.classList.toggle("active", isActive);

        button.setAttribute(
            "aria-pressed",
            String(isActive)
        );

    });

}

filterButtons.forEach(button => {

    button.addEventListener("click", function() {

        currentFilter = this.dataset.filter;

        updateFilterButtons();

        displayTasks();

    });

});


/* =========================================
   15. CLEAR COMPLETED TASKS
========================================= */

clearCompletedBtn.addEventListener("click", function() {

    const completedCount = tasks.filter(
        task => task.completed
    ).length;

    if (completedCount === 0) return;

    const confirmed = confirm(
        `Delete all ${completedCount} completed tasks?`
    );

    if (!confirmed) return;

    tasks = tasks.filter(
        task => !task.completed
    );

    saveTasks();

    displayTasks();

});


/* =========================================
   16. GET TODAY'S DATE
========================================= */

function getTodayString() {

    const today = new Date();

    const year = today.getFullYear();

    const month = String(
        today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
        today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}


/* =========================================
   17. INITIALIZE APPLICATION
========================================= */

displayTodayDate();

updateFilterButtons();

displayTasks();
