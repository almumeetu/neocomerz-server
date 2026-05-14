import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { seedCategories } from './seeders/category-seeder';
import { seedUsers } from './seeders/user-seeder';
import { seedDummyData } from './seeders/dummy-data-seeder';

async function main() {
  console.log('🌱 Starting database seeding...');
  
  let categoryResult = { total: 0, mainCategories: 0, subCategories: 0 };
  let userResult = { totalUsers: 0 };

  try {
    // Seed categories first
    console.log('\n📁 Seeding categories...');
    try {
      categoryResult = await seedCategories();
      console.log(`✅ Categories seeded: ${categoryResult.total} total`);
    } catch (e) {
      console.log('ℹ️ Categories already exist or seeding failed, skipping...');
    }
    
    // Seed users
    console.log('\n👤 Seeding users...');
    try {
      userResult = await seedUsers();
      console.log(`✅ Users seeded: ${userResult.totalUsers} total`);
    } catch (e) {
      console.log('ℹ️ Users already exist or seeding failed, skipping...');
    }

    // Seed dummy data (orders, reviews, etc)
    console.log('\n📦 Seeding dummy orders and reviews...');
    try {
      await seedDummyData();
      console.log('✅ Dummy data seeded');
    } catch (e) {
      console.error('❌ Dummy data seeding failed:', e);
    }
    
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
