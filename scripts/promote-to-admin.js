const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function promoteToAdmin() {
  const email = 'kodev.ali@jsbl.com';
  
  try {
    console.log(`Looking for user with email: ${email}`);
    
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log(`❌ User with email ${email} not found.`);
      console.log('Available users:');
      const allUsers = await prisma.user.findMany({
        select: { email: true, name: true, role: true }
      });
      allUsers.forEach(u => console.log(`  - ${u.email} (${u.name}) - ${u.role}`));
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`Current role: ${user.role}`);

    if (user.role === 'Admin') {
      console.log(`✅ User already has Admin role!`);
      return;
    }

    // Update to Admin
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'Admin' },
    });

    console.log(`✅ Successfully updated ${updated.email} to Admin role!`);
    console.log(`New role: ${updated.role}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

promoteToAdmin();
