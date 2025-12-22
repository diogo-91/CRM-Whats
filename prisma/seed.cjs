const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({});

const INITIAL_DATA = [
    {
        id: 'fixa',
        title: 'FIXA',
        count: 2046,
        color: 'bg-emerald-500',
        items: [
            {
                id: '1',
                name: '+55 31 7123-3845',
                phone: '+55 31 7123-3845',
                avatarUrl: 'https://picsum.photos/100/100?random=1',
                lastMessageTime: '16:42',
                unreadCount: 1,
                lastMessagePreview: 'image',
                tags: [],
                assignedTo: 'Hebrain',
                status: 'online',
            },
            {
                id: '2',
                name: 'Leandro Bossa P...',
                phone: '+55 31 9999-9999',
                avatarUrl: 'https://picsum.photos/100/100?random=2',
                lastMessageTime: '8:58',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '3',
                name: '+55 31 9888-8888',
                phone: '+55 31 9888-8888',
                avatarUrl: 'https://picsum.photos/100/100?random=3',
                lastMessageTime: '7:53',
                unreadCount: 0,
                tags: [{ color: 'red' }],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '4',
                name: '+55 31 9876-5432',
                phone: '+55 31 9876-5432',
                avatarUrl: 'https://picsum.photos/100/100?random=4',
                lastMessageTime: '16:34',
                unreadCount: 1,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'online',
            },
            {
                id: '5',
                name: '+55 31 9999-7045',
                phone: '+55 31 9999-7045',
                avatarUrl: 'https://picsum.photos/100/100?random=5',
                lastMessageTime: '16:33',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '6',
                name: '+55 31 8352-0469',
                phone: '+55 31 8352-0469',
                avatarUrl: 'https://picsum.photos/100/100?random=6',
                lastMessageTime: '16:27',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
        ],
    },
    {
        id: 'leads',
        title: 'Leads',
        count: 5,
        color: 'bg-emerald-600',
        items: [
            {
                id: '7',
                name: '+55 31 9666-3401',
                phone: '+55 31 9666-3401',
                avatarUrl: 'https://picsum.photos/100/100?random=7',
                lastMessageTime: '7:53',
                unreadCount: 0,
                tags: [{ color: 'red' }, { color: 'green' }],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '8',
                name: 'Robson Jose',
                phone: '+55 31 9111-2222',
                avatarUrl: 'https://picsum.photos/100/100?random=8',
                lastMessageTime: '01/12',
                unreadCount: 0,
                tags: [{ color: 'green' }],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '9',
                name: '+55 31 9797-1527',
                phone: '+55 31 9797-1527',
                avatarUrl: 'https://picsum.photos/100/100?random=9',
                lastMessageTime: '01/12',
                unreadCount: 0,
                tags: [{ color: 'red' }, { color: 'green' }],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '10',
                name: '+55 31 9946-9920',
                phone: '+55 31 9946-9920',
                avatarUrl: 'https://picsum.photos/100/100?random=10',
                lastMessageTime: '10:27',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '11',
                name: 'DIEGO LARA LE...',
                phone: '+55 31 9999-8888',
                avatarUrl: 'https://picsum.photos/100/100?random=11',
                lastMessageTime: '01/12',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
        ],
    },
    {
        id: 'negociando',
        title: 'Negociando',
        count: 4,
        color: 'bg-teal-600',
        items: [
            {
                id: '12',
                name: '+55 31 9764-0232',
                phone: '+55 31 9764-0232',
                avatarUrl: 'https://picsum.photos/100/100?random=12',
                lastMessageTime: '16:5',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '13',
                name: '+55 37 9495-0566',
                phone: '+55 37 9495-0566',
                avatarUrl: 'https://picsum.photos/100/100?random=13',
                lastMessageTime: '13:6',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '14',
                name: 'Assessoria Bruno ...',
                phone: '+55 31 8888-7777',
                avatarUrl: 'https://picsum.photos/100/100?random=14',
                lastMessageTime: '01/12',
                unreadCount: 1,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'online',
            },
            {
                id: '15',
                name: '+55 31 9332-688-7...',
                phone: '+55 31 9332-688-7',
                avatarUrl: 'https://picsum.photos/100/100?random=15',
                lastMessageTime: '16:34',
                unreadCount: 1,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'online',
            },
        ],
    },
    {
        id: 'ganhou',
        title: 'Ganhou',
        count: 4,
        color: 'bg-teal-700',
        items: [
            {
                id: '16',
                name: 'Giullio Henrique ...',
                phone: '+55 31 9999-1111',
                avatarUrl: 'https://picsum.photos/100/100?random=16',
                lastMessageTime: '01/12',
                unreadCount: 0,
                tags: [{ color: 'green' }],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '17',
                name: 'Lili Clínica',
                phone: '+55 31 9999-2222',
                avatarUrl: 'https://picsum.photos/100/100?random=17',
                lastMessageTime: '01/12',
                unreadCount: 1,
                tags: [{ color: 'red' }],
                assignedTo: 'Hebrain',
                status: 'online',
            },
            {
                id: '18',
                name: 'Marcelo Alvaro L...',
                phone: '+55 31 9999-3333',
                avatarUrl: 'https://picsum.photos/100/100?random=18',
                lastMessageTime: '01/12',
                unreadCount: 0,
                tags: [],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
            {
                id: '19',
                name: 'Silviane Uicramad',
                phone: '+55 31 9999-4444',
                avatarUrl: 'https://picsum.photos/100/100?random=19',
                lastMessageTime: '01/12',
                unreadCount: 0,
                tags: [{ color: 'green' }],
                assignedTo: 'Hebrain',
                status: 'offline',
            },
        ],
    },
];

async function main() {
    console.log('Start seeding ...');

    try {
        await prisma.tag.deleteMany();
        await prisma.contact.deleteMany();
        await prisma.column.deleteMany();
    } catch (e) {
        console.log('Error clearing data, maybe tables empty or not exist:', e.message);
    }

    // Insert data from INITIAL_DATA
    for (const col of INITIAL_DATA) {
        console.log(`Creating column: ${col.title}`);
        await prisma.column.create({
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
