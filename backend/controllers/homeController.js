import ProductModel from "../models/Product.js";

class HomeController {
  // Returns data used by the client-side Home page
  static getHome = async (req, res) => {
    try {
      // Featured Products (Best Sellers)
      const featuredProducts = await ProductModel.find()
        .sort({ createdAt: -1 })
        .limit(6);

      // Top Rated Products
      const topRatedProducts = await ProductModel.find()
        .sort({ rating: -1 })
        .limit(6);

      // On Sale Products
      const onSaleProducts = await ProductModel.find({
        discountPrice: { $gt: 0 }
      }).limit(6);

      // ✅ Fetch all unique categories from database
      const categoriesFromDB = await ProductModel.distinct("category");
      
      // ✅ Category Icon Mapping
      const categoryIconMap = {
        "Paan Corner": "bi-wind",
        "Dairy, Bread & Eggs": "bi-egg-fried",
        "Fruits & Vegetables": "bi-flower1",
        "Cold Drinks & Juices": "bi-cup-straw",
        "Snacks & Munchies": "bi-cookie",
        "Snacks & Beverages": "bi-cookie",
        "Breakfast & Instant Food": "bi-lightning-charge",
        "Sweet Tooth": "bi-cake2",
        "Bakery & Biscuits": "bi-bread-slice",
        "Tea, Coffee & Beverages": "bi-cup-hot",
        "Atta, Rice & Dal": "bi-box-seam",
        "Baby Care": "bi-baby",
        "Pet Care": "bi-dog",
        "Home & Kitchen": "bi-house",
        "Personal Care": "bi-person",
      };

      // ✅ Default icon if category not found
      const defaultIcon = "bi-tag";

      // ✅ Create categories array with icons
      const categories = categoriesFromDB.map((category) => ({
        name: category,
        icon: categoryIconMap[category] || defaultIcon,
      }));

      // ✅ Sort categories alphabetically
      categories.sort((a, b) => a.name.localeCompare(b.name));

      const data = {
        banner: {
          title: "Stock up on daily essentials",
          subtitle:
            "Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more",
          image:
            "https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=720/layout-engine/2022-05/Group-33704.jpg",
        },
        promo: [
          {
            id: "pharmacy",
            title: "Pharmacy at your doorstep!",
            subtitle: "Cough syrups, pain relief sprays & more",
            icon: "bi-capsule",
            bg: "#e9ffef",
          },
          {
            id: "pet-care",
            title: "Pet care supplies at your door",
            subtitle: "Food, treats, toys & more",
            icon: "bi-dog",
            bg: "#fff9e9",
          },
          {
            id: "baby-care",
            title: "No time for a diaper run?",
            subtitle: "Get baby care essentials",
            icon: "bi-baby",
            bg: "#f1f8ff",
          },
        ],
        categories: categories, // ✅ Dynamic categories from database
      };

      res.status(200).json(data);
    } catch (err) {
      console.error("Error fetching home data:", err);
      res.status(500).json({
        message: "Error fetching home data",
        error: err.message,
      });
    }
  };
}

export default HomeController;