import os
from django.conf import settings

from icecream import IceCreamDebugger

ic = IceCreamDebugger(prefix='')
ic.disable()

if settings.DEBUG:
  ic.enable()
