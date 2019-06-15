const express =  require('express');
//const app =  express();
const app = require('./app');

var fs = require('fs');

var   jsongezobj = {};
var sysstatobj ={};
const os = require('os');



const csvFilePath='gez.txt'
var   repo= [];

app.use(express.json());

const cpus = [
    {id: 1, name: 'amd1'},
    {id: 2, name: 'amd2'},
    {id: 3, name: 'amd3'}
];



//---------------mongo setting @params ------------------------------
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var dbo={}; // client 
var dbsysSta={}; // client 
// Connection URL
const url = 'mongodb://localhost:27017/';
 
// Database Name
const dbName = 'mydb';

//-----------------------emiiter ----------------------------------
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();


myEmitter.on('file-changed', () => {
  console.log('Gez file has been modified...read file again ...');
  readgezfile();
});

myEmitter.on('on-db-connected', () => {
  console.log(' ...on-db-connected .....go to readfile.....');
  readgezfile();
});


var callemmiter= function(emitname){
	myEmitter.emit(emitname)	;
}


fs.watchFile('gez.txt', (curr, prev) => {
  console.log(`the current mtime is: ${curr.mtime}`);
  console.log(`the previous mtime was: ${prev.mtime}`);
  myEmitter.emit('file-changed');
});


function readgezfile (){
	
	const csv = require('csvtojson')
	//csv(startmongo(),{
		csv({
		noheader:false,
		 headers: ['header1','header2','header3','header4','header5','header6','header7','header8','header9','header10','header11','header12','header13','header14'],
		//output: "csv",
		delimiter: ["|"]
	}).fromFile(csvFilePath).then((jsongezobj) => {
		//console.log('etrexeeee')
		console.log('---read file completed-----');
		//const gx = [].concat(jsongezobj);
		repo = jsongezobj;
		//repo.push(gx);
		
		//insertcolentry(false,'geznums',repo);
	} );
	
}



/* route example of expressjs  */
app.get('/',(req,res) => {	 
    res.send('hi the res');  
  var colect = 'geznums';
  var crit = { projection: { 'header4' : 'ilias' } };
  findcolentry(colect,crit);
	
})



/* route example of expressjs  */
app.get('/index',(req,res) => {	 
    res.sendFile(__dirname + '/index.html') 
})


/* route example of expressjs  */
app.get('/gez',(req,res) => {
    console.log('-----------------get gez-----------------------');
	let cc='';	 
	 for (var  key in  repo) {
        //console.log(spgez[key])
        cc +=  '<ul>' + key ;
		for(var attr in repo[key]){
			cc +=  '<li>' + ' -- ' +  repo[key][attr]  + '</li>' ;
		}
		cc +=  '</ul>';
      }
    //console.log(repo);
   // res.send( cc);
	res.send( JSON.stringify(repo) );
})


app.get('/gez/:id',(req,res) => {
    console.log(req.params);    
    let spgez =  repo.find( c => c.header4 ===  req.params.id)
    console.log('-----------sasasas--------------------'+spgez);   
    let cc="";
    for (var  key in  spgez) {
        //console.log(spgez[key])
        cc +=  '<li>' + key +' : '+ spgez[key] + '</li>';
      }
      if(cc.length ===0){
        res.send('no rsult found ');
      }else{
        res.send(cc);
      }            
    
})



app.get('/system/cpus', (req,res) =>{
    res.send( cpus);
});

app.get('/system/cpus/:id', (req,res) =>{
    
   const  cpu =  cpus.find(cp => cp.id === parseInt(req.params.id))   
   //404 not found 
   if(!cpu)  res.status(404).send('Cpu with given ID was not found ')

   res.send(cpu);
});

app.post('/system/cpus/', (req,res) => {
    const  cpu = {
        id: cpus.length +1,
        name: req.body.name
    };

    cpus.push(cpu);
    res.send(cpu);
});


//---------------mongo setting @params ------------------------------
/*

						MONGO 


*/
function startmongo(){
		// Use connect method to connect to the server
		MongoClient.connect(url, { useNewUrlParser: true } ,function(err, db) {
		
		assert.equal(null, err);
		console.log("\n ***********starting mongo connection ************** \n");
		console.log("\n Connected successfully to server dbName="+dbName+"\n");
		//  console.log(db);
		dbo = db.db("mydb");
		
		//console.log(db)
	
		//dbGen = db;
		//isCon = true;
		  
	   
	   /*	
			Create MongoDB Collections 
	   */
		dbo.createCollection("geznums", function(err, res) {
			if (err) throw err;
			console.log("Collection:"+ "geznums"+" created!");
			//db.close();
		});				
		
		dbo.createCollection("sysstatus", function(err, res) {
			if (err) throw err;
			console.log("Collection:"+ "sysstatus"+" created!");
			//db.close();
		});	

		callemmiter('on-db-connected');
		
	  	//db.close();
		  
	});
	
};
function insertcolentry(singleentry,colname,insobj){

	const options = { "upsert": true };

	if(singleentry === true){		
		/*
		dbo.collection(colname).insertOne(insobj, function(err, res) {
			if (err) throw err;
			console.log("Number of documents inserted: " + res.insertedCount +'  _id='+res.insertedId);   
		});		

		sysstatobj._id = new Date();	
	sysstatobj.totmem = os.totalmem();
	sysstatobj.fremem = os.freemem();
	sysstatobj.platf = os.platform();


		*/		
		dbo.collection(colname).updateOne({ }, {$set:{ 'totmem': insobj.totmem, 'fremem': insobj.fremem,  'platf': insobj.platf }},options).then(result => {
			const { matchedCount, modifiedCount } = result;
			if(matchedCount && modifiedCount) {
			  console.log(`Successfully added a new review.`)
			}
		  })
		  .catch(err => console.error(`Failed to add review: ${err}`));
		
		
		//dbo.collection(colname).dropIndex();
	}
	else{
		dbo.collection(colname).insertMany(insobj, function(err, res) {
			if (err) throw err;
			console.log("Number of documents inserted: " + res.insertedCount + ' _id='+res.insertedIds );   
		});
	}
}

function findcolentry (collection,criteria){
	 //dbo.collection(collection).findOne({header4:'ilias'}, function(err, item) {
      //console.log(item)
	  //dbo.collection("geznums").find({header4: 'ilias'}, { projection: {  header1: 1 } }).toArray(function(err, result) {
		 dbo.collection("geznums").find({"header4": "ilias"},{ projection: {  "header1" : 0 ,"header10" : 0 } } ).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    
	});	
}

getsysstat();

function  getsysstat (){

setInterval(function() {      
	console.log('---'+new Date() + '----------');	
	//sysstatobj._id = new Date();	
	sysstatobj.totmem = bytesToSize(os.totalmem());
	sysstatobj.fremem = bytesToSize(os.freemem());
	sysstatobj.platf = os.platform();
	console.log(sysstatobj) ;
	insertcolentry(true,'sysstatus',sysstatobj);

}, 3000);

}


function bytesToSize(bytes) {
	var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes == 0) return '0 Byte';
	var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
 };


// port 
const port =  process.env.PORT || 3000;
//app.listen(port, () => readgezfile() 
app.listen(port, () => startmongo() 
);

exports.getsysstat = sysstatobj;


