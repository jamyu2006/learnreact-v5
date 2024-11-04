import useWebSocket from 'react-use-websocket'

export function Home({username}) {

    const WS_URL = 'ws://127.0.0.1:8000'
    console.log(WS_URL);
    const { sendJsonMessage } = useWebSocket(WS_URL, {
        queryParams: {username},
    })

    return <h1>Hello {username}</h1>
}