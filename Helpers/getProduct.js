import Product from "../Models/products.model.js";

const getProduct = async (req, res, next) => {
  const { category, minPrice, maxPrice, keyword, rating, page = 1 } = req.query;
  
  const parsedMinPrice = parseFloat(minPrice) || null;
  const parsedMaxPrice =  parseFloat(maxPrice) || null;
  const parsedRating = parseFloat(rating) || 0;
  const limit = 10; // Number of documents per page
  const skip = (page - 1) * limit; // Calculate how many documents to skip

  try {
    // Define filter object based on query parameters
    const filter = {};
    if (category) filter.category = category.split(",");
    if (parsedMinPrice) filter.price = { $gte: parsedMinPrice };
    if (parsedMaxPrice) filter.price = { ...filter.price, $lte: parsedMaxPrice };

    if (keyword) filter.title = { $regex: keyword, $options: "i" };

    if (parsedRating) filter["rating.rate"] = {$gte: parsedRating} ;
    console.log(filter);
    
    const products = await Product.find(filter).skip(skip).limit(limit).select(["category","discount","price","rating","thumbnail","id","title"])
    console.log("sent",products.length);
    
    res.send(products)
  } catch (err) {
    console.log(err.message);
    next();
  }
};

export default getProduct;
