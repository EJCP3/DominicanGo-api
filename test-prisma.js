const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const blog = await prisma.blog.create({
      data: {
        title: "Test Blog " + Date.now(),
        slug: "test-" + Date.now(),
        authorId: "123", // Might cause foreign key constraint fail if user doesn't exist
        status: "PUBLISHED",
        publishedAt: new Date(),
        content: "<p>Test</p>",
        excerpt: "Test excep",
        category: "Experiencia",
        images: ["url"],
        size: "col-span-2",
        color: "success",
        provinceId: undefined,
        destinationId: undefined
      }
    });
    console.log("Success:", blog);
  } catch (err) {
    console.error("Prisma error:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
