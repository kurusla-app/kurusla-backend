import { PrismaClient } from '@prisma/client';
import { SecurityService } from '../services/security.service';

const prismaClient = new PrismaClient();

const prisma = prismaClient.$extends({
  query: {
    transaction: {
      async create({ args, query }) {
        if (args.data.merchant) {
          args.data.merchant = SecurityService.encrypt(args.data.merchant);
        }
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.merchant && typeof args.data.merchant === 'string') {
          args.data.merchant = SecurityService.encrypt(args.data.merchant);
        }
        return query(args);
      },
      async createMany({ args, query }) {
        if (Array.isArray(args.data)) {
          args.data.forEach((item) => {
            if (item.merchant) item.merchant = SecurityService.encrypt(item.merchant);
          });
        }
        return query(args);
      },
      async upsert({ args, query }) {
        if (args.create.merchant) args.create.merchant = SecurityService.encrypt(args.create.merchant);
        if (args.update.merchant && typeof args.update.merchant === 'string') {
          args.update.merchant = SecurityService.encrypt(args.update.merchant);
        }
        return query(args);
      }
    },
    user: {
      async create({ args, query }) {
        if (args.data.firstName) args.data.firstName = SecurityService.encrypt(args.data.firstName);
        if (args.data.lastName) args.data.lastName = SecurityService.encrypt(args.data.lastName);
        return query(args);
      },
      async update({ args, query }) {
        if (args.data.firstName && typeof args.data.firstName === 'string') {
          args.data.firstName = SecurityService.encrypt(args.data.firstName);
        }
        if (args.data.lastName && typeof args.data.lastName === 'string') {
          args.data.lastName = SecurityService.encrypt(args.data.lastName);
        }
        return query(args);
      }
    }
  },
  result: {
    transaction: {
      merchant: {
        needs: { merchant: true },
        compute(transaction) {
          return SecurityService.decrypt(transaction.merchant);
        }
      }
    },
    user: {
      firstName: {
        needs: { firstName: true },
        compute(user) {
          return user.firstName ? SecurityService.decrypt(user.firstName) : null;
        }
      },
      lastName: {
        needs: { lastName: true },
        compute(user) {
          return user.lastName ? SecurityService.decrypt(user.lastName) : null;
        }
      }
    }
  }
});

export default prisma;

