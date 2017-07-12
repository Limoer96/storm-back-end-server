var express = require('express');
var router = express.Router();
var models = require('./model');
var Rule = models.Rules_;
var News = models.News_;
var Tasks = models.Tasks_;
var rule = new Rule();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/rules/get/all', (req, res) => {
    rule.getAllRules(res);
});


router.get('/rule/:identifier/get', (req, res) => {
    let identifier = req.params.identifier;
    console.log(identifier);
    rule.getOneByIdentifier(identifier, res);
});

router.post('/rules/:identifier/edit', (req, res) => {
    var update_data = req.body; // 一个对象
    var identifier = req.params.identifier;
    rule.edit(identifier, update_data, res);
});

router.get('/contents/all', (req, res) => {
    new News().getAll(res);
});


// 当每次获取到新闻数量信息的时候，都要访问下面两个url

router.get('/contents/counts', (req, res) => {
	new models.Contents_().getAllCount(res);
});

router.get('/contents/countbyidentifier', (req, res) => {
	new models.Contents_().getCountByIdentifier(res);
});


// 用户使用模糊查询搜索新闻
router.get('/contents/:keyword/search', (req, res) => {
	var keyword = req.params.keyword;
	new models.Contents_().getNewsByFilter(keyword, res);
});

// 用户提交任务

router.get('/tasks/:identifier/post', (req, res) => {
    let identifier = req.params.identifier;
    let desc = req.query.desc;
    new Tasks().addTask(identifier, desc, res);
})

router.get('/tasks/all', (req, res) => {
    new Tasks().getAll(res);
})

module.exports = router;

