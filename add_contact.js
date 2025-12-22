import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const contact = await prisma.contact.create({
            data: {
                name: 'Teste Envio',
                phone: '5515991975096',
                columnId: 'leads', // Adiciona na coluna Leads
                avatarUrl: 'https://ui-avatars.com/api/?name=Teste+Envio',
                unreadCount: 0,
                status: 'offline'
            }
        });
        console.log('Contato criado com sucesso:', contact);
    } catch (e) {
        console.error('Erro ao criar contato:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
