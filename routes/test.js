/**
 * Created by limoer on 2017/7/4.
 */
var models = require('./model');
var db = require('./db');

//var News = models.News_;
//
//var t_news = new News('测试,这是title', '2017-07-02 17:10:56', '这是内容2', 'http://www.limoer.cc', 'Aa', 'limoer的日志');
//
//////t_news.insert();
//console.log('ok!');
//
//var rule = new models.Rules_();
//var data = rule.getLatest();
//console.log(data);



// class Stu{
//     constructor(name){
//         this.name = name;
//     }
//     showName(){
//         console.log(this.name);
//     }
// }
// new Stu('li').showName();
new models.Contents_().getCountByIdentifier();

