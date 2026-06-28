import Setting from "../models/Setting.js";

export const getSettings = async (req, res) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({});
    }
    return res.status(200).json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const { storeOpen, taxRate, deliveryFee, freeDeliveryThreshold } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({});
    }

    if (storeOpen !== undefined) settings.storeOpen = Boolean(storeOpen);
    if (taxRate !== undefined) settings.taxRate = Number(taxRate);
    if (deliveryFee !== undefined) settings.deliveryFee = Number(deliveryFee);
    if (freeDeliveryThreshold !== undefined) settings.freeDeliveryThreshold = Number(freeDeliveryThreshold);

    await settings.save();
    return res.status(200).json({ message: "Settings updated successfully", settings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

