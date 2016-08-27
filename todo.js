class Task
{
    constructor(obj)
    {
        if (typeof obj === 'string')
        {
            var today = new Date();

            this._id = today.getTime();
            this._text = obj;
            this._status = 0;
            this._created = (today.getMonth() + 1) + "-" + today.getDate() + "-" + today.getFullYear();
        }
        else
        {
            this._id = obj.id;
            this._text = obj.text;
            this._status = obj.status;
            this._created = obj.created;
        }
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

    set text(text)
    {
        this._text = text;
    }

    set status(status)
    {
        this._status = status;
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
        return new Task(task);
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
    static addTask(text)
    {
        var task = new Task(text);
        data.createTask(task);
        UIController.addTaskToList(task);
    }

    static finishTask(taskid)
    {
        var task = $("#" + taskid);
        var taskObj = data.getTask(taskid);

        if (!task.hasClass("completed"))
        {
            taskObj.status = 1;
        }
        else
        {
            taskObj.status = 0;
        }

        UIController.finishTask(task);
        data.updateTask(taskObj);
    }

    static deleteTask(taskid)
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
        var delButton = $('<span class="fa fa-ban action delete" title="Delete"></span>');
        var doneButton = $('<span id="' + task.id + '-done" class="fa fa-check-circle-o action done" title="Done"></span>');
        var actions = $('<span class="task-actions"></span>');
        var taskDiv = $('<div id="' + task.id + '" style="" class="task"></div>');

        actions.append(delButton);
        actions.append(doneButton);
        taskDiv.append(actions);
        taskDiv.append(task.text);

        if (task.status === 1)
        {
            $("#container_tasks_completed").prepend(taskDiv);
            $("#" + task.id + "-done").removeClass("fa-check-circle-o").addClass("fa-check-circle");
            taskDiv.addClass("completed");
        }
        else $("#container_tasks_uncompleted").prepend(taskDiv);

        taskDiv.hide();
        taskDiv.fadeIn(500);
        $("#input_task_text").val('');
    }

    static finishTask(task)
    {
        if (!task.hasClass("completed"))
        {
            task.addClass("completed");
            $("#" + task.attr("id") + "-done").removeClass("fa-check-circle-o").addClass("fa-check-circle");
            task.fadeOut(function() {
                task.remove().appendTo("#container_tasks_completed").fadeIn();
            });
        }
        else
        {
            task.removeClass("completed");
            $("#" + task.attr("id") + "-done").removeClass("fa-check-circle").addClass("fa-check-circle-o");
            task.fadeOut(function() {
                task.remove().appendTo("#container_tasks_uncompleted").fadeIn();
            });
        }
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

    static showCompletedTasks()
    {
        if ($("#container_tasks_completed").is(":visible"))
        {
            $("#btn_show_completed > .ui-button").text("Show completed tasks");
            $("#container_tasks_completed").fadeOut(500);
        }
        else
        {
            $("#btn_show_completed > .ui-button").text("Hide completed tasks");
            $("#container_tasks_completed").fadeIn(500);
        }
    }
}

var data = new Data();

$( document ).ready(function() {

    UIController.updateList();

    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .task-actions > .action.delete", function() {
        var taskid = $(this).closest(".task").attr("id");
        var taskTitle = $("#"+ taskid).text();
        var message = "Are you sure you want to delete this task?<br><br><b><i>" + taskTitle + "</i></b>";
        UIController.confirmDialog(message, TaskController.deleteTask, taskid);
    });

    $("#container_tasks_uncompleted, #container_tasks_completed").on("click", ".task > .task-actions > .action.done", function() {
        var taskid = $(this).closest(".task").attr("id");
        TaskController.finishTask(taskid);
    });

    $(".action.add").on("click", function() {
        var text = $("#input_task_text").val();
        if (text !== "") TaskController.addTask(text);
    });

    $("#btn_show_completed > button").on("click", function() {
        UIController.showCompletedTasks();
    });

});

