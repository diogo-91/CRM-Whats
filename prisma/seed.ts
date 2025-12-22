import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const INITIAL_DATA = [
  {
    id: 'fixa',
    title: 'FIXA',
    count: 0,
    color: 'bg-emerald-500',
    items: [],
  },
  {
    id: 'leads',
    title: 'Leads',
    count: 0,
    color: 'bg-emerald-600',
    items: [],
  },
  {
    id: 'negociando',
    title: 'Negociando',
    count: 0,
    color: 'bg-teal-600',
    items: [],
  },
  {
    id: 'ganhou',
    title: 'Ganhou',
    count: 0,
    color: 'bg-teal-700',
    items: [],
  },
];

async function main() {
  console.log('Start seeding ...');

  try {
    await prisma.tag.deleteMany();
    await prisma.contact.deleteMany();
    await prisma.column.deleteMany();
    // @ts-ignore
    await prisma.user.deleteMany();
  } catch (e: any) {
    console.log('Error clearing data:', e.message);
  }

  // Create Default User
  // Password: "123" (easier for test)
  const hashedPassword = await bcrypt.hash('123', 10);
  // @ts-ignore
  await prisma.user.create({
    data: {
      name: 'Admin ZapFlow',
      email: 'admin@zapflow.com',
      password: hashedPassword
    }
  });

  console.log('User created:');
  console.log('Email: admin@zapflow.com');
  console.log('Pass: 123');

  // Insert data from INITIAL_DATA
  for (const col of INITIAL_DATA) {
    const createdColumn = await prisma.column.create({
      data: {
        id: col.id,
        title: col.title,
        color: col.color,
      }
    });

    for (const item of col.items) {
      const contact = await prisma.contact.create({
        data: {
          id: item.id,
          name: item.name,
          phone: item.phone,
          avatarUrl: item.avatarUrl,
          lastMessageTime: item.lastMessageTime,
          unreadCount: item.unreadCount,
          status: item.status || 'offline',
          assignedTo: item.assignedTo,
          columnId: col.id
        }
      });

      if (item.tags && item.tags.length > 0) {
        for (const tag of item.tags) {
          await prisma.tag.create({
            data: {
              color: tag.color,
              label: tag.label,
              contactId: contact.id
            }
          })
        }
      }
    }
  }

  console.log('Seeding finished.');
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  });
