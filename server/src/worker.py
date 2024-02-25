import sys
import json
# import threading
import socket
import importlib.util

print(f"{sys.argv[0]} {sys.argv[1]} {sys.argv[2]}")

worker_path = sys.argv[1]
socket_port = int(sys.argv[2])

spec = importlib.util.spec_from_file_location('worker', worker_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

worker = {
    'socket': None,
    'events': {},
    'on': lambda event, callback: worker['events'].setdefault(event, []).append(callback),
    'emit': lambda event, data: worker['socket'].sendall(json.dumps({'event': event, 'data': data}).encode()),
    'log': lambda data: worker['socket'].sendall(json.dumps({'log': data}).encode())
}

# Setup IPC socket

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    try:
        s.bind(('localhost', socket_port))
        s.listen()
        print(f"Listening on port {socket_port}")
        conn, addr = s.accept()

        worker['socket'] = conn
        module.main(worker['on'], worker['emit'], worker['log'])
        
        with conn:
            print(f"Connected by {addr}")
        
            data_buffer = b''
            while True:
                data = conn.recv(1024)
                if data:
                    data_buffer += data
                    # Implement logic to check if the end of message has been reached if necessary
                else:
                    break
        
            payload = {}
            try:
                payload = json.loads(data_buffer)
            except json.JSONDecodeError as e:
                print(f"Invalid JSON: {e}")
            
            print(f"Received payload: {json.dumps(payload, indent=4)}")
            # event = payload.get('event')

            # if event:
            #     callbacks = worker['events'].get(event)
            #     if callbacks:
            #         for callback in callbacks:
            #             callback(payload.get('data'))
    finally:
        print('Closing socket')
        s.close()

# thread1 = threading.Thread(target=startWorker)
# thread2 = threading.Thread(target=listenForData)

# thread1.start()
# thread2.start()
