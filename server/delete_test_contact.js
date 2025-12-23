import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteTestContact() {
    try {
        // Procurar contato com nome contendo "Diogo Teste"
        const contacts = await prisma.contact.findMany({
            where: {
                OR: [
                    { name: { contains: 'Diogo Teste' } },
                    { name: { contains: 'Teste Painel' } }
                ]
            }
        });

        if (contacts.length === 0) {
            console.log('❌ Nenhum contato de teste encontrado.');
            return;
        }

        console.log(`📋 Encontrados ${contacts.length} contato(s) de teste:`);
        contacts.forEach(c => console.log(`  - ${c.name} (${c.phone})`));

        // Deletar mensagens primeiro (por causa da foreign key)
        for (const contact of contacts) {
            const deletedMessages = await prisma.message.deleteMany({
                where: { contactId: contact.id }
            });
            console.log(`🗑️  Deletadas ${deletedMessages.count} mensagens do contato ${contact.name}`);

            // Deletar tags
            const deletedTags = await prisma.tag.deleteMany({
                where: { contactId: contact.id }
            });
            console.log(`🗑️  Deletadas ${deletedTags.count} tags do contato ${contact.name}`);

            // Deletar contato
            await prisma.contact.delete({
                where: { id: contact.id }
            });
            console.log(`✅ Contato "${contact.name}" deletado com sucesso!`);
        }

        console.log('\n✨ Limpeza concluída!');
    } catch (error) {
        console.error('❌ Erro ao deletar contato:', error);
    } finally {
        await prisma.$disconnect();
    }
}

deleteTestContact();
