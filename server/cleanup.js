
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const FAKE_IDS = [
    '1', '2', '3', '4', '5', '6', '7', '8', '9', '10',
    '11', '12', '13', '14', '15', '16', '17', '18', '19'
];

async function main() {
    console.log('Cleaning up fake data...');

    try {
        // Delete messages associated with fake contacts first (cascade usually handles this but being safe)
        // Actually schema might cascade. Let's try deleting contacts.

        // Also delete tags associated with these contacts
        await prisma.tag.deleteMany({
            where: {
                contactId: { in: FAKE_IDS }
            }
        });

        const { count } = await prisma.contact.deleteMany({
            where: {
                id: { in: FAKE_IDS }
            }
        });

        console.log(`Deleted ${count} fake contacts.`);
    } catch (error) {
        console.error('Error cleaning up:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
