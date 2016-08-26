class Task
{
    constructor(id, text, status, created)
    {
        this._id = id;
        this._text = text;
        this._status = status;
        this._created = created;
    }

    get id()
    {
        return this._id;
    }
    get text()
    {
        return this._text;
    }

    get status()
    {
        return this._status;
    }

    get created()
    {
        return this._created;
    }

    set id(id)
    {
        this._id = id;
    }

    set text(text)
    {
        this._text = text;
    }

    set status(status)
    {
        this._status = status;
    }

    set created(created)
    {
        this._created = created;
    }

    toJSON()
    {
        return {id: this._id, text: this._text, status: this._status, created: this._created};
    }

}

class Data
{
    constructor()
    {
        this._data = JSON.parse(localStorage.getItem("todoData"));
        this._data = this._data || {};
    }

    _pushDataToLocalStorage()
    {
        localStorage.setItem("todoData", JSON.stringify(this._data));
    }

    createTask(task)
    {
        this._data[task.id] = task.toJSON();
        this._pushDataToLocalStorage();
    }

    deleteTask(taskid)
    {
        delete this._data[taskid];
        this._pushDataToLocalStorage();
    }

    updateTask(task)
    {
        this._data[task.id] = task.toJSON();
        this._pushDataToLocalStorage();
    }

    getTask(taskid)
    {
        var task = this._data[taskid];

        return new Task(task.id, task.text, task.status, task.created);
    }

    getAllTasks()
    {
        var arr = {};

        for (var id in this._data)
        {
            arr[id] = this.getTask(id);
        }

        return arr;
    }
}

class TaskController
{
    static AddTask(text)
    {
        // Generate ID and created date
        var today = new Date();
        var id = today.getTime();
        var todaysDate = (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear();

        var task = new Task(id, text, 0, todaysDate);

        // Add task to 'database'
        data.createTask(task);
        UIController.addTaskToList(task);
    }

    static FinishTask(taskid)
    {
        var task = $("#" + taskid);
        var taskObj = data.getTask(taskid);

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

            taskObj.status = 1;
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
            taskObj.status = 0;
        }

        data.updateTask(taskObj);
    }

    static DeleteTask(taskid)
    {
        var task = $("#" + taskid);

        task.addClass("deleting");

        data.deleteTask(taskid);

        task.fadeOut(500);
    }
}

class UIController
{

    static addTaskToList(task)
    {
        // Create and add task to view
        var delButton = $("<span>", {
        class: "fa fa-ban action delete",
        title: "Delete"});

        var doneButton = $("<span>", {
        id: task.id + "-done",
        class: "fa fa-check-circle-o action done",
        title: "Done"});

        var actions = $("<span>", {
        class: "task-actions"
        });

        var taskDiv = $("<div>", {
        id: task.id,
        style: "",
        class: "task"});

        actions.append(delButton);
        actions.append(doneButton);
        taskDiv.append(actions);
        taskDiv.append(task.text);

        // If task is stored as completed
        if (task.status === 1)
        {
            $("#container_tasks_completed").prepend(taskDiv);
            $("#" + task.id + "-done").removeClass("fa-check-circle-o").addClass("fa-check-circle");
            taskDiv.addClass("completed");
        }
        else $("#container_tasks_uncompleted").prepend(taskDiv);

        taskDiv.hide();
        taskDiv.fadeIn(500)
        $("#input_task_text").val('');
    }

    static confirmDialog(message, callback, args)
    {
        var dialog = $("<div>" + message + "</div>");

        dialog.dialog({
            dialogClass: "no-close",
            resizable: false,
            height: "auto",
            width: "90%",
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

    static updateList()
    {
        var tasks = data.getAllTasks();

        if (tasks === undefined) return;

        for (var id in tasks)
        {
            this.addTaskToList(tasks[id]);
        }
    }

}

var data = new Data();
var uic = new UIController();

// DOCUMENT.READY
$( document ).ready(function() {

    UIController.updateList();

    // Click handler for delete task button
    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .task-actions > .action.delete", function() {
        var taskid = $(this).closest(".task").attr("id");
        var taskTitle = $("#"+ taskid).text();
        var message = "Are you sure you want to delete this task?<br><br><b><i>" + taskTitle + "</i></b>";

        UIController.confirmDialog(message, TaskController.DeleteTask, taskid);

    });

    // Click handler for finish task button
    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .task-actions > .action.done", function() {
        var taskid = $(this).closest(".task").attr("id");

        TaskController.FinishTask(taskid);
    });

    // Click handler for add new task button
    $(".action.add").on("click", function() {
        var text = $("#input_task_text").val();

        if (text !== "") TaskController.AddTask(text);
    });

    // Click handler for show completed tasks button
    $("#btn_show_completed > button").on("click", function() {
        if ($("#container_tasks_completed").is(":visible"))
        {
            $(this).text("Show completed tasks");
            $("#container_tasks_completed").fadeOut(500);
        }
        else
        {
            $(this).text("Hide completed tasks");
            $("#container_tasks_completed").fadeIn(500);
        }
    });

}); // END DOCUMENT.READY

