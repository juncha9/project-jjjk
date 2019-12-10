const db = require(__modules+'/database');
const router = require('express').Router();
router.get("/",(req,res) =>
{
    res.redirect('/movie/list');
});
router.get("/list",(req,res)=>
{
    let fn = async function ()
    {
        try
        {
            
            [records, fields] = await db.query("select * from movie_info");
            if(records && records.length>0)
            {
                res.render('movie_list');
            }
            else
            {
                console.log('Movie is not exist');
                //에러 발생
                res.redirect('/');
            }

        }
        catch(err)
        {   
            console.log(err);
            res.redirect('/');
        }
        
    }();

});



router.get('/detail',(req,res)=>
{
    var movieSeq = req.query.seq;
    //db.query는 프로미즈로구현되어있기때문에 await를 사용하여 리턴받기로 한다.
    let fn = async function()
    {
        //await는 필수적으로 async 함수내에 있어야한다.
        try
        {
            [movies, movieFields] = await db.query('select * from movie_info where movie_seq=?',[movieSeq]); 
            [replies, replyFields] = await db.query("select user_name, reply_contents, movie_rating, DATE_FORMAT(movie_reply_info.insert_date,'%Y-%m-%d') as insert_date from DB.movie_reply_info, DB.user_info where movie_seq=?",[movieSeq]);
            console.log(replies[0].reply_contents);
            //await를 사용하면 쿼리를 마치고 리턴값이 올때까지 기다린다.
            //만약 응답이없으면 timeout이 2초로 설정되있기에 2초뒤에 catch err로 전달된다.
            if(movies.length>0)
            {
                res.render('movie_detail.ejs',{movie: movies[0], replies: replies});    
            }
            
        }
        catch(err)
        {
            //에러발생시는 여기로
            console.error(err);
            res.redirect("/");
        }
    }();//마지막에 ()를 추가함으로 fn()을 실행
})

router.post('/add_reply',(req,res)=>{
    let fn = async function()
    {
        console.log('add_reply');
        movieSeq = req.body.movieSeq;
        userSeq = req.body.userSeq;
        replyContents = req.body.replyContents;
        movieRating = req.body.movieRating;
        try
        {
            let sql = "INSERT INTO movie_reply_info(movie_seq,user_seq,reply_contents,movie_rating,insert_date) values(?,?,?,?,now())";
            [result, test] = await db.query(sql,[movieSeq,userSeq,replyContents,movieRating]);    
            if(result && result.serverStatus === 2)
            {
                res.send({result:true});
            }
            else
            {
                res.send({result:false});
            }
        }
        catch(err)
        {
            console.error(err);
            res.send({result:false});
        }

    }();
})


module.exports = router;