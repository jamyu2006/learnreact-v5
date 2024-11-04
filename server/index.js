const http = require('http')
const { WebSocketServer } = require('ws')
const url = require('url')
const uuidv4 = require('uuid').v4

const server = http.createServer()
const wsServer = new WebSocketServer({server})
const port = 8000

const connections = {}
const users = {}

const broadcast = () => {
    Object.keys(connections).forEach(uuid => {
        const connection = connections[uuid]
        const message = JSON.stringify(users)
        connection.send(message)
    })
}

//message = state
const handleMessage = (bytes,uuid) => {
    //everytime the cursor moves the handleMessage is probably gonna recieve a json
    //message = {"x": 0, "y": 100}
    //user
    //user.state.x = message.x
    //user.state.y = message.y
    //user.state = message

    const message = JSON.parse(bytes.toString())
    const user = users[uuid]
    user.state = message

    broadcast()
    console.log(`${users[uuid].username} updated their state: ${JSON.stringify(users[uuid].state)}`)
}

const handleClose = (uuid) => {

    console.log(`${users[uuid].username} disconnected`)

    delete connections[uuid]
    delete users[uuid]

    //more productive version:
    //user is gone = username

    broadcast()
}


wsServer.on("connection", (connection,request) => {
    // ws://localhost:8000?username=James
    const {username} = url.parse(request.url, true).query
    const uuid = uuidv4()
    console.log(username)
    console.log(uuid)

    //broadcast // fan out
    connections[uuid] = connection

    users[uuid] = {
        username,
        state: {    
            //presence, use this state variable for other things like bools and online out for lunch etc.
            //onlineStatus: "out for lunch"
        }
    }

    connection.on("message", message => handleMessage(message,uuid))
    connection.on("close", () => handleClose(uuid))
})

server.listen(port, () => {
    console.log(`server is listening on port ${port}`)
})