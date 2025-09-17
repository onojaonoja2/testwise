import { pgTable, uuid, varchar, timestamp, jsonb, pgEnum } from 'drizzle-orm/pg-core';

// Define enums based on the design document
export const userRoleEnum = pgEnum('user_role', ['System Admin', 'Sub Admin', 'Test Creator', 'Test Taker']);
export const subAdminTypeEnum = pgEnum('sub_admin_type', ['Organizational', 'Individual']);

// Organizations Table
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).unique().notNull(),
  brandingLogoUrl: varchar('branding_logo_url', { length: 255 }),
  brandingBackgroundUrl: varchar('branding_background_url', { length: 255 }),
  themeColors: jsonb('theme_colors'),
});

// Users Table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: userRoleEnum('role').notNull(),
  subAdminType: subAdminTypeEnum('sub_admin_type'),
  organizationId: uuid('organization_id').references(() => organizations.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});