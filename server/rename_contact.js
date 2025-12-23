
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Searching for contact "Teste Envio"...');

    try {
        const contact = await prisma.contact.findFirst({
            where: { name: 'Teste Envio' }
        });

        if (contact) {
            console.log(`Found contact: ${contact.name} (${contact.phone})`);
            const updated = await prisma.contact.update({
                where: { id: contact.id },
                data: { name: 'Diogo Teste Painel' }
            });
            console.log(`Renamed to: ${updated.name}`);
        } else {
            console.log('Contact "Teste Envio" not found. Trying partial match...');
            // Fallback search
            const partial = await prisma.contact.findFirst({
                where: { name: { contains: 'Teste' } }
            });
            if (partial) {
                console.log(`Found partial match: ${partial.name} (${partial.phone})`);
                const updated = await prisma.contact.update({
                    where: { id: partial.id },
                    data: { name: 'Diogo Teste Painel' }
                });
                console.log(`Renamed to: ${updated.name}`);
            } else {
                console.log('No contact found to rename.');
            }
        }
    } catch (error) {
        console.error('Error renaming contact:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
