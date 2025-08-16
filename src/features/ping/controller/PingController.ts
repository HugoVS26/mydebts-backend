import { type Request, type Response } from 'express';

const pingMessage = 'Leeeeroy Jenkins!';

class PingController {
  readonly getPong = (_req: Request, res: Response) => {
    res.status(200).json({ message: pingMessage });
  };
}

export default PingController;
