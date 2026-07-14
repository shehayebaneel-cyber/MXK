import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const r = await prisma.release.updateMany({ where: { slug: "ya-habibi-taala" }, data: { artwork: "/artwork/ya-habibi-taala.jpg" } });
console.log("updated", r.count);
await prisma.$disconnect();
