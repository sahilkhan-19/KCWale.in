import Product from "../models/Product.js";

// ==================== CREATE PRODUCT ====================
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      images = [],
      available,
    } = req.body;

    if (!name || price === undefined || !category) {
      return res.status(400).json({
        message: "Name, price and category are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price cannot be negative",
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category,
      images,
      available,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== GET ALL PRODUCTS ====================
export const getAllProducts = async (req, res) => {
  try {
    const { search, available, page = 1, limit = 10, sort } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Math.min(Number(limit), 50);

    if (
      Number.isNaN(parsedPage) ||
      Number.isNaN(parsedLimit) ||
      parsedPage < 1 ||
      parsedLimit < 1
    ) {
      return res.status(400).json({
        message: "Invalid page or limit value",
      });
    }

    if (parsedLimit > 50) {
  return res.status(400).json({
    message: "Maximum limit allowed is 50",
  });
}

    const category = req.query.category || req.params.category;

    const filter = {};

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        {
          name: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (available !== undefined) {
      filter.available = available === "true";
    }

    let sortOption = { createdAt: -1 };

    if (sort === "price_asc") {
      sortOption = { price: 1 };
    }

    if (sort === "price_desc") {
      sortOption = { price: -1 };
    }

    if (sort === "newest") {
      sortOption = { createdAt: -1 };
    }

    const skip = (parsedPage - 1) * parsedLimit;

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sortOption).skip(skip).limit(parsedLimit),

      Product.countDocuments(filter),
    ]);

    // Shuffle the products list randomly on each request to change their order on reload
    if (!sort) {
      for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
      }
    }

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
      pagination: {
        total,
        page: parsedPage,
        pages: Math.ceil(total / parsedLimit),
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== GET SINGLE PRODUCT ====================
export const getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== UPDATE PRODUCT ====================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, description, price, category, images, available } = req.body;

    const updates = {};

    if (name) updates.name = name;
    if (description !== undefined) updates.description = description;

    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          message: "Price cannot be negative",
        });
      }

      updates.price = price;
    }

    if (category) updates.category = category;
    if (images !== undefined) updates.images = images;
    if (available !== undefined) updates.available = available;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No fields provided to update",
      });
    }

    const product = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== DELETE PRODUCT ====================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== FEATURED PRODUCTS ====================
export const getFeaturedProducts = async (req, res) => {
  try {
    const queryConditions = [
      { name: { $regex: /^Special Chicken Zinger Pizza$/i } },
      { name: { $regex: /^Peri Peri Chicken Zinger Burger$/i } },
      { name: { $regex: /^Chicken Chizza$/i }, price: 299 },
      { name: { $regex: /^Chicken Alfredo Pasta$/i } },
      { name: { $regex: /^Kurkure Masala Momos$/i }, price: 119 },
      { name: { $regex: /^Classic Margherita$/i } },
      { name: { $regex: /^Blueberry Shake$/i } },
      { name: { $regex: /^Blue Lagoon Mojito$/i } }
    ];

    const products = await Product.find({
      available: true,
      $or: queryConditions,
    });

    // Shuffle the products list randomly on each request to change their order on reload
    for (let i = products.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [products[i], products[j]] = [products[j], products[i]];
    }

    res.status(200).json({
      message: "Featured products fetched successfully",
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== PRODUCT CATEGORIES ====================
export const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct("category");

    res.status(200).json({
      message: "Categories fetched successfully",
      categories,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==================== TOGGLE AVAILABILITY ====================
export const toggleAvailability = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    product.available = !product.available;

    await product.save();

    res.status(200).json({
      message: "Availability updated successfully",
      product,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({
        message: "Invalid product ID",
      });
    }

    res.status(500).json({
      message: error.message,
    });
  }
};
