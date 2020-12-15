const FormatArray =(array)=>{
    var allURLS =[];
    array.map(item=>{
       //  allURLS.push();
       for(var i=0;i<10;i++){
          if(typeof(item[i])!="undefined"){
            allURLS.push(item[i])
          }
       }
    })
   
   return allURLS;
}


module.exports = {FormatArray}