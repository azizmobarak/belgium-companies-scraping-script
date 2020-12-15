const puppeteer = require('puppeteer-extra');
const Recaptcha = require('puppeteer-extra-plugin-recaptcha');
const fs = require('fs');
var XLSX = require('xlsx');


// captcha configuration
puppeteer.use(
    Recaptcha({
      provider: { id: '2captcha', token:  process.env.KEY  },
      visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)


const getPagesData=async(array,page)=>{

    // all brand details 
    var AllBrands =[];
    console.log(array.length);
    for(let i=0;i<array.length;i++){
    
     
    
        try{
            await page.goto(array[i]);
            console.log(i,array[i])
            await page.waitForSelector('#footer')
        }catch(e){
            await page.solveRecaptchas();
            await Promise.all([
                page.waitForNavigation(),
                page.click(".g-recaptcha"),
                await page.$eval('input[type=submit]', el => el.click())
            ]); 
        }
    
     
       const Result =  await page.evaluate(()=>{
          var tele =document.querySelector('.tel>span')!=null ? document.querySelector('.tel>span').textContent : "not exist";
          var brand =document.querySelector('.org>a')!=null ? document.querySelector('.org>a').textContent.trim() : "not exist";
          var email = document.querySelector('.detail-btn-email')!=null ? document.querySelector(".detail-btn-email").href.substring(7,document.querySelector(".detail-btn-email").href.length) : "not exist";
        
          return {
              tele : tele,
              email : email,
              brand : brand
          }
        
        });
        AllBrands.push(Result);
    }
    
    /// write email in text file
    var writeStream = fs.createWriteStream("data.txt");
    
    AllBrands.map(item=>{
     if(item.email!="not exist"){
        writeStream.write(item.email+"\n");
      }
    })
    
    writeStream.end();
    
    
    ////////////////////////////// to Excel file
    
    const wb = XLSX.utils.book_new();                     // create workbook
    const ws = XLSX.utils.json_to_sheet(AllBrands);            // convert data to sheet
    XLSX.utils.book_append_sheet(wb, ws, 'users_sheet');  // add sheet to workbook
    
    const filename = "data.xlsx";
    const wb_opts = {bookType: 'xlsx', type: 'binary'};   // workbook options
    XLSX.writeFile(wb, filename, wb_opts);                // write workbook file
    
    const stream = fs.createReadStream(filename);         // create read stream
    ////////***************************************************///////////////////////////////////
    
 }
    
module.exports = {getPagesData}