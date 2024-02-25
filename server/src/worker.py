import sys
import json
import importlib.util
import asyncio
import websockets

worker_path = sys.argv[1]
websocket_port = int(sys.argv[2])

spec = importlib.util.spec_from_file_location('worker', worker_path)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

worker = {
    'websocket': None,
    'events': {},
    'on': lambda event, callback: worker['events'].setdefault(event, []).append(callback),
    'emit': lambda event, data: asyncio.create_task(worker['websocket'].send(json.dumps({'action': 'event', 'event': event, 'data': data}, indent=0))),
    'log': lambda data: asyncio.create_task(worker['websocket'].send(json.dumps({'action': 'log', 'data': data}, indent=0)))
}

is_initialized = False
async def start_websocket():
    uri = f"ws://localhost:{websocket_port}"
    async with websockets.connect(uri) as websocket:
        worker['websocket'] = websocket
        # TODO Add reconnect logic

        # Only initialize the worker once when the WebSocket connection is established
        # We only want to initialize the worker once the websocket is connected
        if not is_initialized:
            module.main(worker['on'], worker['emit'], worker['log'])

        # Wait for incoming requests
        async for message in websocket:
            payload = json.loads(message)

            event = payload.get('event')
            if event in worker['events']:
                for callback in worker['events'][event]:
                    callback(payload.get('data'))

try:
    asyncio.run(start_websocket())
except KeyboardInterrupt:
    sys.exit(0)