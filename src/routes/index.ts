import express from 'express';
import path from 'path';

export function handleApp(app: express.Express): void {
  app.use('/static', express.static(path.join(process.cwd(), 'src', 'ui')));
}
