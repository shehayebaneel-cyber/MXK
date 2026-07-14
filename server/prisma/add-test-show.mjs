import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const inDays = (n) => new Date(Date.now() + n * 86400000);

await prisma.event.upsert({
  where: { slug: "test-show" },
  update: { date: inDays(30), ticketsEnabled: true, ticketPrice: 20, ticketCapacity: 100, ticketNote: "Pay cash at the door · 19+", ticketUrl: null },
  create: {
    slug: "test-show",
    title: "TEST SHOW — MXK Live",
    venue: "Test Venue",
    city: "Toronto",
    date: inDays(30),
    description: "This is a test event to preview the Upcoming Shows + on-site ticket flow. Delete it anytime from the admin dashboard.",
    poster: "/artwork/mxk-portrait.jpg",
    tracklist: "Warm Up\nNour\nEl Mas'oul\nRouhi Fidak\nClosing Set",
    ticketsEnabled: true, ticketPrice: 20, ticketCapacity: 100, ticketNote: "Pay cash at the door · 19+",
  },
});
console.log("Test show added (upcoming, in 30 days).");
await prisma.$disconnect();
