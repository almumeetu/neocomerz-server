import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { AddressModule } from './address/address.module';
import { CategoryModule } from './category/category.module';
import { BrandsModule } from './brands/brands.module';

@Module({
  imports: [PrismaModule, UserModule, AuthModule, AddressModule, CategoryModule, BrandsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
