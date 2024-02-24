
# print('worker.py loaded')
def worker(on, emit, log):
    on('calc', lambda num: emit('res', num + 1))