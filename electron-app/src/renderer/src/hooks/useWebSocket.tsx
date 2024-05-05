import { WsResponse } from '@nestjs/websockets'
import { useEffect, useRef, useState } from 'react'

export function useWebSocket({ reconnectTimeout = 5000 } = {}) {
    const [event, setEvent] = useState<null | WsResponse>(null)
    const ref = useRef<null | WebSocket>(null)

    useEffect(() => {
        if (ref.current) return

        console.log('Connecting websocket', ref.current)
        function disconnect() {
            if (ref.current) {
                console.log('Disconnecting websocket', ref.current)
                ref.current.onclose = null
                ref.current.onopen = null
                ref.current.onmessage = null
                ref.current.close()
                ref.current = null
            }
        }

        function connect() {
            disconnect()

            const websocket = new WebSocket(`ws://${window.location.hostname}:16501`)
            websocket.onopen = () => {
                console.log('Connected to server')
            }
            websocket.onmessage = (event) => {
                console.log('Received:', event.data)

                try {
                    const payload: WsResponse = JSON.parse(event.data)
                    if (payload.event && payload.data) {
                        setEvent(payload)
                    }
                } catch (error) {
                    console.error('Failed to parse data:', error)
                }
            }
            websocket.onerror = (error) => {
                console.error('Failed to connect:', error)
                if (reconnectTimeout > 0) setTimeout(() => connect(), reconnectTimeout)
            }
            websocket.onclose = () => {
                console.log('Disconnected from server')
                if (reconnectTimeout > 0) setTimeout(() => connect(), reconnectTimeout)
            }
            ref.current = websocket
        }

        connect()
        return () => disconnect()
    }, [])

    return event
}
