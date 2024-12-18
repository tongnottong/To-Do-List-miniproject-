const deleteUserBtn = document.getElementById('delete-user-btn');
let currentUser = null;

async function fetchUsers() {
  try {
    const response = await fetch('/users');
    const users = await response.json();
    const nameList = document.getElementById('name-list');
    nameList.innerHTML = '';

    users.forEach(user => {
      const li = document.createElement('li');
      li.textContent = user.name;
      li.onclick = () => selectUser(user._id, user.name);
      nameList.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching users:', err);
  }
}

function selectUser(userId, userName) {
  currentUser = userId;
  document.getElementById('selected-name').textContent = `${userName}'s Tasks`;
  fetchTasks(userId);
  deleteUserBtn.disabled = false; 
  fetchTasks(userId);

}

async function fetchTasks(userId) {
  try {
    const response = await fetch(`/tasks/${userId}`);
    const tasks = await response.json();
    const taskList = document.getElementById('task-list');
    taskList.innerHTML = '';

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span class="task-title">${task.title} ${task.completed ? '(Completed)' : ''}</span>
        ${!task.completed ? `<button class="complete-btn" onclick="completeTask('${task._id}')">Complete</button>` : ''}
        <button class="delete-btn" onclick="deleteTask('${task._id}')">Delete</button>
      `;
      taskList.appendChild(li);
    });
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
}


document.getElementById('add-name-btn').addEventListener('click', async () => {
  const nameInput = document.getElementById('name-input');
  const name = nameInput.value.trim();

  if (name) {
    try {
      await fetch('/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      fetchUsers();
      nameInput.value = '';
    } catch (err) {
      console.error('Error adding user:', err);
    }
  }
});

document.getElementById('add-task-btn').addEventListener('click', async () => {
  if (currentUser) {
    const taskInput = document.getElementById('task-input');
    const taskTitle = taskInput.value.trim();

    if (taskTitle) {
      try {
        await fetch(`/tasks/${currentUser}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: taskTitle }),
        });
        taskInput.value = '';
        fetchTasks(currentUser);
      } catch (err) {
        console.error('Error adding task:', err);
      }
    }
  }
});

async function completeTask(taskId) {
  try {
    // Mark the task as completed in the backend
    await fetch(`/tasks/${taskId}`, { method: 'PUT' });

    // Fetch tasks again to update the UI
    fetchTasks(currentUser);

    // Find the task item and remove the "Complete" button
    const taskList = document.getElementById('task-list');
    const taskItem = Array.from(taskList.children).find((li) =>
      li.innerHTML.includes(`onclick="completeTask('${taskId}')"`));

    if (taskItem) {
      const completeButton = taskItem.querySelector('.complete-btn');
      if (completeButton) {
        completeButton.remove();
      }
    }
  } catch (err) {
    console.error('Error completing task:', err);
  }
}


async function deleteTask(taskId) {
  try {
    await fetch(`/tasks/${taskId}`, { method: 'DELETE' });
    fetchTasks(currentUser);
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}

deleteUserBtn.addEventListener('click', async () => {
  if (currentUser) {
    const confirmDelete = confirm(
      'Are you sure you want to delete this user and all their tasks?'
    );

    if (confirmDelete) {
      try {
        await fetch(`/users/${currentUser}`, { method: 'DELETE' });
        currentUser = null;
        document.getElementById('selected-name').textContent =
          'Select a name to manage tasks';
        document.getElementById('task-list').innerHTML = '';
        deleteUserBtn.disabled = true;
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
      }
    }
  }
});



fetchUsers();
