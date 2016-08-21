var data = JSON.parse(localStorage.getItem("todoData"));
data = data || {};

// -------------------------------------------------
// PARAMS: string title, string desc
// RETURNS: task object
// -------------------------------------------------
function createTask(title, desc)
{
  // Generate ID and return JSON object
  today = new Date();

  id = today.getTime();

  todaysDate = (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear();

  return {id: id, title: title, desc: desc, status: 0, created: todaysDate}
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

  taskDiv.append("<h3>" + task.title + "</h3><h4>Created: " + task.created + "</h4><span class='description' style=''>" + task.desc + "</span>");

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
function btn_addNewTask(title, desc)
{
    task = createTask(title, desc);
    addTaskToData(task);
    addTaskToList(task);
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

function ui_confirmDialog(message, callback, params)
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
	            callback(params);
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
    $("#" + taskid).fadeOut(500);
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

	// Slide up task description and add 'completed' class to it
    $("#" + taskid + " .description, #" + taskid + " h4").slideUp();

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

	// Slide down the description
	$("#" + taskid + " .description, #" + taskid + " h4").slideDown();

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

        console.log(taskid)

        ui_confirmDialog("Are you sure you want to delete this task?", btn_deleteTask, taskid);
    });

    // Click handler for finish task button
    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .action.done", function() {
        var taskid = $(this).parent()[0].id;

        btn_finishTask(taskid);
    });

    $(".action.clear").on("click", function() {
        ui_confirmDialog("Are you sure you want to delete all tasks?", btn_deleteAllTasks, null);
    })

}); // END DOCUMENT.READY

