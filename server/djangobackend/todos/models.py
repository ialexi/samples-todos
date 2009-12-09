from django.db import models
from cornelius import dudley

# Create your models here.
class Task(models.Model):
	"""Our Task Model"""
	description = models.TextField(blank=True)
	is_done = models.BooleanField(default=False)
	order = models.IntegerField(default=0)
	
	def __unicode__(self):
		return u"Task"
