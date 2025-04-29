import mongoose from "mongoose";

const favoriteCountrySchema = new mongoose.Schema({
 email : {
    type :String,
    required : true
 },
  countryCode: 
  { 
        type: String, 
        required: true },
});

export default mongoose.model("FavoriteCountry", favoriteCountrySchema);
