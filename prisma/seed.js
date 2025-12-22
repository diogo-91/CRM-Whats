const { PrismaClient } = require('@prisma/client');
const { INITIAL_DATA } = require('../server/data.js');

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding ...');

    // Clear existing data
    try {
        await prisma.tag.deleteMany();
        await prisma.contact.deleteMany();
        // await prisma.column.deleteMany(); // Cascade delete usually handles items but columns might stay if referenced?
        // Delete columns last or first depending on usage. Contacts ref Column. So delete Contacts first.
        await prisma.column.deleteMany();
    } catch (e) {
        console.log('Error clearing data, maybe tables empty:', e.message);
    }

    // Insert data from INITIAL_DATA
    for (const col of INITIAL_DATA) {
        console.log(`Creating column: ${col.title}`);
        await prisma.column.create({
            data: {
                id: col.id,
                title: col.title,
                color: col.color,
                // items are contacts
            }
        });

        // Create contacts for this column
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
