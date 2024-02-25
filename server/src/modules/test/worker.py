def main(on, emit, log):
    on('calc', lambda num: (
        log('Received calc event'), 
        emit('res', num + 1)
    ))