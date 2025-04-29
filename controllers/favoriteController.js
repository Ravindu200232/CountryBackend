import FavoriteCountry from "../models/FavoriteCountry.js";

export const addFavoriteCountry = async (req, res) => {

    
  const { countryCode } = req.body;
  const email = req.user.email;
  
  try {
    const exists = await FavoriteCountry.findOne({ email, countryCode });
    if (!exists) {
      const favorite = new FavoriteCountry({ email, countryCode });
      await favorite.save();
    }
    res.json({ message: "Country added to favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFavoriteCountry = async (req, res) => {
  const { countryCode } = req.body;
  const email = req.user.email;
  try {
    await FavoriteCountry.deleteOne({ email, countryCode });
    res.json({ message: "Country removed from favorites" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFavoriteCountries = async (req, res) => {
  try {
    const favorites = await FavoriteCountry.find({ email: req.user.email });
    res.json(favorites.map((fav) => fav.countryCode));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
