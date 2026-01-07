# استفاده از نسخه سبک نود جی‌اس
FROM node:20-alpine

# تنظیم دایرکتوری کاری
WORKDIR /app

# کپی کردن فایل‌های پکیج برای نصب وابستگی‌ها
COPY package.json package-lock.json* bun.lockb* ./

# نصب وابستگی‌ها (شامل tsx و پکیج‌های مورد نیاز سرور)
RUN npm install

# کپی کردن کل پروژه (شامل پوشه server)
COPY . .

# تنظیم متغیرهای محیطی پیش‌فرض
ENV PORT=3000
ENV NODE_ENV=production

# باز کردن پورت
EXPOSE 3000

# دستور اجرای سرور (اشاره به اسکریپت server در package.json)
CMD ["npm", "run", "server"]