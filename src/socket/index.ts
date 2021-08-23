import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

enum CHANNELS {
    CHAT = 'chat',
    USER_STATUS = 'user_status'
}

const CHANNEL_STRINGS = Object.values(CHANNELS);

const USERS = new Map<string, string>();

export function handleSocketServer(server: HttpServer): void {
    const io: Server = new Server(server, {
        cors: {
            origin: '*',
        },
    });
    handleConnections(io);
}

function handleConnections(io: Server): void {
    const chatNSp = io.of('/chat');
    chatNSp.on('connection', (client: Socket) => {
        const getUserName: string = client.handshake.query.userName as string;
        if (!getUserName || !getUserName.trim()) {
            client.disconnect(true);
            return;
        }

        //Register for Channel Messages.
        for (const channel of CHANNEL_STRINGS) {
            client.on(channel, (args: unknown) => {
                chatNSp.emit(channel, { msg: args, id: client.id, userName: USERS.get(client.id) });
            })
        }
        client.on('disconnect', () => {
            USERS.delete(client.id);
            client.broadcast.emit(CHANNELS.USER_STATUS, getUserStatus(false, `${getUserName} left the chat`, USERS.get(client.id) as string));
        });

        //Store and send status to all
        USERS.set(client.id, getUserName);
        chatNSp.emit(CHANNELS.USER_STATUS, getUserStatus(true, `${getUserName} Joined`, USERS.get(client.id) as string));
    });
}

const getUserStatus = (isConnected: boolean, msg: unknown, id: string) => ({
    msg,
    isConnected,
    id
});
