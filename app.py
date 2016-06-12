import json
import logging
import os

import gevent.queue

import flask


app = flask.Flask(__name__)
logger = logging.getLogger(__name__)
secret = os.environ["SECRET"]

current_sinks = []
current_title = u"Still Untitled!"


@app.route("/")
def root():
    return flask.render_template("root.html")


@app.route("/overlay")
def overlay():
    return flask.render_template("overlay.html", title=current_title)


@app.route("/params", methods=["GET"])
def params_get():
    return flask.render_template("params.html")


@app.route("/params", methods=["POST"])
def params_post():
    if flask.request.form["secret"] != secret:
        return "Invalid secret", 401

    global current_title
    current_title = flask.request.form["title"]
    for sink in current_sinks:
        sink.put(_js_set_title(current_title))

    return "<!doctype html><body>OK, <a href=/overlay>Overlay</a></body>", 200, {
        "content-type": "text.html",
    }


@app.route("/stream-title", methods=["POST"])
def stream_title_post():
    if flask.request.form["secret"] != secret:
        return "Invalid secret", 401

    global current_title
    current_title = flask.request.form["title"]
    for sink in current_sinks:
        sink.put(_js_set_title(current_title))

    return "ok", 200


@app.route("/events")
def events():
    def gen():
        q = gevent.queue.Queue()
        current_sinks.append(q)

        yield _evt_eval(_js_set_title(current_title))

        try:
            while True:
                try:
                    item = q.get(timeout=10)
                except gevent.queue.Empty:
                    yield ": keepalive\n\n"
                else:
                    yield _evt_eval(item)
        finally:
            current_sinks.remove(q)

    return flask.Response(gen(), mimetype="text/event-stream")


def _evt_eval(code):
    return "event: eval\ndata: %s\n\n" % json.dumps(code)


def _js_wrap(code):
    return "!function() { %s }();" % code


def _js_set_text(selector, text):
    return _js_wrap(
        """
        var elemSet = document.querySelectorAll(%s);
        for (var i = 0; i < elemSet.length; ++i) {
            var el = elemSet[i];
            el.textContent = %s;
        }
        """ % (json.dumps(selector), json.dumps(text))
    )

def _js_set_title(title):
    return _js_set_text(".stripe-title", title)
