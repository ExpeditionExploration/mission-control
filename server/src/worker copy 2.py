import sys
import json
import threading
import importlib.util

worker_path = sys.argv[1]
payload_identifier = sys.argv[2]

spec = importlib.util.spec_from_file_location('worker', worker_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

events = {}

def on(event, callback):
    if event not in events:
        events[event] = []

    events[event].append(callback)

def emit(event, data):
    print(f"{payload_identifier}{json.dumps({'action': 'event', 'event': event, 'data': data}, indent=0)}", flush=True)

def log(data):
    print(f"{payload_identifier}{json.dumps({'action': 'log', 'data': data}, indent=0)}", flush=True)

# Load the worker
def startWorker():
    module.main(on , emit, log)


def run_callback_in_thread(callback, data):
    # Define a new function that wraps the callback and ends the thread when done
    def thread_function():
        callback(data)
        threading.current_thread().exit()

    # Start a new thread that runs the thread_function
    threading.Thread(target=thread_function).start()

# Listen for incoming data from the parent process
def listenForData():
    for line in sys.stdin:
        line = line.rstrip()

        try:
            payload = json.loads(line)

            # Adding this causes the worker to hang sometimes for some reason
            # It might be because the worker is blocking the event loop, but I'm not sure
            # It doesn't make sense because the because it seems like the event runs multiple times.
            # log(f"Received payload: {json.dumps(payload, indent=4)}") 
            # print(f"Received payload: {json.dumps(payload, indent=4)}")

            event = payload.get('event')
            
            if event in events:
                for callback in events[event]:
                    run_callback_in_thread(callback, payload.get('data'))
                    # callback(payload.get('data'))

        except json.JSONDecodeError as e:
            print(f"Invalid JSON: {e}")
            continue

thread1 = threading.Thread(target=startWorker)
thread2 = threading.Thread(target=listenForData)

thread1.start()
thread2.start()
