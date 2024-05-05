import { Button } from '@carbon/react'
import { useWebSocket } from './hooks/useWebSocket'
import { useEffect, useState } from 'react'

export function Window(): JSX.Element {
    // const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')
    const [RootComponent, setRootComponent] = useState(() => DefaultComponent)
    const event = useWebSocket()

    useEffect(() => {
        window.electron.ipcRenderer.on('init', (event, message) => {
            console.log('Component Path:', message)
            import(message.view)
                .then((module) => {
                    console.log('Module:', module.default)
                    setRootComponent(() => module.default)
                })
                .catch((error) => {
                    console.error('Error:', error)
                })
        })
    }, [])
    console.log('Event:', event)
    return (
        <>
            <RootComponent />
        </>
    )
}

function DefaultComponent() {
    return (
        <>
            Hello People
            <Button />
        </>
    )
}
