const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Product = require("../models/product");
const Category = require("../models/category");
const Image = require("../models/image");
const { Op } = require("sequelize");
const axios = require("axios");
const router = express.Router();

try {
  fs.readdirSync("uploads");
} catch (error) {
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      try {
        fs.readdirSync(`uploads/${req.params.id}`);
      } catch (error) {
        console.log("uploads 없어서 생성함");
        fs.mkdirSync(`uploads/${req.params.id}`);
      }
      cb(null, `uploads/${req.params.id}`);
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + "-" + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5mb
});
//일반 api테스트
router.get("/get_submit_data", (req, res, next) => {
  res.json({ first: "kim", last: "hyunsu" });
  console.log("/get_submit_data", req.body);
});

router.get("/get_submit_params/:id", (req, res, next) => {
  res.json({ id: req.params.id });
  console.log("/get_submit_params", req.params.id);
});

router.get("/get_submit_query", (req, res, next) => {
  res.json({ id: req.query.data });
  console.log("/get_submit_query", req.query.data);
});

router.post("/post_submit_data", (req, res, next) => {
  const f = req.body.first + "+abc";
  const l = req.body.last + "+abc";
  res.json({ first: f, last: l });
  console.log("/post_submit_params", req.body);
});

router.post("/post_submit_params/:id", (req, res, next) => {
  res.json({ id: req.params.id });
  console.log("/post_submit_params", req.body[0]);
});

//multer테스트
router.post("/post_image/:id/:type", upload.single("img"), (req, res, next) => {
  console.log("파일이름", req.file.filename);
  res.json({ id: req.params.id, type: req.params.type, filename: req.params.filename });
  // console.log("/post_image", req.file);
});

//db테스트
router.get("/get_List", async (req, res, next) => {
  try {
    let options = {};
    if (req.query.s) {
      options = {
        ...options,
        where: {
          product_name: { [Op.like]: `%${req.query.s}%` }, // "%data%"" 표시는 앞뒤로 data가 붙은 문자열
        },
      };
    }
    if (req.query.sort) {
      options = {
        ...options,
        order: [["product_price", req.query.sort.toString().toUpperCase()]],
      };
    }
    const take = 9;
    if (req.query.page) {
      const page = parseInt(req.query.page) || 1;
      options = {
        ...options,
        limit: 9, // 몇 개 가져올지
        offset: (page - 1) * take, // 몇 개 뛰어넘을지
        //프론트에서 사용할만큼만 주고 붙여서 사용함.
      };
    }
    const productList = await Product.findAll({
      include: [
        { model: Category, attributes: ["category1", "category2"] },
        { model: Image, where: { type: 1 }, required: false },
      ],
      ...options,
    });
    const total = await Product.count({
      ...options, // 각 필터당 최대 크기
    });
    const lastpage = Math.ceil(total / take);
    res.send({ productList, lastpage }); //res.json은 무조건 json으로 바꿔서 주고, res.send는 자동으로 정함
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/get_open_api", async (req, res, next) => {
  try {
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);

    const service_key = process.env.SERVICE_KEY;
    const base_date = year + month + day;
    const base_time = "0800";
    const nx = "90";
    const ny = "69";

    const url = "http://apis.data.go.kr/1360000/VilageFcstInfoService/getVilageFcst";
    let queryParams = "?" + encodeURIComponent("ServiceKey") + "=" + service_key;
    queryParams += "&" + encodeURIComponent("dataType") + "=" + encodeURIComponent("JSON");
    queryParams += "&" + encodeURIComponent("base_date") + "=" + encodeURIComponent(base_date);
    queryParams += "&" + encodeURIComponent("base_time") + "=" + encodeURIComponent(base_time);
    queryParams += "&" + encodeURIComponent("nx") + "=" + encodeURIComponent(nx);
    queryParams += "&" + encodeURIComponent("ny") + "=" + encodeURIComponent(ny);

    const response = await axios.get(url + queryParams);
    const items = response.data.response.body.items.item;
    const weather_degree = items[6].fcstValue;
    const weather_code = items[1].fcstValue;
    const weather_state = "없음";
    switch (weather_code) {
      case 1:
        weather_state = "비";
        break;
      case 2:
        weather_state = "비/눈";
        break;
      case 3:
        weather_state = "눈";
        break;
      case 4:
        weather_state = "소나기";
        break;
    }
    res.json({ base_date, base_time, weather_degree, weather_state });
  } catch (error) {
    console.error(error);
    next(error);
  }
});
module.exports = router;
