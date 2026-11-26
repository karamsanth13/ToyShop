import bcrypt from "bcrypt";
import { prisma } from "../server/db/prisma.js";

const categories = [
  { name: "Educational Toys", slug: "educational-toys", description: "Thoughtful toys that make learning feel like play." },
  { name: "Soft Toys", slug: "soft-toys", description: "Soft, friendly companions for little adventures." },
  { name: "Action Figures", slug: "action-figures", description: "Characters ready for stories of every kind." },
  { name: "Building Blocks", slug: "building-blocks", description: "Open-ended building for curious hands." },
  { name: "Board Games", slug: "board-games", description: "Make room at the table for family play." },
  { name: "Remote Control Toys", slug: "remote-control-toys", description: "Take the fun for a spin." },
  { name: "Baby Toys", slug: "baby-toys", description: "Gentle first toys for sensory discovery." },
  { name: "Outdoor Toys", slug: "outdoor-toys", description: "Fresh-air favorites for active play." },
];

const productRows = [
  ["Wooden Alphabet Blocks", "wooden-alphabet-blocks", "educational-toys", "18.50", "A colorful set of sturdy wooden letter blocks for early spelling, stacking and imaginative play.", "3–6 years", 24, "blocks", true, true, true],
  ["Colour Sorting Puzzle", "colour-sorting-puzzle", "educational-toys", "14.00", "Sort bright wooden shapes by color and build confidence with patterns and matching.", "2–5 years", 18, "puzzle", true, false, false],
  ["Doctor Play Kit", "doctor-play-kit", "educational-toys", "22.00", "A pretend-play medical kit with friendly tools for caring stories and role play.", "3–7 years", 12, "doctor-kit", true, false, false],
  ["Animal Puzzle Board", "animal-puzzle-board", "educational-toys", "12.75", "Chunky animal pieces help little hands practice matching, naming and problem solving.", "2–4 years", 16, "puzzle", false, true, false],
  ["Teddy Bear", "teddy-bear", "soft-toys", "19.99", "A soft, huggable teddy with embroidered details and a gentle expression.", "All ages", 20, "teddy", true, false, true],
  ["Sleepy Bunny Plush", "sleepy-bunny-plush", "soft-toys", "17.50", "A floppy-eared plush friend made for quiet-time cuddles and make-believe.", "All ages", 14, "bunny", false, true, false],
  ["Dinosaur Action Figure", "dinosaur-action-figure", "action-figures", "16.00", "A poseable dinosaur figure for prehistoric adventures and creature collections.", "4–9 years", 11, "dinosaur", true, true, false],
  ["Space Explorer Figure", "space-explorer-figure", "action-figures", "21.00", "A space explorer figure with movable joints for missions across the playroom.", "5–10 years", 9, "space", false, false, true],
  ["Magnetic Building Blocks", "magnetic-building-blocks", "building-blocks", "29.00", "Colorful magnetic shapes click together for towers, patterns and 3D creations.", "4–10 years", 15, "blocks", true, true, true],
  ["Rainbow Construction Set", "rainbow-construction-set", "building-blocks", "24.50", "A versatile construction set for designing houses, bridges and anything imagined.", "4–9 years", 8, "blocks", false, false, false],
  ["Kids Chess Board", "kids-chess-board", "board-games", "18.00", "A friendly first chess set with clear pieces and a sturdy folding board.", "6+ years", 7, "chess", true, false, false],
  ["Cozy Cabin Board Game", "cozy-cabin-board-game", "board-games", "26.00", "A cheerful cooperative game for making plans, taking turns and playing together.", "5+ years", 10, "chess", false, true, true],
  ["Remote Control Racing Car", "remote-control-racing-car", "remote-control-toys", "34.00", "A beginner-friendly RC racer with responsive steering for indoor track days.", "6–12 years", 13, "rc-car", true, true, false],
  ["RC Monster Truck", "rc-monster-truck", "remote-control-toys", "42.00", "A chunky remote-control truck ready to roll over bumps and build-your-own courses.", "7–12 years", 0, "rc-car", false, false, true],
  ["Baby Musical Rattle", "baby-musical-rattle", "baby-toys", "9.50", "A lightweight rattle with gentle sounds and easy-to-hold textures.", "0–18 months", 22, "rattle", true, true, false],
  ["Soft Stacking Rings", "soft-stacking-rings", "baby-toys", "13.25", "Textured, soft rings invite little ones to stack, squeeze and explore.", "6–24 months", 17, "rings", false, false, false],
  ["Mini Basketball Set", "mini-basketball-set", "outdoor-toys", "27.00", "A compact hoop set for practicing easy shots indoors or outside.", "5–10 years", 6, "basketball", true, false, true],
  ["Bubble Machine", "bubble-machine", "outdoor-toys", "20.00", "A playful bubble maker for garden parties and breezy afternoons.", "3+ years", 9, "bubbles", false, true, false],
  ["Drawing and Art Kit", "drawing-and-art-kit", "educational-toys", "23.00", "A colorful starter kit for sketching, coloring and creative projects.", "5–12 years", 12, "art-kit", true, true, true],
  ["Toy Train Set", "toy-train-set", "building-blocks", "31.00", "A wooden train and track set for building routes and telling travel stories.", "3–8 years", 4, "train", false, false, true],
];

async function ensureAccount({ username, email, fullName, role, password }) {
  const existing = await prisma.adminProfile.findUnique({ where: { username } });
  if (existing) return existing;
  return prisma.adminProfile.create({ data: { username, email, fullName, role, passwordHash: await bcrypt.hash(password, 12) } });
}

async function seed() {
  const categoryIds = new Map();
  for (const [index, item] of categories.entries()) {
    const category = await prisma.category.upsert({ where: { slug: item.slug }, create: { ...item, sortOrder: index, isPublished: true }, update: { ...item, sortOrder: index, isPublished: true } });
    categoryIds.set(item.slug, category.id);
  }

  const products = [];
  for (const [index, row] of productRows.entries()) {
    const [name, slug, categorySlug, price, description, ageGroup, stockQuantity, imageName, recommended, isNew, bestSeller] = row;
    const product = await prisma.product.upsert({
      where: { slug },
      create: { name, slug, categoryId: categoryIds.get(categorySlug), price, description, ageGroup, stockQuantity, availability: stockQuantity > 0 ? "in_stock" : "out_of_stock", images: [`/toy-images/${imageName}.svg`], isPublished: true, isRecommended: recommended, isNew, isBestSeller: bestSeller, isRare: index === 7 },
      update: { name, categoryId: categoryIds.get(categorySlug), price, description, ageGroup, stockQuantity, availability: stockQuantity > 0 ? "in_stock" : "out_of_stock", images: [`/toy-images/${imageName}.svg`], isPublished: true, isRecommended: recommended, isNew, isBestSeller: bestSeller, isRare: index === 7 },
    });
    products.push(product);
  }

  await ensureAccount({ username: "admin1", email: "admin1@toyshop.local", fullName: "Demo Admin", role: "Admin", password: "2026" });
  await ensureAccount({ username: "superadmin", email: "superadmin@toyshop.local", fullName: "Demo Super Admin", role: "Super Admin", password: "super2026" });
  await prisma.shopDetails.upsert({ where: { id: 1 }, create: { id: 1, name: "Toy Shop Demo", description: "A neighborhood toy shop for thoughtful gifts, playful discoveries and family favorites." }, update: {} });

  const offer = await prisma.offer.upsert({ where: { id: "11111111-1111-4111-8111-111111111111" }, create: { id: "11111111-1111-4111-8111-111111111111", title: "Build & Discover", description: "Save 15% on selected building and learning favorites.", discountPercent: 15, startsAt: new Date(Date.now() - 86400000), endsAt: new Date(Date.now() + 21 * 86400000), isPublished: true }, update: { title: "Build & Discover", description: "Save 15% on selected building and learning favorites.", discountPercent: 15, startsAt: new Date(Date.now() - 86400000), endsAt: new Date(Date.now() + 21 * 86400000), isPublished: true } });
  await prisma.offerProduct.deleteMany({ where: { offerId: offer.id } });
  await prisma.offerProduct.createMany({ data: products.filter((product) => ["wooden-alphabet-blocks", "magnetic-building-blocks", "colour-sorting-puzzle"].includes(product.slug)).map((product) => ({ offerId: offer.id, productId: product.id })), skipDuplicates: true });

  const bookingProduct = products.find((product) => product.slug === "rc-monster-truck");
  const existingBooking = await prisma.preBooking.findFirst({ where: { customerName: "Sample Visitor", productId: bookingProduct.id } });
  if (!existingBooking) await prisma.preBooking.create({ data: { productId: bookingProduct.id, customerName: "Sample Visitor", phone: "+1 555 010 2040", email: "visitor@example.test", message: "Please let me know when this truck is back in stock.", status: "Pending" } });
  const existingEnquiry = await prisma.enquiry.findFirst({ where: { customerName: "Sample Visitor", email: "visitor@example.test" } });
  if (!existingEnquiry) await prisma.enquiry.create({ data: { customerName: "Sample Visitor", email: "visitor@example.test", productId: products[0].id, message: "Could you tell me a little more about this toy?", status: "New" } });

  await prisma.notificationSubscriber.upsert({ where: { email: "newsletter@example.test" }, create: { email: "newsletter@example.test", consentedAt: new Date() }, update: {} });
  console.log(`Seeded ${products.length} products, ${categories.length} categories, two demo accounts, one offer, and sample engagement data.`);
  console.log("Demo sign-ins: admin1 / 2026; superadmin / super2026");
}

seed().catch((error) => { console.error("Database seed failed:", error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
