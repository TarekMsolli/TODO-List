document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const taskList = document.getElementById('taskList');

    loadTasks();

    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask(taskInput.value);
            taskInput.value = '';
        }
    });

    function addTask(taskText, state = 'default') {
        if (taskText.trim() === '') return;

        const li = createTaskElement(taskText, state);
        taskList.appendChild(li);

        saveTasks();
    }

    function createTaskElement(taskText, state) {
        const li = document.createElement('li');
        li.draggable = true;

        const toggle = document.createElement('span');
        toggle.classList.add('toggle', state);
        toggle.addEventListener('click', () => {
            toggleTaskState(toggle);
            saveTasks();
        });

        const taskContent = document.createElement('span');
        taskContent.textContent = taskText;

        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = 'x';
        deleteBtn.classList.add('delete');
        deleteBtn.addEventListener('click', () => {
            taskList.removeChild(li);
            saveTasks();
        });

        li.appendChild(toggle);
        li.appendChild(taskContent);
        li.appendChild(deleteBtn);

        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);

        return li;
    }

    function saveTasks() {
        const tasks = [];
        taskList.querySelectorAll('li').forEach(li => {
            const taskText = li.querySelector('span:nth-child(2)').textContent;
            const toggleState = li.querySelector('.toggle').classList[1];
            tasks.push({ text: taskText, state: toggleState });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function loadTasks() {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        tasks.forEach(task => addTask(task.text, task.state));
    }

    function toggleTaskState(toggle) {
        const states = ['default', 'done', 'doing', 'cancelled'];
        let currentIndex = states.indexOf(toggle.classList[1]);
        toggle.classList.remove(states[currentIndex]);
        currentIndex = (currentIndex + 1) % states.length;
        toggle.classList.add(states[currentIndex]);
    }

    let draggedItem = null;

    function handleDragStart(e) {
        draggedItem = e.target;
        setTimeout(() => e.target.classList.add('dragging'), 0);
    }

    function handleDragOver(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const items = Array.from(taskList.querySelectorAll('li:not(.dragging)'));
        const closestItem = items.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = e.clientY - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;

        if (closestItem) {
            taskList.insertBefore(draggingItem, closestItem);
        } else {
            taskList.appendChild(draggingItem);
        }
    }

    function handleDrop(e) {
        e.preventDefault();
        e.target.classList.remove('dragging');
        saveTasks();
    }

    function handleDragEnd(e) {
        e.target.classList.remove('dragging');
        saveTasks();
    }
});
