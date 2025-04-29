import express from "express";
import {
  addFavoriteCountry,
  getFavoriteCountries,
  removeFavoriteCountry,
} from "../controllers/favoriteController.js";

const fauratieRouter = express.Router();

fauratieRouter.post("/add", addFavoriteCountry);
fauratieRouter.post("/remove", removeFavoriteCountry);
fauratieRouter.get("/list", getFavoriteCountries);

export default fauratieRouter;
