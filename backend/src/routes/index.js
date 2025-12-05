const router = require("express").Router();

router.use("/rag", require("./rag.routes"));
router.use("/search", require("./search.routes"));

module.exports = router;
