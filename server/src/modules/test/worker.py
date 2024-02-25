
print('worker.py loaded')
def main(on, emit, log):
    print('worker.py started')
    on('calc', lambda num: (
        log('Received calc event'), 
        emit('res', num + 1)
    ))