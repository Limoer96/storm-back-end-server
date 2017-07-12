### 是什么

这是基于strom的分布式数据采集项目的一部分，提供了API服务以及和前端数据交互的能力。

基于express框架实现，数据库则采用MySQL。

### 运行

1. git clone 
2. 进入项目目录
3. cnpm install 安装依赖
4. 打开MySQL数据库，并且把news_2017-07-10.sql导入到数据库中
5. 打开routes/db.js，修改配置项(数据库中已经创建对应表格情况下)
6. cd bin/ && node www

