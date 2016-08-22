var data = JSON.parse(localStorage.getItem("todoData"));
data = data || {};

// -------------------------------------------------
// PARAMS: string title, string desc
// RETURNS: task object
// -------------------------------------------------
function createTask(text)
{
  // Generate ID and return JSON object
  today = new Date();

  id = today.getTime();

  todaysDate = (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear();

  return {id: id, text: text, status: 0, created: todaysDate}
}

// -------------------------------------------------
// PARAMS: task - task object returned from createTask
// Adds given task to data array and localStorage
// -------------------------------------------------
function addTaskToData(task)
{
  // Add task to localStorage
  data[task.id] = task;

  pushDataToLocalStorage();
}

// -------------------------------------------------
// PARAMS: task - task object to add to list
// Creates and displays HTML associated with task object
// -------------------------------------------------
function addTaskToList(task)
{
  // Create the delete button
  var delButton = $("<span>", {
	class: "fa fa-ban action delete",
	title: "Delete"});

  // Create done button
  var doneButton = $("<span>", {
    id: task.id + "-done",
	class: "fa fa-check-circle-o action done",
	title: "Done"});

  // Create task div
  var taskDiv = $("<div>", {
    id: task.id,
	style: "",
	class: "task"});

  taskDiv.append(delButton);
  taskDiv.append(doneButton);

  taskDiv.append(task.text);

  // If task is stored as completed
  if (task.status === 1)
  {
    $("#container_tasks_completed").append(taskDiv);
    $("#" + taskid + "-done").removeClass("fa-check-circle-o").addClass("fa-check-circle");
	taskDiv.addClass("completed");
	$("#" + taskid + " .description, #" + taskid + " h4").hide();

  }
  else
	$("#container_tasks_uncompleted").append(taskDiv);

  taskDiv.hide();
  taskDiv.fadeIn(500)
}

// -------------------------------------------------
// PARAMS: string title, string desc
// RETURNS: task object
// -------------------------------------------------
function btn_addNewTask(text)
{
    // Don't add a task w/ no text
    if (text === "") return;

    // Create task, add to data + html
    task = createTask(text);
    addTaskToData(task);
    addTaskToList(task);

    // Clear form
    $("#task-text").val('');
}

// -------------------------------------------------
// Clears list as well as localStorage
// -------------------------------------------------
function btn_deleteAllTasks()
{
    // Clear list and localStorage
    localStorage.clear();
    data = {};
    clearAllTasks();
}

// -------------------------------------------------
// PARAMS:
//  message - the text to display in the prompt
//  callback - function to call if user hits OK
//  args - arguments to pass to callback function
// Create a jQuery UI dialog-based prompt
// -------------------------------------------------
function ui_confirmDialog(message, callback, args)
{
    var dialog = $("<div>" + message + "</div>");

	dialog.dialog({
	    dialogClass: "no-close",
	    resizable: false,
	    height: "auto",
	    width: 400,
	    modal: true,
	    buttons: {
	        OK: function () {
	            $(this).dialog("close");
	            callback(args);
	        },
	        Cancel: function () {
	            $(this).dialog("close");
	        }
	    }
	});

}

// -------------------------------------------------
// PARAMS: taskid - id of task to delete
// Removes task with associated id from data
// Pushes updated data to localStorage
// -------------------------------------------------
function btn_deleteTask(taskid)
{
	var taskObj = $("#" + taskid);

	taskObj.addClass("deleting");

    // Remove the task from the data array
    delete data[taskid];

    // Push data to localStorage
    pushDataToLocalStorage();

    // Remove corresponding div from list
   taskObj.fadeOut(500);
}

// -------------------------------------------------
// PARAMS: id of task to mark done
// Collapses task's div and highlights it green to
// indicate the task has been completed
// -------------------------------------------------
function btn_finishTask(taskid)
{
  var task = $("#" + taskid);

  // If the task is not already marked completed...
  if (!task.hasClass("completed"))
  {
	task.addClass("completed");
	// Change the checkmark circle icon from open to filled to further indicate task completion
	$("#" + taskid + "-done").removeClass("fa-check-circle-o").addClass("fa-check-circle");

	// Fade out the task and fade it back in under the 'completed tasks' section
	task.fadeOut(function() {
		task.remove().appendTo("#container_tasks_completed").fadeIn();
	});

	// Store completion status in localStorage data
	data[taskid].status = 1;
  }
  // If the task is already marked as completed
  else
  {
	// Remove 'completed' class and change checkmark circle icon from filled to open
	task.removeClass("completed");
	$("#" + taskid + "-done").removeClass("fa-check-circle").addClass("fa-check-circle-o");

	task.fadeOut(function() {
		task.remove().appendTo("#container_tasks_uncompleted").fadeIn();
	});

	// Store completion status in localStorage data
	data[taskid].status = 0;
  }

  // Push data to localStorage
  pushDataToLocalStorage();
}

// -------------------------------------------------
// PARAMS:
//   completed - boolean, if true clear completed tasks
//   uncompleted - boolean, if true clear uncompleted tasks
// Clears out HTML list of tasks (DOES NOT UPDATE localStorage)
// -------------------------------------------------
function clearList(completed, uncompleted)
{
	if (completed)
	{
		$("#container_tasks_completed").find('*').not('.header').remove();
	}

	if (uncompleted)
	{
		$("#container_tasks_uncompleted").find('*').not('.header').remove();
	}
}

// Clears only completed tasks
function clearCompletedTasks()
{
    clearList(true, false);
}

// Clears only uncompleted tasks
function clearUncompletedTasks()
{
    clearList(false, true);
}

// Clears all tasks
function clearAllTasks()
{
    clearList(true, true);
}

// -------------------------------------------------
// Clears HTML list and updates it with data currently
// in localStorage
// -------------------------------------------------
function updateList()
{
  // Clear list
  clearAllTasks();

  // Repopulate with tasks from data
  for (taskid in data)
  {
    addTaskToList(data[taskid]);
  }
}

function pushDataToLocalStorage()
{
    localStorage.setItem("todoData", JSON.stringify(data));
}

// DOCUMENT.READY
$( document ).ready(function() {
    var data = {};

    // Initalize list from localStorage
    updateList();

    // Keep add task form with you as you scroll
    $(window).scroll(function() {
      $("#add_task_container").animate({"marginTop": ($(window).scrollTop() + 5) + "px"}, 0);
    });

    // Click handler for delete task button
    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .action.delete", function() {
        var taskid = $(this).parent()[0].id;
        var taskTitle = $("#"+ taskid).text();

        var message = "Are you sure you want to delete this task?<br><br><b><i>" + taskTitle + "</i></b>";

        ui_confirmDialog(message, btn_deleteTask, taskid);

    });

    // Click handler for finish task button
    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .action.done", function() {
        var taskid = $(this).parent()[0].id;

        btn_finishTask(taskid);
    });

    // Click handler for delete all tasks button
    $(".action.clear").on("click", function() {
        ui_confirmDialog("Are you sure you want to delete all tasks?", btn_deleteAllTasks, null);
    });

    // Click handler for add new task button
    $(".action.add").on("click", function() {
        btn_addNewTask($("#task-text").val());
    });

}); // END DOCUMENT.READY

