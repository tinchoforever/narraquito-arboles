var nodes, edges;

d3.csv('family.csv',function(data){


  //creo los nodos de todos 
  var familyMembers = data.map(function(f,i){
    return {
    "type":'person',"id":'p'+i,
    "name":f.name,
    "profession": "housewife",
    "sex":'f',
    "image": "marge.png",
    "relationBase": f};  
  });
  

  var familyLink = [];

  var createFamilyForDown = function(r){
    var membersDown = [];
    var id = familyLink.length + 1;
    membersDown.push(r.name);
    return {"type":'family',"id":'f'+id,"name":'', "image":"","direction":'down', 
            'createdFor': r.name, members: {down:membersDown,up:[],same:[]}};
  };

var createFamilyForSame = function(r){
    var membersUp = [];
    var id = familyLink.length + 1;
    membersUp.push(r.name);
    return {"type":'family',"id":'f'+id,"name":'', "image":"","direction":'down', 
            'createdFor': r.name, members: {down:[],up:membersUp,same:membersUp}};
  };

  var getFamilyfor = function(n,d){
    for (var i = 0; i < familyLink.length; i++) {
      var l = familyLink[i];
      var members = [];
      if (d == 'down'){
        members = l.members.down;
      }
      else if (d == 'up'){
        members = l.members.up;
      } 
      else if (d == 'same'){
        members = l.members.same; 
      }

      var family;

      //Si lo encuentro, quier decir que hay relacion.
      members.map(function(member){
        if (member == n) family = l
        // family = l
      });


      if (family){
        break;
      }





    }
    return family;

  }

  var getMember = function(r){
    var m;
    for (var i = 0; i < familyMembers.length; i++) {
      if (familyMembers[i].name == r){
        m = familyMembers[i];
        break;

      }
    }
    return m ;
  }

  var getSourceAndTarget = function(r,i){

      //Si no tiene relaciones, solo lo creo a el y a su familia
      var relation ;
      //Tiene
      if (r.relationBase.source ==''){
        var f = createFamilyForDown(r,i);
        familyMembers.push(f);
        familyLink.push(f);
        //siempre lo creo como hijo.
        relation = {id:1,source:f.id,target:r.id,type:'children'};
        
      }
      else {
        //tiene relacion con una persona :-o;
        // Quien es la persona?
        var memberLinked = getMember(r.relationBase.source);
        //la persona que pusimos es hijo
        if (r.relationBase.relationType =='padre'){
          //down
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.source,'down');
          var elHijo = memberLinked;
          var  elPadre=  r;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForDown(elHijo);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            newFamiliy.members.up.push(elPadre.name);
            newFamiliy.members.same.push(elPadre.name);
            
            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationFather = {id:z,source:newFamiliy.id,target:elHijo.id,type:'children'};
            //Ahora agrego al up, como como casado
            relationSon = {id:z+1,source:newFamiliy.id,target:elPadre.id,type:'married'};
            relations.push(relationFather);
            relations.push(relationSon);

          }
          else {
            f.members.up.push(r.name);
            f.members.same.push(r.name);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'married'};
          }

          //agrego la relacion


        }
        else if (r.relationBase.relationType =='pareja'){
          
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.source,'same');
          var laPareja = memberLinked;
          var laEmparejada=  r;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForSame(laEmparejada);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            
            newFamiliy.members.up.push(laPareja.name);
            newFamiliy.members.same.push(laPareja.name);
            
            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationPareja = {id:z,source:newFamiliy.id,target:laPareja.id,type:'married'};
            //Ahora agrego al up, como como casado
            relationEmparejada = {id:z+1,source:newFamiliy.id,target:laEmparejada.id,type:'married'};
            relations.push(relationPareja);
            relations.push(relationEmparejada);

          }
          else {
            f.members.same.push(r.name);
            f.members.up.push(r.name);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'married'};
          }



        }
        else if (r.relationBase.relationType =='hijo'){
          //down
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.source,'up');
          var elHijo = r;
          var  elPadre=  memberLinked;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForDown(elHijo);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            newFamiliy.members.down.push(elPadre.name);
            
            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationSon = {id:z,source:newFamiliy.id,target:elHijo.id,type:'children'};
            //Ahora agrego al up, como como casado
            relationFather = {id:z+1,source:newFamiliy.id,target:elPadre.id,type:'married'};
            relations.push(relationFather);
            relations.push(relationSon);

          }
          else {
            f.members.down.push(r.name);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'child'};
          }




        }

        else if (r.relationBase.relationType =='hermano'){
          //down
          //hay una relacion donde la persoan que linkeo sea hijo de ?
          var f = getFamilyfor(r.relationBase.source,'down');
          var elHijo = r;
          var  elPadre=  memberLinked;
          //Si no hay la creo
          if (!f){
            //y los agrego a los dos.
            var newFamiliy = createFamilyForDown(elHijo);
            familyMembers.push(newFamiliy);
            familyLink.push(newFamiliy);
            newFamiliy.members.down.push(elPadre.name);
            
            var z = relations.length +1;
            
            //Ahora agrego al down, como hijo
            relationSon = {id:z,source:newFamiliy.id,target:elHijo.id,type:'children'};
            //Ahora agrego al up, como como casado
            relationFather = {id:z+1,source:newFamiliy.id,target:elPadre.id,type:'children'};
            relations.push(relationFather);
            relations.push(relationSon);

          }
          else {
            f.members.down.push(r.name);
            var z = relations.length +1;
            relation = {id:z,source:f.id,target:r.id,type:'child'};
          }
          



        }
        
        
      }
      return relation;
        
      
  }
  var relations =[];
  familyMembers.map(function(r,i){

      var direction =  getSourceAndTarget(r,i);
      if (direction){
        relations.push(direction);  
      }
      

  })

  nodes = familyMembers;
  edges = relations;
  console.log(edges);
  initTree();
  //each person needs a node
//AND each family needs a node

//First Member.
//Add member and family root.

});




// var nodes = [

//   //Homer and Marge's Family
//   {"type":'family',"id":'f1',"name":'', "image":""},// Ahmad
//   {"type":'person',"id":'p1',"name":'Marge Simpson',"age": 39, "profession": "housewife","sex":'f',"image": "marge.png"},
//   // {"type":'person',"id":'p2',"name":'Homer Simpson',"age": 36, "profession": "safety inspector","sex":'m',"image": "homer.png"},
//   {"type":'person',"id":'p3',"name":'Bart Simpson',"age": 10 ,"sex":'m',"image": "bart.png"},
//   // {"type":'person',"id":'p4',"name":'Lisa Simpson',"age": 8 ,"sex":'f',"image": "lisa.png"},
//   // {"type":'person',"id":'p5',"name":'Maggie Simpson',"age": 1,"sex":'f',"image": "maggie.png"},
//   // {"type":'person',"id":'p6',"name":"Santa's Little Helper","age": 2,"sex":'m',"image": "santa.png"},


//   //Homer and Marge's Family
//   {"type":'family',"id":'f4',"name":'', "image":""},// Ahmad
//   {"type":'person',"id":'p33',"name":'Barta Simpsona',"age": 112 ,"sex":'z',"image": "barta.png"},
//   // //Abraham and Mona's Family
//   // {"type":'family',"id":'f3',"name":'', "image":""},// Nasr
//   // {"type":'person',"id":'p8',"name":'Abraham Simpson',"age": 83, "profession": "retired farmer","sex":'m',"image": "grampa.png"},
//   // {"type":'person',"id":'p9',"name":'Mona Simpson',"age": 81, "profession": "activist","sex":'f',"image": "mona.png"},
//   // {"type":'person',"id":'p7',"name":'Herb Simpson',"age": 44, "profession": "car salesman","sex":'m',"image": "herb.png"},

//   // //Clancy and Jacqueline's Family
//   // {"type":'family',"id":'f4',"name":'', "image":""},// Nasr
//   // {"type":'person',"id":'p10',"name":'Clancy Bouvier',"age": 75, "profession": "air steward","sex":'m',"image": "dad.png"},
//   // {"type":'person',"id":'p11',"name":'Jacqueline Bouvier',"age": 71, "profession": "housewife","sex":'f',"image": "mum.png"},
//   // {"type":'person',"id":'p13',"name":'Patty Bouvier',"age": 41, "profession": "receptionist","sex":'f',"image": "selma.png"},

//   // //Selma's Family
//   // {"type":'family',"id":'f5',"name":'', "image":""},
//   // {"type":'person',"id":'p12',"name":'Selma Bouvier',"age": 41, "profession": "secretary","sex":'f',"image": "patty.png"},
//   // {"type":'person',"id":'p14',"name":'Ling Bouvier',"age": 3,"sex":'f',"image": "ling.png"}


// ]

// //currently there are four types of links
// //family - family id is always the source
// //married - link between two person ids
// //adopted and divorced - behave like family but
// //dotted line for divorced, gold line for adopted

// var edges = [
//   // //FAMILY 1 - Ahmad Asfoor ..!
//   {id:1,source:'f1',target:'p1',type:'married'},
//   // {id:2,source:'f1',target:'p2',type:'married'},
//   {id:3,source:'f1',target:'p3',type:'child'},
//   // {id:4,source:'f1',target:'p4',type:'child'},
//   // {id:5,source:'f1',target:'p5',type:'child'},
//   // {id:6,source:'f1',target:'p6',type:'child'},

//   // //FAMILY 1 - Ahmad Asfoor ..!
//   {id:200,source:'f4',target:'p33',type:'married'},
//   {id:200,source:'f4',target:'p3',type:'married'},
//   // {id:2,source:'f1',target:'p2',type:'married'},
//   // //FAMILY 2 - Nasr Asfoor...
//   // {id:8,source:'f3',target:'p8',type:'married'},
//   // {id:9,source:'f3',target:'p9',type:'married'},
//   // {id:10,source:'f3',target:'p2',type:'child'},
//   // {id:11,source:'f3',target:'p7',type:'child'},

//   // //FAMILY 3 - BOUVIERS
//   // {id:8,source:'f4',target:'p10',type:'married'},
//   // {id:9,source:'f4',target:'p11',type:'married'},
//   // {id:10,source:'f4',target:'p1',type:'child'},
//   // {id:10,source:'f4',target:'p12',type:'child'},
//   // {id:10,source:'f4',target:'p13',type:'child'},

//   // {id:8,source:'f5',target:'p12',type:'married'},
//   // {id:10,source:'f5',target:'p14',type:'child'}

// ]

