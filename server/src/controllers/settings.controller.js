import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const settingsFilePath = path.join(__dirname, "../config/settings.json")

const getDefaults = () => ({
  storeOpen: true,
  taxRate: 5,
  deliveryFee: 40,
  freeDeliveryThreshold: 499
})

export const getSettings = (req, res) => {
  try {
    if (!fs.existsSync(settingsFilePath)) {
      return res.status(200).json(getDefaults())
    }
    const data = fs.readFileSync(settingsFilePath, "utf8")
    return res.status(200).json(JSON.parse(data))
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}

export const updateSettings = (req, res) => {
  try {
    const { storeOpen, taxRate, deliveryFee, freeDeliveryThreshold } = req.body

    const configDir = path.dirname(settingsFilePath)
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true })
    }

    const currentSettings = fs.existsSync(settingsFilePath)
      ? JSON.parse(fs.readFileSync(settingsFilePath, "utf8"))
      : getDefaults()

    const newSettings = {
      storeOpen: storeOpen !== undefined ? Boolean(storeOpen) : currentSettings.storeOpen,
      taxRate: taxRate !== undefined ? Number(taxRate) : currentSettings.taxRate,
      deliveryFee: deliveryFee !== undefined ? Number(deliveryFee) : currentSettings.deliveryFee,
      freeDeliveryThreshold: freeDeliveryThreshold !== undefined ? Number(freeDeliveryThreshold) : currentSettings.freeDeliveryThreshold
    }

    fs.writeFileSync(settingsFilePath, JSON.stringify(newSettings, null, 2), "utf8")
    return res.status(200).json({ message: "Settings updated successfully", settings: newSettings })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
}
