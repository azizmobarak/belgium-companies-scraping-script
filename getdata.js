const puppeteer = require('puppeteer-extra');
const Recaptcha = require('puppeteer-extra-plugin-recaptcha');
const Agent = require('user-agents');
const {FormatArray} = require('./FormatDataUrls');
const {getPagesData} = require('./getCompaniesData');
const dotenv = require('dotenv');


 // captcha configuration
puppeteer.use(
    Recaptcha({
      provider: { id: '2captcha', token: process.env.KEY },
      visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
  )

const getData=()=>{

    (async()=>{

        var Browser =await puppeteer.launch({
            headless:true,
            args: [
                '--enable-features=NetworkService',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--shm-size=3gb',
            ],
        });
        
        var page =await Browser.newPage();
        await page.setUserAgent(Agent.toString());
        await page.setDefaultNavigationTimeout(0);

       /* try{
            const cookiesString = await fs.readFile('./cookies.json');
            const cookies = JSON.parse(cookiesString);
            await page.setCookie(...cookies);
        }catch{
            const cookies = await page.cookies();
            await fs.writeFile('./cookies.json', JSON.stringify(cookies, null, 2));
        }*/
       
        
         // speed up website --------------------------------------------------------------
   await page.setRequestInterception(true);
    await page.on("request", (req) => {
     if (
         req.resourceType() === "image" ||
         req.resourceType() === "stylesheet" ||
         req.resourceType() === "font"
     ) {
         req.abort();
     } else {
         req.continue();
     }
    });

  
    // pages range

    var end = 8;
    //all list
    const AllLists = [];

var Cities = [{city:"Antwerp",code:"2000"},{city:"Gand",code:"9000"},{city:"Charleroi",code:"6000"},{city:"Liege",code:"4000"},{city:"Bruxelles",code:"1000"},{city:"Schaerbeek",code:"1030"},{city:'Anderlecht',code:"1070"},{city:"Bruges",code:"8000"},{city:"Namur",code:"5000"},{city:"Louvain",code:"3000"},{city:"Molenbeek-Saint-Jean",code:"1080"},{city:'Mons',code:"7000"},{city:"Ixelles",code:"1050"},{city:'Alost',code:"9300"},{city:"Malines",code:"2800"},{city:'Uccle',code:"1180"},{city:"La-Louviere",code:"7100"},{city:"Hasselt",code:"3500"},{city:"Courtrai",code:"8500"},{city:"Tournai",code:"7500"}]
var jobs = ['Coiffeurs',"Restaurants","Dentistes","Docteurs","Garages"]



   for(var job=0;job<jobs.length;job++){

    for(let city=0;city<Cities.length;city++){


        for(var start=1;start<=end;start++){
    
            try{
                await page.goto("https://www.1307.be/"+jobs[job]+"/"+Cities[city].city+"/"+Cities[city].code+"/FLANDRE-ORIENTALE/result_list/default/"+start);
                await page.waitForSelector('div>p.fn');
            }catch(e){
                await page.solveRecaptchas();
                await Promise.all([
                    page.waitForNavigation(),
                    page.click(".g-recaptcha"),
                    await page.$eval('input[type=submit]', el => el.click())
                ]);           
            }
        
        
            const Result =await page.evaluate(()=>{
                var List = [];
                var list = document.querySelectorAll('div>p.fn>a');
               for(var i=0;i<list.length;i++){
               List.push(list[i].href)
               }
        
               return List;
            }); 
    
            AllLists.push(Result);
    
        }
    
    
       }
  }

  const ALLUrls = await FormatArray(AllLists);
  await getPagesData(ALLUrls,page)
  
  
   await Browser.close();
        })();
}


module.exports ={getData}