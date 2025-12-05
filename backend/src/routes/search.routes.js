const router = require("express").Router();
const { search } = require("../controllers/search_controller");

router.post("/", search);

module.exports = router;
