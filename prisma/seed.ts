import 'dotenv/config';
import { seedCategories } from './seeders/category-seeder';
import { seedUsers } from './seeders/user-seeder';

async function main() {
  console.log('🌱 Starting database seeding...');
  
  try {
    // Seed categories first
    console.log('\n📁 Seeding categories...');
    const categoryResult = await seedCategories();
    console.log(`✅ Categories seeded: ${categoryResult.total} total`);
    
    // Seed users
    console.log('\n👤 Seeding users...');
    const userResult = await seedUsers();
    console.log(`✅ Users seeded: ${userResult.totalUsers} total`);
    
    console.log('\n🎉 All seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Categories: ${categoryResult.total} (${categoryResult.mainCategories} main, ${categoryResult.subCategories} sub)`);
    console.log(`   Users: ${userResult.totalUsers}`);
    console.log('\n🔑 Default user password: password123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding if called directly
if (require.main === module) {
  main();
}

export { main as seedAll };
