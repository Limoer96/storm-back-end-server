var db = require('./db');

function News(){
}


News.prototype.init = function(title, pub_time, content, url, identifier, source) {
    var list;
    list = {
        content,
        title,
        source,
        pub_time,
        url,
        identifier
    };
    return list;
};

News.prototype.insert = function(){
  db.query('INSERT INTO news.contents set ?', this.init(), function(err, result) {
      if(err) throw err;
  });
};

News.prototype.getAll = function(res) {
    db.query('SELECT * FROM news.contents', (err, rows) => {
        if(err) throw err;
        if(rows.length === 0){
            res.status(500).send({msg: 'empty!'})
        }else {
            res.status(200).json(rows);
        }
    })
};

exports.News_ = News;

// 用于提取规则的模型
function Rules() {
    this.table = 'news.rules';
    this.row = [];
}

Rules.prototype.getAllRules = function(response) {
  db.query(`SELECT * FROM ${this.table}`, function(err, rows) {
      if(err) throw err;
      if(rows.length === 0){
          response.status(200).send({count: 0})
      }else{

          let temp = [];
          let temp_item = rows[0];
          //按网站名进行分组
          temp.push({name: temp_item['website_name'], subjects: []});

          for(let i= 1; i < rows.length; i++){
              if(temp_item['website_name'] !== rows[i]['website_name']){
                  temp_item = rows[i];
                  temp.push({name: temp_item['website_name'], subjects: []});
              }
          }
          let clone_temp = temp.slice();

          for(let i = 0 ; i < rows.length; i ++){
              for(let j = 0; j < temp.length; j ++){
                  if(rows[i]['website_name'] === temp[j]['name']){
                      clone_temp[j]['subjects'].push([rows[i]['channel_name'], rows[i]['identifier'], false]);
                      continue;
                  }
              }
          }



          response.status(200).json(clone_temp);
      }
  })
};

Rules.prototype.getRule = function(identifier) {
  db.query(`SELECT * FROM ${this.table} where identifier=?`,identifier, function(err, rows){
      if(err) throw err;
      let row;
      row= {
          url: rows[0].root,
          title_rule: rows[0].title_rule,
          content_rule: rows[0].title_rule,
          pub_time_rule: rows[0].pub_time_rule,
          source_rule: rows[0].source_rule
      };
      return row;
  })
};

Rules.prototype.getLatest = function (response) {
    db.query(`SELECT * FROM news.tasks WHERE status='initial' ORDER BY post_time ASC` , (err, rows) => {
        if(err) throw err;
        if(rows.length === 0){
            console.log('run this');
            response.status(200).send({msg: '没有待抓取的任务'});
        }else{
            var latest_row = rows[0];
            var identifier = latest_row.identifier;
            db.query(`SELECT * FROM ${this.table} where identifier=?`, identifier, (err, rows) => {
                if(err) throw err;
                var row = rows[0];
                if(!row) {
                    response.status(500).send('can not get rules');
                }
                else {
                    response.json(rows[0]);
                }
            });
        }
    });
};


Rules.prototype.getAll = function(res) {
  let ids = [];
  let tasks = []; // 待发送的数据
  db.query(`SELECT * FROM news.tasks where status=?`, 'initial', (err, rows) => {
    if(err){
      throw err;
    }else{
      for(let task of rows) {
        ids.push(task.identifier);
      }
      console.log(ids);
      for(let id of ids) {
        db.query(`SELECT * FROM ${this.table} WHERE identifier=?`, id, (err, rows) => {
          if(err) throw err;
          tasks.push(rows[0]);
        })
      }
      db.query(`UPDATE news.tasks SET status='running' WHERE status=?`, 'initial', (err, result) => {
        if(err) throw err;
      })
      setTimeout(() => {
        res.json(tasks)
      }, 3000)
    }
  })

}
/**
  identifier: 'Aa',
  root: 'https://github.com/lin',
  title_rule: 'html/body/title',
  content_rule: 'html/body/content',
  pub_time_rule: 'html/body/pub_time',
  source_rule: '/html/body/header/do_some',
  website_name: '腾讯新闻',
  region: null,
  country: '中国',
  language: '简体中文',
  channel_name: '中国',
  create_time: 2017-07-08T07:17:01.000Z
*/




/**
  { root: 'http://www.limoer.cc',
  title_rule: 'html/body/title',
  content_rule: 'html/body/content',
  pub_time_rule: 'html/body/pub_time',
  source_rule: '/html/body/header/author',
  website_name: '腾讯新闻',
  country: '中国',
  channel_name: '腾讯要闻' }
  发过来的数据格式
*/



Rules.prototype.edit = function(identifier,rules, res) {
    console.log(identifier);
    console.log('rules:' + rules);
    let sql = `UPDATE ${this.table} SET root='${rules.root}', title_rule='${rules.title_rule}', pub_time_rule='${rules.pub_time_rule}', source_rule='${rules.source_rule}', website_name='${rules.website_name}', country='${rules.country}', channel_name='${rules.country}' WHERE identifier='${identifier}'`;
    console.log(sql);
   
    db.query(sql, function(err, result){
        if(err) throw err;
        res.status(200).json({message: 'ok!'});
    });
};

Rules.prototype.getOneByIdentifier = function (identifier, res) {
  db.query(`SELECT * FROM ${this.table} WHERE identifier=?`, identifier, function(err, rows) {
    if(err){
      throw err;
    }else{
      res.status(200).json(rows[0]);
    }
  })
};


exports.Rules_ = Rules;

// 用于存取和显示任务

function Tasks () {
    this.table = 'news.tasks';
}

Tasks.prototype.getAll = function(res) {
    db.query(`SELECT * FROM ${this.table}`, function(err, rows) {
        if(err) throw err;
        res.status(200).json(rows);
    })
};

Tasks.prototype.updateStatus = function(identifier, status, res) {
    console.log(status);
    var status_list = ['running', 'complete', 'initial'];
    if(status_list.indexOf(status) == -1){
        console.log('run this~'); // 如果有其他值的话就会执行
        res.status(500).send({rollback: 'invalid parmas'});
    }else {
        db.query(`UPDATE ${this.table} SET status='${status}' where identifier='${identifier}'`, function (err, result) {
            if (err) throw err;
            res.status(200).send({rollback: 'ok~'});
        });
    }
};

Tasks.prototype.addTask = function(identifier, desc, res) {
  let values = {
    identifier: identifier,
    desc: desc,
    status: 'initial'
  };
  db.query(`INSERT INTO ${this.table} (\`identifier\`, \`desc\`, \`status\`) values ('${identifier}', '${desc}', 'initial')`, function(err, result) {
    if(err){
      res.status(200).json({status: 'wrong'});
    }else{
      res.status(200).json({status: 'ok!'});
    }
  })
}


exports.Tasks_ = Tasks;
// url的存取

function Urls() {
    this.table = 'news.urls'
}
Urls.prototype.insert = function(url){
    db.query(`INSERT INTO ${this.table} set url=?`, url, function(err, result){
        if(err) throw err;
    })
};

Urls.prototype.getAll = function(res){
    db.query(`SELECT * FROM ${this.table}`, function(err, rows){
        if(err) throw err;
        res.status(200).json(rows);
    })
};

exports.Urls_ = Urls;

// 其它数据库交互逻辑
function Contents() {
    this.table = 'news.contents'
}
// 获取所有新闻的数量
Contents.prototype.getAllCount = function(res) {
    db.query(`SELECT COUNT(*) FROM ${this.table}`, function(err, row){
        if(row == undefined){
            res.status(500).send({
                msg: 'no news'
            })
        }else{
            res.status(200).send({
                count: row[0]['COUNT(*)']
            })
        }
    });
};

Contents.prototype.getCountByIdentifier = function(res) {
    db.query(`SELECT *, COUNT(*) FROM ${this.table} GROUP BY identifier`, function(err, rows){
        if(err) throw err;
        res.json(rows);
    })
};


Contents.prototype.getNewsByFilter = function(filter, res) {
    db.query(`SELECT * FROM ${this.table} WHERE title LIKE '%${filter}%'`,function(err, rows){
        if(err) throw err;
        if(Array.isArray(rows) && rows.length > 0){
            res.status(200).json(rows);
        }else{
            res.send({count: 0})
        }
    });
};







exports.Contents_ = Contents;





