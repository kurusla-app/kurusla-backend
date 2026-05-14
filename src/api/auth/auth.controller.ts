import { Request, Response } from 'express';
import * as authService from '../../services/auth.service';

export async function register(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur.' });
    }

    const user = await authService.registerUser(email, password);
    return res.status(201).json({ message: 'Kayıt başarılı', user });

  } catch (error: any) {
    return res.status(400).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response): Promise<any> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur.' });
    }

    const result = await authService.loginUser(email, password);
    // İstenilen Response formatı: { token, user: { id, email } }
    return res.status(200).json(result); 

  } catch (error: any) {
    return res.status(401).json({ error: error.message });
  }
}
