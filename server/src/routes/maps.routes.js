import express from "express";
import {
  autocomplete,
  reverseGeocode,
  geocode,
  placeDetails
} from "../controllers/maps.controller.js";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/autocomplete", protect, autocomplete);
router.get("/reverse-geocode", protect, reverseGeocode);
router.get("/geocode", protect, geocode);
router.get("/details", protect, placeDetails);

export default router;
