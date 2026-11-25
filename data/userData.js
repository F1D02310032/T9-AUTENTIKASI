const prisma = require('./prisma');

exports.findByEmail = (email) => prisma.user.findUnique({
  where: { email },
  select: { id: true, email: true, passwordHash: true }
});

exports.create = (data) => prisma.user.create({
  data,
  select: { id: true, email: true }
});
