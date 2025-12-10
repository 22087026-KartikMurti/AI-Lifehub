import "dotenv/config"
import {PrismaClient } from "@/src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }

// declare global {
//   var prisma: PrismaClient | undefined
// }
// const createClient = () => {
//   if(global.prisma) {
//     return global.prisma
//   }

//   const prisma = new PrismaClient()

//   console.log('Connected to database')
//   console.log(process.env.DATABASE_URL)

//   if(process.env.NODE_ENV !== 'production') {
//     global.prisma = prisma
//   }

//   return prisma
// }

// export const prisma = createClient()
