# Kuruşla Paylaş — Grup Birikim DB Şeması

Birden fazla kullanıcının aynı **Pot** (birikim hedefi) için katkı sunabildiği ilişki modeli.

## Varlıklar

```
Group (1) ──< Pot (N)
  │
  └──< User (N)          ← groupId ile gruba üye

Pot (1) ──< PotParticipant (N) ──> User
  │              └── totalContributed (kişi bazlı katkı)
  └──< PotRequest (N) ──> User
           └── type: CONTRIBUTION | WITHDRAWAL
```

## Tablolar

| Model | Açıklama |
|-------|----------|
| **Group** | Aile/arkadaş grubu, `inviteCode` ile davet |
| **Pot** | Ortak hedef (ör. "Tatil fonu"), `targetAmount` / `currentAmount` |
| **PotParticipant** | Kullanıcı–Pot çoka-çok köprüsü, `totalContributed` |
| **PotRequest** | Katkı veya çekim talebi geçmişi |

## API

### Grup
- `POST /api/groups/create` — `{ name, userId? }`
- `POST /api/groups/join` — `{ inviteCode, userId }`
- `GET /api/groups/:groupId`

### Pot
- `POST /api/pots` — `{ groupId, name, targetAmount, createdById?, description? }`
- `GET /api/pots/group/:groupId`
- `POST /api/pots/:potId/join` — `{ userId }`
- `GET /api/pots/:potId/participants`
- `POST /api/pots/:potId/contribute` — `{ userId, amount }`
- `POST /api/pots/:potId/withdraw` — `{ userId, amount }`
- `POST /api/pots/approve/:requestId`

## Migration

```bash
npx prisma migrate dev --name kurusla_paylas_pot_schema
```
