import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { PrismaClient, Product } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

export async function seedDummyData() {
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
  });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding realistic dummy data for orders and reviews...');

    // 1. Ensure a brand exists
    let brand = await prisma.brand.findFirst({ where: { slug: 'neocomerz' } });
    if (!brand) {
      brand = await prisma.brand.create({
        data: { name: 'NeoComerz', slug: 'neocomerz' }
      });
    }

    // 2. Ensure some categories exist
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: 'General', slug: 'general' }
      });
    }

    // 3. Create realistic products
    const productsData = [
      { name: 'Tibet Lip Gel', slug: 'tibet-lip-gel', price: 150 },
      { name: 'Pure Water Bottle 500ml', slug: 'pure-water-500', price: 20 },
      { name: 'Organic Honey 250g', slug: 'organic-honey-250', price: 450 },
      { name: 'Fresh Apple 1kg', slug: 'fresh-apple-1kg', price: 220 },
      { name: 'Premium Tea 100g', slug: 'premium-tea-100', price: 180 },
    ];

    const products: Product[] = [];
    for (const p of productsData) {
      let product = await prisma.product.findUnique({ where: { slug: p.slug } });
      if (!product) {
        product = await prisma.product.create({
          data: {
            name: p.name,
            slug: p.slug,
            description: `High quality ${p.name}`,
            status: 'active',
            brandId: brand.id,
            categoryId: category.id,
            variants: {
              create: {
                sku: `${p.slug.toUpperCase()}-001`,
                price: p.price,
                stockQuantity: 100,
                isDefault: true
              }
            }
          }
        });
      }
      products.push(product);
    }

    // 4. Get a user and create an address
    let user = await prisma.user.findFirst({ where: { role: { name: 'user' } } });
    if (!user) {
      // If no user from other seeders, create one
      const role = await prisma.role.findFirst({ where: { name: 'user' } });
      user = await prisma.user.create({
        data: {
          name: 'Regular Customer',
          email: 'customer@example.com',
          password: 'hashed_password', // won't be used for seed display
          roleId: role!.id
        }
      });
    }

    let address = await prisma.address.findFirst({ where: { userId: user.id } });
    if (!address) {
      address = await prisma.address.create({
        data: {
          fullName: user.name,
          phone: '+8801234567890',
          addressLine1: '123 Tech Street',
          city: 'Dhaka',
          state: 'Dhaka',
          postalCode: '1200',
          country: 'Bangladesh',
          userId: user.id
        }
      });
    }

    // 5. Create Orders with various statuses
    const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    for (let i = 0; i < 15; i++) {
      const status = orderStatuses[i % orderStatuses.length];
      const product = products[i % products.length];
      const variant = await prisma.productVariant.findFirst({ where: { productId: product.id } });
      const qty = (i % 3) + 1;
      const total = Number(variant!.price) * qty;

      await prisma.order.create({
        data: {
          orderNumber: `ORD-${2024000 + i}`,
          status: status as any,
          paymentStatus: i % 3 === 0 ? 'paid' : 'unpaid',
          total: total,
          userId: user.id,
          addressId: address.id,
          items: {
            create: {
              productId: product.id,
              variantId: variant!.id,
              quantity: qty,
              unitPrice: variant!.price,
              totalPrice: total
            }
          },
          statusLogs: {
            create: {
              status: status,
              note: `Order marked as ${status}`
            }
          },
          payments: {
            create: {
              amount: i % 3 === 0 ? total : 0,
              method: i % 2 === 0 ? 'COD' : 'Online',
              status: i % 3 === 0 ? 'success' : 'pending'
            }
          }
        }
      });
    }

    // 6. Create Reviews
    const reviewComments = [
      'Excellent product, highly recommend!',
      'Good quality but delivery was a bit slow.',
      'Average experience.',
      'The packaging was great, product works well.',
      'Very satisfied with this purchase.',
    ];

    for (let i = 0; i < 20; i++) {
      const product = products[i % products.length];
      await prisma.review.create({
        data: {
          rating: 4 + (i % 2),
          comment: reviewComments[i % reviewComments.length],
          isApproved: i % 4 !== 0, // Some pending
          productId: product.id,
          userId: user.id
        }
      });
    }

    console.log('✅ Successfully seeded dummy orders and reviews');
    return { success: true };

  } catch (error) {
    console.error('❌ Error seeding dummy data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  seedDummyData()
    .then(() => console.log('🎊 Done'))
    .catch((e) => console.error(e));
}
