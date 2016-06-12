import os

if "BIND" not in os.environ:
    bind = "127.0.0.1:8080"
else:
    bind = os.environ["BIND"]

worker_class = "gevent"
workers = 1

accesslog = "-"
errorlog = "-"
loglevel = "info"
