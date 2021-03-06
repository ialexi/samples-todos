# We will need JSON support
try: import simplejson as json # If simplejson is installed, use that
except ImportError: import json # otherwise, in Python 2.6+, use built-in

# Import our model
from models import Task

# Response Mechanisms
from django.shortcuts import get_object_or_404
from django.http import HttpResponseRedirect, HttpResponse

# 
# FIRST: some helpers
#
def task_guid(task):
	""" Returns a GUID for a task (in URL format because SC wants that) """
	return "/task/" + str(task.id)

def task_to_raw(task):
	""" Converts a task to a dictionary """
	return {
		"guid": task_guid(task),
		"description": task.description,
		"isDone": task.is_done,
		"order": task.order
	}



def raw_to_task(raw, task):
	""" Applies a raw dictionary to a task """
	if "description" in raw: task.description = raw["description"]
	if "isDone" in raw: task.is_done = raw["isDone"]
	if "order" in raw: task.order = raw["order"]

	
# NOW: the views.
def tasks(request):
	# tasks supports GET and POST
	if request.method == "GET":
		# GET should return all of the tasks
		# first, create a list of tasks
		raw_tasks = []
		for task in Task.objects.all():
			raw_tasks.append(task_to_raw(task))
		
		# now, create and return json (remember, front-end wants it in "contents")
		return_data = {
			"content": raw_tasks
		}
		
		return HttpResponse(json.dumps(return_data), mimetype="application/json")
	
	elif request.method == "POST":
		# Create a Task
		task = Task()
		
		# Load data
		raw = json.loads(request.raw_post_data)
		raw_to_task(raw, task)
		
		# attempt to save
		task.save()
		
		# return just the plain hash
		# returning Location header causes problems
		response = HttpResponse(
			json.dumps({"content":task_to_raw(task)})
		)
		response.status = 201
		return response

def task(request, taskid):
	# In any case, we need that task, so get it or 404:
	task = get_object_or_404(Task, pk=int(taskid))
	
	if request.method == "GET":
		pass # do nothing-- the default action will suffice
	elif request.method == "PUT":
		raw = json.loads(request.raw_post_data)
		raw_to_task(raw, task)
		task.save()
	elif request.method == "DELETE":
		task.delete()
		return HttpResponse("") # return empty response, I suppose
	
	# Default action: not much
	return HttpResponse(
	  json.dumps({"content": task_to_raw(task)}), 
	  mimetype="application/json")


# ROOTS PUSH COMET!!!!
# Import cornelius's Dudley
from cornelius import dudley
def connect(request, uid):
	paths = json.loads(request.raw_post_data)
	dudley.connect(uid, paths)

def disconnect(request, uid):
	paths = json.loads(request.raw_post_data)
	dudley.connect(uid, paths)

# Comet alerters
from django.db.models.signals import post_save, post_delete
def task_saved(sender, **kwargs):
	try:
		instance = kwargs["instance"]
		dudley.update("tasks", json.dumps(task_to_raw(instance)))
	except:
		pass

def task_destroyed(sender, **kwargs):
	try:
		instance = kwargs["instance"]
		data = task_to_raw(instance)
		data["DELETE"] = True
		dudley.update("tasks", json.dumps(data))
	except:
		pass
post_save.connect(task_saved, sender=Task)
post_delete.connect(task_destroyed, sender=Task)