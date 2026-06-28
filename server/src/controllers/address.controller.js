import User from "../models/User.js";

// Helper to keep user.address (flat string) in sync with default address's formattedAddress
const syncDefaultAddressField = (user) => {
  const defaultAddr = user.addresses.find(a => a.isDefault);
  if (defaultAddr) {
    user.address = defaultAddr.formattedAddress;
  } else if (user.addresses.length > 0) {
    // If no address is explicitly default, make first default
    user.addresses[0].isDefault = true;
    user.address = user.addresses[0].formattedAddress;
  } else {
    user.address = null;
  }
};

export const getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json(user.addresses || []);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const addAddress = async (req, res) => {
  try {
    const { addressLabel, formattedAddress, latitude, longitude, city, state, postalCode, country, isDefault } = req.body;

    if (!addressLabel || !formattedAddress || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "addressLabel, formattedAddress, latitude, and longitude are required." });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newAddress = {
      addressLabel,
      formattedAddress,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      city: city || "",
      state: state || "",
      postalCode: postalCode || "",
      country: country || "",
      isDefault: isDefault || false
    };

    // If it's the user's first address, make it default automatically
    if (!user.addresses || user.addresses.length === 0) {
      newAddress.isDefault = true;
    }

    // If this address is set to default, set all others to false
    if (newAddress.isDefault) {
      (user.addresses || []).forEach(a => {
        a.isDefault = false;
      });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    user.addresses.push(newAddress);
    syncDefaultAddressField(user);

    await user.save();
    return res.status(201).json(user.addresses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const { addressLabel, formattedAddress, latitude, longitude, city, state, postalCode, country, isDefault } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Update fields
    if (addressLabel) user.addresses[addressIndex].addressLabel = addressLabel;
    if (formattedAddress) user.addresses[addressIndex].formattedAddress = formattedAddress;
    if (latitude !== undefined) user.addresses[addressIndex].latitude = parseFloat(latitude);
    if (longitude !== undefined) user.addresses[addressIndex].longitude = parseFloat(longitude);
    if (city !== undefined) user.addresses[addressIndex].city = city;
    if (state !== undefined) user.addresses[addressIndex].state = state;
    if (postalCode !== undefined) user.addresses[addressIndex].postalCode = postalCode;
    if (country !== undefined) user.addresses[addressIndex].country = country;

    if (isDefault !== undefined) {
      user.addresses[addressIndex].isDefault = isDefault;
      if (isDefault) {
        user.addresses.forEach((a, idx) => {
          if (idx !== addressIndex) {
            a.isDefault = false;
          }
        });
      }
    }

    syncDefaultAddressField(user);
    await user.save();
    return res.status(200).json(user.addresses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    syncDefaultAddressField(user);
    await user.save();
    return res.status(200).json(user.addresses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const setDefaultAddress = async (req, res) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const addressIndex = user.addresses.findIndex(a => a._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.forEach((a, idx) => {
      a.isDefault = (idx === addressIndex);
    });

    syncDefaultAddressField(user);
    await user.save();
    return res.status(200).json(user.addresses);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
