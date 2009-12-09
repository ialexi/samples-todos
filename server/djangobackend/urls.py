from django.conf.urls.defaults import *

urlpatterns = patterns('',
	# You don't have to do it this way, but in this example, we match
	# optional ending slashes.
	(r'^tasks/?$', "todos.views.tasks"),
	(r'^task/(?P<taskid>[0-9]+)$', "todos.views.task"),
	(r'^tasks/connect/(?P<uid>[^\s]+)$', "todos.views.connect"),
	(r'^tasks/disconnect/(?P<uid>[^\s]+)$', "todos.views.disconnect")
)
