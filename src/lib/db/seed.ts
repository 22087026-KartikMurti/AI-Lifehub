import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import  argon2 from "argon2"

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  await prisma.user.deleteMany()

  const hashed = await argon2.hash('password', { type: argon2.argon2id })
  const user1 = await prisma.user.upsert({
    where: { email: "demo@test.com" },
    update: {},
    create: {
      id: '1',
      email: "demo@test.com",
      first_name: "Demo",
      last_name: 'Account',
      username: 'demo',
      hashed_password: hashed
    },
  })

  const task1 = await prisma.task.upsert({
    where: { id: '1' },
    update: {},
    create: {
      id: '1',
      title: 'Task1',
      description: 'Description1',
      priority: 'medium',
      userId: '1'
    },
  })
  
  console.log({ user1, task1 })
}

if(process.env.NODE_ENV !== 'production') {
  main().then(async () => {
    await prisma.$disconnect()
    console.log('Seeding complete')
  }).catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
} else {
  console.error('Seeding disabled in production.')
  process.exit(0)
}