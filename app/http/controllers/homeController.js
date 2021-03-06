const controller = require('app/http/controllers/controller');
const Course = require('app/models/course');
const Category = require('app/models/category');
const sm = require('sitemap');
const rss = require('rss');
const striptags = require('striptags');

class homeController extends controller {
    
    async index(req , res) {


        let categories = await Category.find({ parent : null }).populate('childs').exec();
        let courses = await Course.find({}).sort({ createdAt : -1 }).skip(3).limit(8).exec();
        res.render('home/index' , { courses  , categories });



    }

    async about(req , res) {
        res.render('home/about');
    }

    async sitemap(req , res , next) {
        try {
                let sitemap = sm.createSitemap({
                    hostname : config.siteurl ,
                    cachTime : 600000
                });
                sitemap.add({ url : '/' , changefreq : 'daily' , priority : 1  });
                sitemap.add({ url : '/post' , priority : 1 });

                let courses =  await Course.find({ }).sort({ createdAt : -1 });
                courses.forEach(course => {
                    sitemap.add({ url : course.path() , changefreq : 'weekly' , priority: 0.8})

                });

            res.header('content-type' , 'application/xml');
            res.send(sitemap.toString());

        } catch (err) {
            next(err);
        }
    }
    async feedCourses(req , res , next) {
        try {
            let feed = new rss({
                title : 'فید خوان مطالب  ورزشی فیتکس',
                description : 'جدیدترین مطالب ورزش و سلامت را از طریق rss بخوانید',
                feed_url : `${config.siteurl}/feed/post`,
                site_url : config.site_url,
            });

            let courses = await Course.find({ }).populate('user').sort({ createdAt : -1 }).exec();
            courses.forEach(course => {
                feed.item({
                    title : course.title,
                    description : striptags(course.body.substr(0,100)),
                    date : course.createdAt,
                    url : course.path(),
                    author : course.user.name
                })
            })

            res.header('Content-type' , 'application/xml');
            res.send(feed.xml());

        } catch (err) {
            next(err);
        }
    }
}

module.exports = new homeController();