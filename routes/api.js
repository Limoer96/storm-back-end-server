var router = require('express').Router();
var model = require('./model');
var db = require('./db');
router.get('/', function(req, res, next){
	res.status(200).end('index');
});
/**
 * 一共定义了三个接口:
 * 1. 用于得到下一个待执行的任务
 * 2. 用于得到所有的已爬取过的url数据
 * 3. 用于更新任务的状态
 */
router.get('/rules/latest', (req, res, next) => {
    var rule = new model.Rules_();
    rule.getLatest(res);
});

router.get('/urls/all', (req, res, next) =>{
    var urls = new model.Urls_();
    urls.getAll(res);
});

router.post('/tasks/status/update', (req, res) => {
    var identifier = req.query.identifier;
    var status = req.query.status;
    new model.Tasks_().updateStatus(identifier, status, res);
});

module.exports = router;