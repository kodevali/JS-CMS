const { PrismaClient } = require('@prisma/client');

async function verifySchema() {
  const prisma = new PrismaClient();
  
  try {
    // Try to create a test user with googleId to verify the schema
    console.log('Testing Prisma schema...');
    
    // Check if we can access googleId field
    const testFields = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        googleId: true,
        name: true,
        role: true,
      }
    });
    
    console.log('✅ Prisma client recognizes googleId field');
    console.log('Schema is correct!');
    
    // Try to see what fields are available
    const userModel = prisma.user;
    console.log('Available User model methods:', Object.keys(userModel).filter(k => !k.startsWith('$')));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.message.includes('googleId')) {
      console.error('The Prisma client does not recognize googleId field.');
      console.error('Please run: npx prisma generate');
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
