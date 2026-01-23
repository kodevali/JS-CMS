const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed with local assets...');

    // 1. Clean existing data
    await prisma.auditLog.deleteMany();
    await prisma.file.deleteMany();
    await prisma.news.deleteMany();
    await prisma.user.deleteMany();
    console.log('🧹 Cleared existing data.');

    // 2. Create Users (without passwords - they'll link via Google SSO on first sign-in)
    const users = [
        {
            name: 'Admin User',
            email: 'admin@jsbank.com',
            role: 'Admin',
            googleId: null // Will be set when user signs in with Google
        },
        {
            name: 'HR Manager',
            email: 'hr@jsbank.com',
            role: 'HR Editor',
            googleId: null
        },
        {
            name: 'Comms Officer',
            email: 'comms@jsbank.com',
            role: 'Comms Editor',
            googleId: null
        },
        {
            name: 'IT Admin',
            email: 'it@jsbank.com',
            role: 'IT Editor',
            googleId: null
        },
        {
            name: 'General Viewer',
            email: 'viewer@jsbank.com',
            role: 'Viewer',
            googleId: null
        }
    ];

    for (const u of users) {
        await prisma.user.create({ data: u });
    }
    console.log(`👤 Created ${users.length} users.`);

    // 3. Create News (Using Local Assets)
    const newsItems = [
        {
            department: 'Communications',
            title: 'JS Bank Reports Record Q4 Profits',
            summary: 'We are thrilled to announce a 20% YoY growth in our quarterly earnings.',
            content: 'JS Bank is proud to announce another record-breaking quarter, driven by our digital transformation initiatives and strong performance in the SME sector. "This success belongs to every employee who has worked tirelessly to put our customers first," said our CEO. We are looking forward to continuing this momentum into the new fiscal year.',
            author: 'Corporate Comms',
            isFeatured: true,
            imageUrl: '/assets/comms.png',
            createdAt: new Date('2023-12-15')
        },
        {
            department: 'Communications',
            title: 'Strategic Partnership with TechFin Solutions',
            summary: 'Expanding our digital footprint through strategic fintech alliances.',
            content: 'We are excited to announce a new strategic partnership with TechFin Solutions to revolutionize our mobile banking experience. This collaboration will bring cutting-edge AI features to our app, helping customers manage their finances smarter and faster.',
            author: 'Michael Ross',
            isFeatured: false,
            imageUrl: null, // No image for this one
            createdAt: new Date('2024-01-10')
        },
        {
            department: 'HR',
            title: 'Employee Appreciation Week',
            summary: 'Celebrating the hard work and dedication of our amazing team.',
            content: 'Next week is Employee Appreciation Week! We have a schedule full of fun events, including a catered lunch on Wednesday, a team-building workshop on Thursday, and early release on Friday. Thank you for all that you do to make JS Bank a great place to work!',
            author: 'Jessica Pearson',
            isFeatured: true,
            imageUrl: '/assets/hr.png',
            createdAt: new Date('2024-01-05')
        },
        {
            department: 'HR',
            title: 'Welcoming Our New CTO',
            summary: 'Sarah Jenkins joins JS Bank to lead our technology division.',
            content: 'Please join us in welcoming Sarah Jenkins as our new Chief Technology Officer. Sarah brings over 15 years of experience in fintech and secure banking infrastructure. She will be leading our initiative to modernize our core banking systems.',
            author: 'HR Dept',
            isFeatured: false,
            imageUrl: null,
            createdAt: new Date('2024-01-12')
        },
        {
            department: 'IT',
            title: 'Mandatory Security Upgrade: 2FA',
            summary: 'Rolling out enhanced Two-Factor Authentication for all internal portals.',
            content: 'As part of our commitment to zero-trust security, we are rolling out hardware-key based 2FA for all admin access starting next month. Please visit the IT Helpdesk to collect your YubiKey before the 30th. Security is everyone\'s responsibility.',
            author: 'Sarah Jenkins',
            isFeatured: true,
            imageUrl: '/assets/it.png',
            createdAt: new Date('2024-01-14')
        },
        {
            department: 'IT',
            title: 'Scheduled System Maintenance',
            summary: 'Core banking systems will be offline this Sunday from 2 AM to 4 AM.',
            content: 'Please be advised that we will be performing routine maintenance on the core transaction ledger this Sunday. During this window, internal dashboards may be unreachable. ATM and Card services will remain unaffected.',
            author: 'IT Ops',
            isFeatured: false,
            imageUrl: null,
            createdAt: new Date('2024-01-16')
        }
    ];

    for (const item of newsItems) {
        await prisma.news.create({ data: item });
    }
    console.log(`📰 Created ${newsItems.length} news items.`);
    console.log('✅ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
