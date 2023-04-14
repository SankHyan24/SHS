# SHS - Smart Home System
Course project of B/S Software design course in ZJU.

Use **Express** as backend framework, and **three.js** and **VUE** in frontend.

# 智能家居管理系统

# A 设计文档

## 一、需求分析

### 1.1	业务需求

任选Web开发技术实现一个用于智能家居设备管理的系统，支持智能家居的创建监控和调节

### 1.2	功能需求

需要实现的基本功能如下：

1.   用户注册、登录功能
     1.   用户名：6字符以上，且唯一
     2.   密码：6字符以上，必须含有数字、字母(区分大小写)
     3.   邮箱：邮箱格式，且唯一
2.   创建场所
     1.   登录之后，跳转至创建场所界面
     2.   每个用户可以有不同的场所，且会保留历史记录
     2.   提供画图功能，画出场所图
3.   创建房间
     1.   只有进入某个场所后，才能在该场所内创建房间
     2.   每个房间仅对应一个场所
     3.   一个场所可以有多个房间
4.   房间的选择和搜索功能
4.   创建智能设备
     1.   只有进入某个房间后，才能在该房间内创建智能设备
     2.   每个房间可以有多个智能设备
     3.   智能设备根据模板创建，在添加用户的自定义设置
5.   智能设备的种类
     1.   灯：支持开关、亮度调节
     2.   其它智能设备的开关
     3.   传感器：温湿度查看、其它信息的查看
     4.   门锁：开关门状态
7.   列表信息查看设备状态
7.   可视化界面查看设备状态
     1.   在房间内上摆放设备
     3.   提供一些模板
8.   可以在手机上查看，手机应用可以是网页，也可以是`app`

后端程序基于`express`的`nodejs`程序，前端基于`vue3`、`three.js`等库进行开发。数据库使用远程mysql数据库。

## 二、使用的数据库及框架

1. 使用的数据库：MySQL

   1. 服务器的代码框架，在server.js中
   2. 其相关交互的具体实现细节，在apps目录下。
   3. 这里我们使用`knex`作为与MySQL间的接口：

   ```javascript
   const db = knex({
       client: 'mysql',
       connection: {
           host: 'sc.scitbb.top',
           user: 'sunc',
           password: '',// 略去
           database: 'BS'
       }
   })
   ```

2. 框架：`Express`（后端框架）、`three.js`（前端渲染管线）等
3.  由于找不到合适的3D模型，这里面的不同的智能家居设备，我都使用不同纹理的立方体进行表示。

## 三、核心数据模型

在数据库中，我们需要存储的表的结构如下图所示



![image-20221107000635414](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20221107000635414.png)

数据模型分为三部分：用户、场所以及设备。

用户管理将用户的邮箱/电话号码设置为主键，用户名和密码作为普通键值。

场所模型：每个场所对应一个名称，每个用户对应多个场所。

设备模型：每个设备都有自身的id，以及种类的编号。每个场所可以对应多个设备。这些设备是互相继承的关系

![image-20221107194051822](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20221107194051822.png)

## 四、主要功能实现的界面原型

### 3.1	登录/注册界面

如果没有登陆，那么登陆注册界面是此系统的默认主界面。正中心显示登陆和注册选项，简约明了。

在开发后期，我会对界面的风格针对不同种类的ui进行调整，使其也同样适用于手机端/app浏览。

![image-20221106233737212](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20221106233737212.png)

手机版页面：

![image-20230112221453916](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112221453916.png)

登陆后显示的欢迎页面，因为用户名是Test，所以显示的是“Hello Test”。右上角是退出登录选项。点击正中的欢迎信息可以进入场所的管理界面。

![image-20230112165423096](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112165423096.png)

### 3.1	注册界面

![image-20230112165129517](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112165129517.png)

如果是第一次使用，可以进入注册界面，输入用户名、email和密码进行注册。如果注册成功，将退回到登陆界面。

服务器会对输入的用户名email和密码进行检查，如果合法则注册成功并返回正确信息。

如果已经有用户，可以点击下方按钮进行登陆操作。

### 3.2	房间创建/选择界面

在场所管理界面中，用户可以对用户名下的房屋进行创建和选择。

房屋有三种预设户型，其图片和说明会在随后的开发中进行增添。

用户可以在右半部分的搜索部分查看并查找自己想要进行管理的特定房屋。

![image-20230112165438717](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112165438717.png)

在左侧部分可以进行创建，创建后会在右边的house目录中显示出来。这里我们添加一个叫做邪王真眼的房屋。

![image-20230112165627779](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112165627779.png)

右侧选择邪王真眼，点击选择按钮，即可进入对应房屋。此时房屋是空的。

![image-20230112165955549](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112165955549.png)



### 3.3	房间界面

下图是房间界面。用户可以在给定的户型模板上进行对户型的自定义修改。

前端渲染模式基于WebGL的three.js。整个房间的自定义设置类似于沙盒模式，用户可以在想要的位置增加自己的智能终端，并设置/监控其设备参数。

![image-20221106235435408](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20221106235435408.png)

房间界面的操作有两种模式，编辑模式和浏览模式。编辑模式中，可以对所选户型进行自定义设计，在浏览模式中，可以对所选实体（如智能家具等进行更改）。

#### 3.3.1 编辑模式

![image-20230112203058049](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112203058049.png)

在编辑模式中，我们可以通过键盘进行视角更改，通过鼠标进行智能家居的增删。我们还可以用不同颜色的其他种类方块作为我们户型图的墙壁，进行自定义创造编辑。

下面是我们将房屋换一个角度进行查看。可见，房屋中的模型具有很好的3D视觉效果，方便进行相应的空间管理。

![image-20230112212543231](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112212543231.png)

#### 3.3.2 浏览模式

![image-20230112211209632](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112211209632.png)

在浏览模式下，我们同样可以通过键盘进行视角更改，但是鼠标的操作变成了对场景中物体的选择。根据选择的物体，系统会在右侧显示他的各种参数，通过编辑右侧菜单的参数，我们可以对智能设备的参数进行更新和调整。

## 五、流程说明

![image-20221107200301923](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20221107200301923.png)

# B 使用手册：

> 在本章节，我将演示如何启动并使用本系统

## 一、 初始化服务器：

首先要安装node.js，我使用的是v18.12.0。

在根目录下使用terminal，安装必要的node模块。

```shell
npm install
```

配置好环境后，使用`npm start run` 开始程序。

效果图：

![image-20230112221753701](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112221753701.png)

## 二、系统的使用：

### 1. 系统的登录

1. 访问网址： http://sc.scitbb.top:3000/  此时会自动重定位到登陆页面

1. 点击“don't have an account, register one”进入注册界面
   ![image-20230112222043013](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222043013.png)
   对应手机界面：
   ![image-20230112222121261](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222121261.png)

1. 根据提示，输入用户名、邮箱号和密码。如果均为合法，则注册成功：
   ![image-20230112222345975](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222345975.png)

1. 如果用户名、邮箱号和密码非法，或者邮箱号重复，系统将返回错误信息。这里演示的是重复的邮箱号：
   ![image-20230112222442912](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222442912.png)

1. 拥有账号后，输入正确的账号密码，进行登录：这里我们使用的是测试专用的账号test

   ![image-20230112222746817](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222746817.png)

   成功后进入上面的页面，点击中央的“Hello Test”进入系统，或者点击右上角的 LOG out 登出。

### 2. 房间的创建

1. 登入成功后，会显示系统的房间管理页面，你可以在左侧的表单中创建新的房间，或者在右侧的搜索页面搜索并选择准备进行编辑的房间。
   ![image-20230112222954163](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222954163.png)
1. 这里我们选择的是scsc这个房间，在搜索页面输入scsc，会显示出这个房间，点击select进入房间进行编辑。
   ![image-20230112223157036](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112223157036.png)
1. 在房间中，我们可以通过键盘控制，随意调换视角，并对房间里的内容进行删改。
   ![image-20230112223413956](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112223413956.png)

### 3. 房间的编辑

![image-20230112225037404](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112225037404.png)

1. 鼠标控制：
   1. 鼠标可以点击窗口菜单中的“保存”或者“切换模式”按钮，也可以选中3D场景中的物体。
   1. 在3D场景中移动鼠标，会在场景中形成一个红色的高亮盒，表示当前选中的目标位置。
      ![image-20230112225314127](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112225314127.png)
   1. 在编辑模式中，在3D场景中点击鼠标，会在当前鼠标位置的地方生成一个当前种类的物体，可以是墙，也可以是各种智能设备。如果同时按住shift并点击鼠标，会将当前鼠标位置所选中的地方的物体删除（如果这个位置有物体的话）。
   1. 在浏览模式中，在3D场景中点击鼠标，会选中当前位置的方块，如果它是智能设备，则会在右上角菜单中显示其参数。如果是墙则不会显示。
   
1. 键盘控制：
   通过键盘，你可以在不同模式种更改你在3d场景中的视角。在这个系统中，可以通过各种键盘操作调节你在3D场景中的视角，并更换当前添加方块种类的类型。系统中，我们支持11种类型："灯", "开关", "传感器", "密码锁"，以及7种使用不同纹理的墙面，方便设计。
   
1. 保存：在编辑了你的智能化房间之后，别忘了点击保存和更新按钮！
   ![image-20230112230354547](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112230354547.png)
   ![image-20230112230416581](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112230416581.png)
   1. 在浏览模式下，增删方块后需要点击保存，否则当前网页的内容不会被同步并保存到服务器上。
   1. 在编辑模式下，对智能家居的参数编辑也需要点击更新按钮，否则也不会将内容同步到服务器上。
   
1. 实例：

   | 操作                                                         | 图片                                                         |
   | ------------------------------------------------------------ | ------------------------------------------------------------ |
   | 我们先选择一个房间进入                                       | ![image-20230112231550367](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112231550367.png) |
   | 此时房间会加载并被渲染在3D场景中                             | ![image-20230112231620800](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112231620800.png) |
   | 操作按键，调整为我们觉得舒适的角度和距离                     | ![image-20230112231646409](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112231646409.png) |
   | 将物体切换为传感器并点击鼠标，在场景中添加传感器             | ![image-20230112231738911](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112231738911.png) |
   | 按住shift加鼠标，删除这个位置的灯                            | ![image-20230112231808574](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112231808574.png) |
   | 点击保存，此时重新进入房间，发现之前的更改已经实现           | ![image-20230112231908412](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112231908412.png) |
   | 进入浏览模式                                                 |                                                              |
   | 点击屏幕中间的“开关”，此时屏幕右上角出现编辑菜单，可以对开关是否打开进行编辑 | ![image-20230112232010597](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112232010597.png) |
   | 将开关是否打开设置为1，点击更新参数，此时会出现成功字样      | ![image-20230112232050915](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112232050915.png) |
   | 重新打开并再次进入，发开关是否打开已经被设置为1              | ![image-20230112232339272](C:\Users\k\AppData\Roaming\Typora\typora-user-images\image-20230112232339272.png) |
   
   



# C 测试报告

## 一、正常使用测试

如之前的演示以及视频中的演示，均可以正常使用。

## 二、不登录，直接访问除登录、注册外的界面

1. 如果是非法url，则不会正确识别，服务器返回错误信息

![image-20230112230826454](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112230826454.png)

2. 服务器会检查当前的登录信息，如果检测到未登录，则前端强制跳转到登陆页面：

![image-20230112231256239](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112231256239.png)

![image-20230112230900120](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112230900120.png)

## 三、注册/登录时，填入信息错误/不完整

| 错误登录         | ![image-20230112231134696](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112231134696.png) |
| ---------------- | ------------------------------------------------------------ |
| **填入信息不全** | ![image-20230112231102588](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112231102588.png) |
| **用户邮箱重复** | ![image-20230112222442912](https://cdn.jsdelivr.net/gh/SankHyan24/image1/img/image-20230112222442912.png) |







# D 开发体会

这次开发中，其实学到了很多东西，最大的感受就是“纸上得来终觉浅，绝知此事要躬行”。

在课堂上听老师讲的同步异步，感觉只是听讲也是纸上谈兵。在真正的对同步异步进行处理的时候，发现web在这方面确实需要考虑很多事情——前后端交互，时延，以及用户的实际体验等等。我可能做不到像大厂那样的给使用者近乎完美的用户体验，但是也尽可能地追求性能和体验上的平衡。

在开发过程中，我接触到了很多内容：Express、Vue、Three.js、WebGL等等，这些又有趣又新奇。之所以选择用近乎原生的Javascript框架，因为我觉得杀鸡焉用牛刀，用其他框架按自己想法发挥的空间不是很大。这个project最令我感到自豪的是哪个3D的场景，我把一个webgl的3D场景迁移到我们的project中，做了一个类似于”我的世界“一样的界面。唯一觉得可惜的是，没有给各种”智能家居系统“特别的3D模型，因为实在找不到，我的精力也不允许我再去自己在blender里面自己弄，就业用的方块作为补充，最后的效果虽然觉得很丑，但是也达成了我当时”3D场景编辑“的预期目的了。

# 小结

 通过这次的开发，我对整个web开发的流程有了一个大致的理解，对前后端的交互有了大致的掌握。 虽然由于刚开始就准备使用JavaScript写后端，导致后续老师讲的技术可能并没有使用到大作业里面，但是原理和思路基本上是一样的，就是实现方法略有不同。希望在以后能够接触到更多更优秀的大项目，用更好的技术来实现它们。

# Backend Login Form

Once you clone it make sure you run 'npm install' command to install all libraries mention in package.json file.

Use `npm start` to run website in server.
