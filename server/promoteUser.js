import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String,
})

const User = mongoose.model("User", UserSchema)

async function run() {
  const email = process.argv[2]
  if (!email) {
    console.error("Please provide an email address. Example: node promoteUser.js test@example.com")
    process.exit(1)
  }

  const uri = process.env.MONGO_URI
  if (!uri) {
    console.error("MONGO_URI not found in env")
    process.exit(1)
  }

  console.log("Connecting to database...")
  await mongoose.connect(uri)
  console.log("Connected!")

  const user = await User.findOne({ email })
  if (!user) {
    console.error(`User with email "${email}" not found.`)
    await mongoose.disconnect()
    process.exit(1)
  }

  user.role = "admin"
  await user.save()
  console.log(`Successfully promoted "${user.name}" (${user.email}) to role: admin!`)

  await mongoose.disconnect()
}

run().catch(console.error)
