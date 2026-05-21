import { Request, Response } from 'express';
import { GroupService } from '../../services/group.service';
import { getAuthenticatedUserId, handleAuthError } from '../../utils/authUser';

export async function createGroup(req: Request, res: Response): Promise<any> {
  try {
    const { name } = req.body;
    const userId = getAuthenticatedUserId(req);

    if (!name) {
      return res.status(400).json({ error: 'Grup ismi zorunludur.' });
    }

    const group = await GroupService.createGroup(name, userId);

    return res.status(201).json({
      success: true,
      data: group,
      message: 'Grup oluşturuldu. Davet kodunu paylaşarak üye ekleyebilirsiniz.',
    });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'Grup oluşturulamadı.';
    console.error('[Group Controller Hata]:', error);
    return res.status(500).json({ error: message });
  }
}

export async function joinGroup(req: Request, res: Response): Promise<any> {
  try {
    const { inviteCode } = req.body;
    const userId = getAuthenticatedUserId(req);

    if (!inviteCode) {
      return res.status(400).json({ error: 'inviteCode zorunludur.' });
    }

    const result = await GroupService.joinGroup(inviteCode, userId);

    return res.status(200).json({
      success: true,
      data: result,
      message: 'Gruba başarıyla katıldınız.',
    });
  } catch (error: unknown) {
    if (handleAuthError(res, error)) return;
    const message = error instanceof Error ? error.message : 'İşlem başarısız';
    return res.status(400).json({ error: message });
  }
}

export async function getGroup(req: Request, res: Response): Promise<any> {
  try {
    const { groupId } = req.params;
    const group = await GroupService.getGroupById(Number(groupId));

    if (!group) {
      return res.status(404).json({ error: 'Grup bulunamadı.' });
    }

    return res.status(200).json({ success: true, data: group });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası';
    return res.status(500).json({ error: message });
  }
}
