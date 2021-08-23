import express from 'express';
import { createServer } from 'http';
import { handleApp } from './routes';
import { handleSocketServer } from './socket';

const app = express();
app.set('port', Number.parseInt(process.env.PORT as string) || 8080);
const httpServer = createServer(app);

handleSocketServer(httpServer);
handleApp(app);

httpServer.listen(app.get('port'), () => {
  console.info("App started @", app.get('port'))
})